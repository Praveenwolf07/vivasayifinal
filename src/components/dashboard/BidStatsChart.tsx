import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Gavel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { Database } from "@/integrations/supabase/types";

type BidRow = Database["public"]["Tables"]["bids"]["Row"];

export function BidStatsChart({ buyerId }: { buyerId: string }) {
  const [bids, setBids] = useState<BidRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bids")
        .select("status, created_at, bid_price")
        .eq("buyer_id", buyerId);
      setBids(data ?? []);
      setLoading(false);
    })();
  }, [buyerId]);

  const { data, kpis } = useMemo(() => {
    const months: Record<
      string,
      { month: string; pending: number; accepted: number; rejected: number }
    > = {};
    let won = 0,
      total = 0,
      spend = 0;
    bids.forEach((b) => {
      const m = new Date(b.created_at).toLocaleDateString(undefined, { month: "short" });
      months[m] ??= { month: m, pending: 0, accepted: 0, rejected: 0 };
      const s = b.status as "pending" | "accepted" | "rejected";
      if (months[m][s] !== undefined) {
        months[m][s] += 1;
      }
      total += 1;
      if (b.status === "accepted") {
        won += 1;
        spend += Number(b.bid_price);
      }
    });
    return {
      data: Object.values(months),
      kpis: { winRate: total ? Math.round((won / total) * 100) : 0, total, spend },
    };
  }, [bids]);

  return (
    <Card className="p-5">
      <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-3">
        <Gavel className="h-5 w-5 text-primary" /> My bidding stats
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="text-xs text-muted-foreground">Win rate</div>
          <div className="text-2xl font-bold text-primary">{kpis.winRate}%</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="text-xs text-muted-foreground">Total bids</div>
          <div className="text-2xl font-bold">{kpis.total}</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="text-xs text-muted-foreground">Spend (won)</div>
          <div className="text-2xl font-bold">₹{kpis.spend.toLocaleString()}</div>
        </div>
      </div>
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          No bids yet.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="pending" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="accepted" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="rejected" stackId="a" fill="var(--chart-3)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
