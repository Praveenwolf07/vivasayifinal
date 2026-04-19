import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Truck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ReviewDialog } from "@/components/ReviewDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

import { optimizeRoute } from "@/server/optimize-route";
import { sendNotification } from "@/server/notifications";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  products: {
    name: string;
    location: string;
    image_urls: string[];
  } | null;
};

const STATUSES = ["created", "assigned", "in_transit", "delivered", "cancelled"];

export const Route = createFileRoute("/_authenticated/orders")({
  component: Orders,
});

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, products(name, location, image_urls)")
      .or(`buyer_id.eq.${user.id},farmer_id.eq.${user.id},transporter_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as Database["public"]["Enums"]["order_status"] })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Status updated");

      // If status is delivered, notify all parties
      if (status === "delivered") {
        const order = orders.find((o) => o.id === id);
        if (order) {
          const participants = [
            { id: order.farmer_id, role: "farmer" },
            { id: order.buyer_id, role: "buyer" },
            { id: order.transporter_id, role: "transporter" },
          ].filter((p) => p.id); // Filter out null IDs (like transporter if not assigned)

          participants.forEach((p) => {
            sendNotification({
              data: {
                type: "order_delivered",
                targetUserId: p.id!,
                payload: {
                  productName: (order.products as Record<string, unknown>)?.name || "Order",
                  role: p.role,
                },
              },
            }).catch((err) => console.error(`Failed to notify ${p.role}:`, err));
          });
        }
      }
    }
  };

  const aiOptimize = async (o: Order) => {
    setAiLoading(o.id);
    try {
      const data = await optimizeRoute({
        data: {
          pickup: o.products?.location,
          quantity: o.quantity,
          total_price: o.total_price,
        },
      });
      setAiLoading(null);
      toast.success(`ETA ~${data.eta_hours}h · est. cost ₹${data.cost_estimate} · ${data.tip}`, {
        duration: 8000,
      });
    } catch (error) {
      setAiLoading(null);
      toast.error("AI failed");
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

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
      }}
    >
      <Navbar />
      <div className="container py-8 text-white">
        <h1 className="font-display text-4xl font-bold mb-8 flex items-center gap-3 drop-shadow-lg">
          <Truck className="h-8 w-8 text-white" /> Orders
        </h1>
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const isParticipant = [o.buyer_id, o.farmer_id, o.transporter_id].includes(user?.id);
              return (
                <Card key={o.id} className="p-5">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {o.products?.image_urls?.[0] ? (
                        <img
                          src={o.products.image_urls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🌾</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-semibold text-lg">{o.products?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {o.quantity} units · ₹{o.total_price} · pickup {o.products?.location}
                      </div>
                    </div>
                    <Badge
                      className="capitalize"
                      variant={o.status === "delivered" ? "default" : "secondary"}
                    >
                      {o.status.replace("_", " ")}
                    </Badge>
                    {isParticipant && (
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => aiOptimize(o)}
                      disabled={aiLoading === o.id}
                    >
                      <Sparkles className="h-4 w-4" /> {aiLoading === o.id ? "..." : "AI route"}
                    </Button>
                  </div>
                  {o.tracking_notes && (
                    <p className="mt-3 text-sm text-muted-foreground">{o.tracking_notes}</p>
                  )}
                  {o.status === "delivered" && (
                    <div className="flex gap-2 w-full mt-4 border-t pt-4">
                      {user?.id === o.farmer_id && (
                        <>
                          <ReviewDialog
                            targetUserId={o.buyer_id}
                            orderId={o.id}
                            productId={o.product_id}
                            roleContext="farmer_rating_buyer"
                            triggerText="Rate Buyer"
                          />
                          {o.transporter_id && (
                            <ReviewDialog
                              targetUserId={o.transporter_id}
                              orderId={o.id}
                              productId={o.product_id}
                              roleContext="farmer_rating_transporter"
                              triggerText="Rate Transporter"
                            />
                          )}
                        </>
                      )}
                      {user?.id === o.buyer_id && (
                        <>
                          <ReviewDialog
                            targetUserId={o.farmer_id}
                            orderId={o.id}
                            productId={o.product_id}
                            roleContext="buyer_rating_farmer"
                            triggerText="Rate Farmer & Product"
                          />
                          {o.transporter_id && (
                            <ReviewDialog
                              targetUserId={o.transporter_id}
                              orderId={o.id}
                              productId={o.product_id}
                              roleContext="buyer_rating_transporter"
                              triggerText="Rate Transporter"
                            />
                          )}
                        </>
                      )}
                      {user?.id === o.transporter_id && (
                        <>
                          <ReviewDialog
                            targetUserId={o.farmer_id}
                            orderId={o.id}
                            productId={o.product_id}
                            roleContext="transporter_rating_farmer"
                            triggerText="Rate Farmer (Pickup)"
                          />
                          <ReviewDialog
                            targetUserId={o.buyer_id}
                            orderId={o.id}
                            productId={o.product_id}
                            roleContext="transporter_rating_buyer"
                            triggerText="Rate Buyer (Dropoff)"
                          />
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
