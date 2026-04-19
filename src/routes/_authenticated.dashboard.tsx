import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2,
  Sprout,
  Gavel,
  Truck,
  Package,
  TrendingUp,
  Map as MapIcon,
  BarChart3,
  Activity,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddCropDialog } from "@/components/AddCropDialog";
import { useAuth } from "@/hooks/useAuth";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { toast } from "sonner";
import { WeatherMap } from "@/components/dashboard/WeatherMap";
import { SoilHealthCard } from "@/components/dashboard/SoilHealthCard";
import { MarketTrendsChart } from "@/components/dashboard/MarketTrendsChart";
import { BidStatsChart } from "@/components/dashboard/BidStatsChart";
import { JobsMap } from "@/components/dashboard/JobsMap";
import { MarketPulse } from "@/components/dashboard/MarketPulse";

import { Database } from "@/integrations/supabase/types";

type DashboardBid = Database["public"]["Tables"]["bids"]["Row"] & {
  products: {
    name: string;
    image_urls: string[];
    unit: string;
    location: string;
  } | null;
};

type DashboardOrder = Database["public"]["Tables"]["orders"]["Row"] & {
  products: {
    name: string;
    location: string;
  } | null;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <Card className="p-5 gradient-card">
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  </Card>
);

function Dashboard() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<ProductCardData[]>([]);
  const [myBids, setMyBids] = useState<DashboardBid[]>([]);
  const [availableOrders, setAvailableOrders] = useState<DashboardOrder[]>([]);

  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (role === "farmer") {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });
      setMyProducts((data ?? []) as ProductCardData[]);
    } else if (role === "buyer") {
      const { data } = await supabase
        .from("bids")
        .select("*, products(name, image_urls, unit, location)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      setMyBids(data ?? []);
    } else if (role === "transporter") {
      const { data } = await supabase
        .from("orders")
        .select("*, products(name, location)")
        .is("transporter_id", null)
        .order("created_at", { ascending: false });
      setAvailableOrders(data ?? []);
    }
    setLoading(false);
  }, [user, role]);

  useEffect(() => {
    load();
  }, [load]);

  const claimOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("orders")
      .update({ transporter_id: user.id, status: "assigned" })
      .eq("id", orderId);
    if (error) toast.error(error.message);
    else {
      toast.success("Order claimed!");
      load();
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 drop-shadow-lg">
          <div>
            <h1 className="font-display text-4xl font-bold">Dashboard</h1>
            <p className="text-white/80 capitalize font-medium">Welcome back · {role}</p>
          </div>
          {role === "farmer" && <AddCropDialog onCreated={load} />}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto bg-black/40 border-white/10 backdrop-blur-md">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 text-white/70"
            >
              <Package className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            {role === "farmer" && (
              <TabsTrigger
                value="field"
                className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 text-white/70"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Field & Soil
              </TabsTrigger>
            )}
            {role === "buyer" && (
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 text-white/70"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            )}
            {role === "transporter" && (
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 text-white/70"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Jobs Map
              </TabsTrigger>
            )}
            <TabsTrigger
              value="pulse"
              className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 text-white/70"
            >
              <Activity className="h-4 w-4 mr-2" />
              Market Pulse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {role === "farmer" && (
              <>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    icon={Sprout}
                    label="Active listings"
                    value={
                      myProducts.filter((p) => (p as ProductCardData).status === "available").length
                    }
                    color="bg-primary/15 text-primary"
                  />
                  <StatCard
                    icon={Package}
                    label="Sold"
                    value={
                      myProducts.filter((p) => (p as ProductCardData).status === "sold").length
                    }
                    color="bg-success/15 text-success"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Avg. demand score"
                    value={
                      myProducts.length
                        ? Math.round(
                            myProducts.reduce((s, p) => s + (p.demand_score ?? 50), 0) /
                              myProducts.length,
                          )
                        : "—"
                    }
                    color="bg-accent/20 text-accent-foreground"
                  />
                </div>
                <h2 className="font-display text-2xl font-bold mb-4">My crops</h2>
                {myProducts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="text-5xl mb-3">🌾</div>
                    <p className="text-muted-foreground mb-4">No crops listed yet.</p>
                    <AddCropDialog onCreated={load} />
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myProducts.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </>
            )}

            {role === "buyer" && (
              <>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    icon={Gavel}
                    label="Active bids"
                    value={myBids.filter((b) => b.status === "pending").length}
                    color="bg-primary/15 text-primary"
                  />
                  <StatCard
                    icon={Package}
                    label="Accepted"
                    value={myBids.filter((b) => b.status === "accepted").length}
                    color="bg-success/15 text-success"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Total bids"
                    value={myBids.length}
                    color="bg-accent/20 text-accent-foreground"
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-bold">My bids</h2>
                  <Link to="/marketplace">
                    <Button variant="outline">Browse marketplace</Button>
                  </Link>
                </div>
                {myBids.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">You haven't placed any bids yet.</p>
                    <Link to="/marketplace">
                      <Button variant="hero">Discover crops</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myBids.map((b) => (
                      <Link key={b.id} to="/product/$id" params={{ id: b.product_id }}>
                        <Card className="p-4 flex items-center gap-4 hover:shadow-elegant transition-smooth">
                          <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                            {b.products?.image_urls?.[0] ? (
                              <img
                                src={b.products.image_urls[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-2xl">
                                🌾
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{b.products?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {b.products?.location} · {b.quantity} {b.products?.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">₹{b.bid_price}</div>
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
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {role === "transporter" && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <StatCard
                    icon={Truck}
                    label="Available jobs"
                    value={availableOrders.length}
                    color="bg-primary/15 text-primary"
                  />
                  <StatCard
                    icon={Package}
                    label="Open routes"
                    value={availableOrders.length}
                    color="bg-accent/20 text-accent-foreground"
                  />
                </div>
                <h2 className="font-display text-2xl font-bold mb-4">Available delivery jobs</h2>
                {availableOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No unassigned orders right now.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {availableOrders.map((o) => (
                      <Card key={o.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold">{o.products?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Pickup: {o.products?.location} · {o.quantity} units · ₹{o.total_price}
                          </div>
                        </div>
                        <Button variant="hero" onClick={() => claimOrder(o.id)}>
                          Claim job
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Quick Tips and Resources section added to the bottom of Overview */}
            <div className="mt-12 border-t pt-8">
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Quick Tips & Resources
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-5 hover:shadow-elegant transition-smooth border-l-4 border-l-primary flex flex-col justify-between bg-card/50">
                  <div>
                    <BookOpen className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add a detailed description, phone number, and location to build trust in the
                      continuous marketplace.
                    </p>
                  </div>
                  <Link to="/profile">
                    <div className="mt-2 text-sm font-medium text-primary hover:underline cursor-pointer">
                      Profile Settings →
                    </div>
                  </Link>
                </Card>

                <Card
                  onClick={() => setActiveTab("pulse")}
                  className="p-5 hover:shadow-elegant transition-smooth border-l-4 border-l-accent flex flex-col justify-between bg-card/50 cursor-pointer group"
                >
                  <div>
                    <Activity className="h-6 w-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-2">Market Pulse</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check the Market Pulse tab to see what crops are currently in high demand in
                      your region.
                    </p>
                  </div>
                  <div className="mt-2 text-sm font-medium text-accent flex items-center gap-1 group-hover:underline">
                    Explore pulse <TrendingUp className="h-3 w-3" />
                  </div>
                </Card>

                {role === "farmer" && (
                  <Card
                    onClick={() => setActiveTab("field")}
                    className="p-5 hover:shadow-elegant transition-smooth border-l-4 border-l-success flex flex-col justify-between bg-card/50 cursor-pointer group"
                  >
                    <div>
                      <Sprout className="h-6 w-6 text-success mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Soil Health Tools</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Log your latest soil test results to get AI-driven fertilizer
                        recommendations.
                      </p>
                    </div>
                    <div className="mt-2 text-sm font-medium text-success group-hover:underline">
                      Open Field tab →
                    </div>
                  </Card>
                )}

                {role === "buyer" && (
                  <Card
                    onClick={() => setActiveTab("analytics")}
                    className="p-5 hover:shadow-elegant transition-smooth border-l-4 border-l-success flex flex-col justify-between bg-card/50 cursor-pointer group"
                  >
                    <div>
                      <Gavel className="h-6 w-6 text-success mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Bidding Strategies</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn how to negotiate effectively with farmers using our smart bidding
                        guide.
                      </p>
                    </div>
                    <div className="mt-2 text-sm font-medium text-success group-hover:underline">
                      View Analytics →
                    </div>
                  </Card>
                )}

                {role === "transporter" && (
                  <Card
                    onClick={() => setActiveTab("map")}
                    className="p-5 hover:shadow-elegant transition-smooth border-l-4 border-l-success flex flex-col justify-between bg-card/50 cursor-pointer group"
                  >
                    <div>
                      <Truck className="h-6 w-6 text-success mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Route Optimization</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Combine multiple pickups in the same operational area to maximize your
                        earnings.
                      </p>
                    </div>
                    <div className="mt-2 text-sm font-medium text-success group-hover:underline">
                      View Jobs Map →
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {role === "farmer" && user && (
            <TabsContent value="field" className="space-y-5">
              <WeatherMap userId={user.id} />
              <SoilHealthCard userId={user.id} />
            </TabsContent>
          )}

          {role === "buyer" && user && (
            <TabsContent value="analytics" className="space-y-5">
              <MarketTrendsChart />
              <BidStatsChart buyerId={user.id} />
            </TabsContent>
          )}

          {role === "transporter" && (
            <TabsContent value="map">
              <JobsMap />
            </TabsContent>
          )}

          <TabsContent value="pulse">
            <MarketPulse />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
