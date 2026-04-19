import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Trophy, PieChart as PieChartIcon, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ExplorePulseDialog } from "./ExplorePulseDialog";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f128bc"];

interface PulseEvent {
  id: string;
  type: "bid_confirmed" | "bid_new" | "product_new" | "order_delivered";
  title: string;
  subtitle: string;
  value?: string;
  timestamp: string;
}

export function MarketPulse() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string }>>({});
  const [ticker, setTicker] = useState<PulseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: o }, { data: b }] = await Promise.all([
        supabase.from("products").select("name, category, price_per_unit, demand_score, location"),
        supabase.from("orders").select("buyer_id, total_price, quantity"),
        supabase
          .from("bids")
          .select("id, bid_price, quantity, created_at, status, product_id")
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setProducts(p ?? []);
      setOrders(o ?? []);

      const initialEvents: PulseEvent[] = (b ?? []).map((x) => ({
        id: x.id,
        type: "bid_confirmed",
        title: "Bid confirmed",
        subtitle: `${x.quantity} units`,
        value: `₹${Number(x.bid_price).toLocaleString()}`,
        timestamp: x.created_at,
      }));
      setTicker(initialEvents);

      const buyerIds = Array.from(new Set((o ?? []).map((x) => x.buyer_id)));
      if (buyerIds.length) {
        const { data: pr } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", buyerIds);
        setProfiles(
          Object.fromEntries((pr ?? []).map((x) => [x.id, { full_name: x.full_name ?? "Buyer" }])),
        );
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("market-pulse-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const bid = payload.new as Record<string, unknown>;
          setTicker(
            (t) =>
              [
                {
                  id: bid.id as string,
                  type: "bid_new",
                  title: "New bid placed",
                  subtitle: `${bid.quantity} units`,
                  value: `₹${Number(bid.bid_price).toLocaleString()}`,
                  timestamp: new Date().toISOString(),
                },
                ...t,
              ].slice(0, 15) as PulseEvent[],
          );
        } else if (
          payload.eventType === "UPDATE" &&
          (payload.new as Record<string, unknown>).status === "accepted"
        ) {
          const bid = payload.new as Record<string, unknown>;
          setTicker(
            (t) =>
              [
                {
                  id: bid.id as string,
                  type: "bid_confirmed",
                  title: "Bid confirmed!",
                  subtitle: `${bid.quantity} units`,
                  value: `₹${Number(bid.bid_price).toLocaleString()}`,
                  timestamp: new Date().toISOString(),
                },
                ...t,
              ].slice(0, 15) as PulseEvent[],
          );
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          const product = payload.new as Record<string, unknown>;
          setTicker(
            (t) =>
              [
                {
                  id: product.id as string,
                  type: "product_new",
                  title: "New crop listed",
                  subtitle: product.name as string,
                  value: `₹${product.price_per_unit}/unit`,
                  timestamp: new Date().toISOString(),
                },
                ...t,
              ].slice(0, 15) as PulseEvent[],
          );
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if ((payload.new as Record<string, unknown>).status === "delivered") {
          const order = payload.new as Record<string, unknown>;
          setTicker(
            (t) =>
              [
                {
                  id: order.id as string,
                  type: "order_delivered",
                  title: "Order delivered",
                  subtitle: `Finalized`,
                  value: "✅",
                  timestamp: new Date().toISOString(),
                },
                ...t,
              ].slice(0, 15) as PulseEvent[],
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cropDemand = useMemo(() => {
    const m: Record<string, number> = {};
    products.forEach((p) => {
      // Create a key based on crop name and its generalized location (State/District) if available
      const loc = p.location ? p.location.split(",").pop().trim() : "Unknown";
      const key = `${p.name} (${loc})`;
      m[key] = (m[key] || 0) + (p.demand_score || 50);
    });

    return Object.entries(m)
      .map(([name, demand]) => ({ name, demand }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 6); // Top 6 for pie chart
  }, [products]);

  const topBuyers = useMemo(() => {
    const m: Record<string, number> = {};
    orders.forEach((o) => {
      m[o.buyer_id] = (m[o.buyer_id] ?? 0) + Number(o.total_price);
    });
    return Object.entries(m)
      .map(([id, total]) => ({ id, total, name: profiles[id]?.full_name || "Buyer" }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders, profiles]);

  if (loading)
    return (
      <Card className="p-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Market Discovery
          </h2>
          <p className="text-sm text-muted-foreground">
            Analyze trends, demand shifts, and user activity
          </p>
        </div>
        <div className="w-full md:w-auto">
          <ExplorePulseDialog />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-3">
            <PieChartIcon className="h-5 w-5 text-primary" /> Regional Crop Demand
          </h3>
          {cropDemand.length === 0 ? (
            <div className="text-muted-foreground text-sm flex h-[200px] items-center justify-center">
              Insufficient live regional data
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDemand}
                    dataKey="demand"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {cropDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                    formatter={(value: number) => [`${value} Index Score`, "Demand"]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-accent" /> Top buyers
          </h3>
          {topBuyers.length === 0 ? (
            <div className="text-muted-foreground text-sm">No orders yet.</div>
          ) : (
            <div className="space-y-2">
              {topBuyers.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 truncate font-medium">{b.name}</div>
                  <div className="font-bold">₹{b.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-success" /> Recent Market Activity
            <Badge variant="outline" className="ml-2 bg-success/10 text-success border-success/30">
              realtime
            </Badge>
          </h3>
          {ticker.length === 0 ? (
            <div className="text-muted-foreground text-sm">Waiting for activity…</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {ticker.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card animate-fade-in hover:border-primary/50 transition-colors"
                >
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ev.type === "bid_confirmed" || ev.type === "order_delivered"
                            ? "bg-emerald-500"
                            : ev.type === "product_new"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      />
                      <div className="font-semibold">{ev.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-4">
                      {ev.subtitle} · {new Date(ev.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="font-bold text-primary">{ev.value}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
