import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Package,
  Calendar,
  Loader2,
  Gavel,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DemandBadge } from "@/components/DemandBadge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { suggestBid } from "@/server/suggest-bid";
import { sendNotification } from "@/server/notifications";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  quality_grade: string;
  location: string;
  harvest_date: string | null;
  image_urls: string[] | null;
  demand_score: number | null;
  ai_insights: Record<string, unknown> | null;
  status: string;
  farmer_id: string;
}
interface Bid {
  id: string;
  bid_price: number;
  quantity: number;
  message: string | null;
  status: string;
  buyer_id: string;
  created_at: string;
}

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState("");
  const [bidQty, setBidQty] = useState("");
  const [bidMsg, setBidMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const isOwner = user?.id === product?.farmer_id;
  const highest = bids[0]?.bid_price;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(p as Product | null);
      const { data: b } = await supabase
        .from("bids")
        .select("*")
        .eq("product_id", id)
        .order("bid_price", { ascending: false });
      setBids((b ?? []) as Bid[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`bids-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids", filter: `product_id=eq.${id}` },
        async () => {
          const { data: b } = await supabase
            .from("bids")
            .select("*")
            .eq("product_id", id)
            .order("bid_price", { ascending: false });
          setBids((b ?? []) as Bid[]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAiSuggest = async () => {
    if (!product) return;
    setAiSuggesting(true);
    try {
      const data = await suggestBid({
        data: {
          product: {
            name: product.name,
            category: product.category,
            price_per_unit: product.price_per_unit,
            location: product.location,
            quality_grade: product.quality_grade,
            demand_score: product.demand_score,
          },
        },
      });
      setAiSuggesting(false);

      if (data?.suggested_price) {
        setBidPrice(String(data.suggested_price));
        toast.success(
          `AI suggests ₹${data.suggested_price}/${product.unit} — ${data.reasoning ?? ""}`,
        );
      }
    } catch (e) {
      setAiSuggesting(false);
      toast.error("AI suggestion failed");
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (role !== "buyer") {
      toast.error("Only buyer accounts can place bids");
      return;
    }
    const price = parseFloat(bidPrice),
      qty = parseFloat(bidQty);
    if (!price || !qty) {
      toast.error("Enter price and quantity");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bids").insert({
      product_id: id!,
      buyer_id: user.id,
      bid_price: price,
      quantity: qty,
      message: bidMsg || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bid placed!");

    // Notify farmer about the new bid
    if (product?.farmer_id) {
      sendNotification({
        data: {
          type: "bid_placed",
          targetUserId: product.farmer_id,
          payload: {
            productName: product.name,
            bidPrice: price,
            quantity: qty,
          } as Record<string, unknown>,
        },
      }).catch(console.error);
    }

    setBidPrice("");
    setBidQty("");
    setBidMsg("");
  };

  const handleAcceptBid = async (bid: Bid) => {
    if (!product || !user) return;
    const { error: bidErr } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bid.id);
    if (bidErr) {
      toast.error(bidErr.message);
      return;
    }
    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("product_id", product.id)
      .neq("id", bid.id)
      .eq("status", "pending");
    const { error: orderErr } = await supabase.from("orders").insert({
      product_id: product.id,
      bid_id: bid.id,
      buyer_id: bid.buyer_id,
      farmer_id: product.farmer_id,
      quantity: bid.quantity,
      total_price: bid.bid_price * bid.quantity,
      status: "created",
    });
    if (orderErr) {
      toast.error(orderErr.message);
      return;
    }
    await supabase.from("products").update({ status: "sold" }).eq("id", product.id);
    toast.success("Bid accepted! Order created.");

    // Notify bidder that their bid was confirmed (accepted)
    sendNotification({
      data: {
        type: "bid_confirmed",
        targetUserId: bid.buyer_id,
        payload: {
          productName: product.name,
          totalPrice: bid.bid_price * bid.quantity,
        } as Record<string, unknown>,
      },
    }).catch(console.error);

    navigate({ to: "/orders" });
  };

  const handleRejectBid = async (bid: Bid) => {
    const { error } = await supabase.from("bids").update({ status: "rejected" }).eq("id", bid.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bid rejected");
      // Notify the bidder their bid was not accepted
      if (product) {
        sendNotification({
          data: {
            type: "bid_rejected",
            targetUserId: bid.buyer_id,
            payload: {
              productName: product.name,
            } as Record<string, unknown>,
          },
        }).catch(console.error);
      }
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
        }}
      >
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    );
  if (!product)
    return (
      <div
        className="min-h-screen bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
        }}
      >
        <Navbar />
        <div className="container py-20 text-center text-white">
          <p>Product not found.</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
      }}
    >
      <Navbar />
      <div className="container py-6 text-white text-white">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-smooth mb-6 drop-shadow-md"
        >
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* IMAGES */}
          <div>
            <Card className="aspect-[4/3] overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm">
              {product.image_urls && product.image_urls.length > 0 ? (
                <img
                  src={product.image_urls[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🌾</div>
              )}
            </Card>
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {product.image_urls.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${i === activeImg ? "border-primary" : "border-transparent"}`}
                  >
                    <img
                      src={u}
                      alt={`${product.name} ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                <Badge className="bg-soil text-soil-foreground border-0 capitalize">
                  {product.quality_grade}
                </Badge>
                <DemandBadge score={product.demand_score} />
              </div>
              <h1 className="font-display text-4xl font-bold">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground mt-2">{product.description}</p>
              )}
            </div>

            <Card className="p-5 gradient-card">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Asking price</div>
                  <div className="text-4xl font-bold text-primary">₹{product.price_per_unit}</div>
                  <div className="text-xs text-muted-foreground">per {product.unit}</div>
                </div>
                {highest && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Highest bid</div>
                    <div className="text-2xl font-bold text-accent-foreground">₹{highest}</div>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {product.location}
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {product.quantity} {product.unit}
              </div>
              {product.harvest_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Harvested {new Date(product.harvest_date).toLocaleDateString()}
                </div>
              )}
            </div>

            {product.ai_insights && (
              <Card className="p-4 border-accent/30 bg-accent/5">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-accent-foreground" /> AI Insights
                </div>
                {product.ai_insights.best_selling_window && (
                  <p className="text-sm text-muted-foreground">
                    <b>Best selling window:</b> {product.ai_insights.best_selling_window}
                  </p>
                )}
                {product.ai_insights.price_range && (
                  <p className="text-sm text-muted-foreground">
                    <b>Recommended range:</b> {product.ai_insights.price_range}
                  </p>
                )}
                {product.ai_insights.harvest_tip && (
                  <p className="text-sm text-muted-foreground">
                    <b>Tip:</b> {product.ai_insights.harvest_tip}
                  </p>
                )}
              </Card>
            )}

            {!isOwner && product.status === "available" && (
              <Card className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Gavel className="h-4 w-4" /> Place a bid
                </h3>
                <form onSubmit={handlePlaceBid} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Bid price / {product.unit}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantity ({product.unit})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={product.quantity}
                        value={bidQty}
                        onChange={(e) => setBidQty(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Message (optional)</Label>
                    <Textarea
                      rows={2}
                      value={bidMsg}
                      onChange={(e) => setBidMsg(e.target.value)}
                      placeholder="Pickup time, etc."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="hero" className="flex-1" disabled={submitting}>
                      {submitting ? "Placing..." : "Place bid"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAiSuggest}
                      disabled={aiSuggesting}
                    >
                      <Sparkles className="h-4 w-4" /> {aiSuggesting ? "..." : "AI suggest"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <Gavel className="h-5 w-5" /> Bids ({bids.length})
            <span className="text-xs font-normal text-muted-foreground ml-2">live</span>
          </h2>
          {bids.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No bids yet. Be the first!
            </Card>
          ) : (
            <div className="space-y-2">
              {bids.map((b, idx) => (
                <Card
                  key={b.id}
                  className={`p-4 flex items-center justify-between gap-4 ${idx === 0 && b.status === "pending" ? "border-primary border-2" : ""}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg">₹{b.bid_price}</span>
                      <span className="text-xs text-muted-foreground">
                        × {b.quantity} {product.unit}
                      </span>
                      {idx === 0 && b.status === "pending" && (
                        <Badge className="bg-success text-success-foreground border-0">
                          Highest
                        </Badge>
                      )}
                      <Badge
                        variant={
                          b.status === "accepted"
                            ? "default"
                            : b.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {b.status}
                      </Badge>
                    </div>
                    {b.message && <p className="text-sm text-muted-foreground mt-1">{b.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(b.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isOwner && b.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleAcceptBid(b)}>
                        <CheckCircle2 className="h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectBid(b)}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
