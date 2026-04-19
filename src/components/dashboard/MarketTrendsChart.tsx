import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type TrendRow = {
  category: string;
  price_per_unit: number;
  created_at: string;
};

export function MarketTrendsChart() {
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("products")
        .select("category, price_per_unit, created_at")
        .gte("created_at", since);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  const { data, categories } = useMemo(() => {
    const buckets: Record<string, Record<string, { sum: number; n: number }>> = {};
    const cats = new Set<string>();
    rows.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      cats.add(r.category);
      buckets[day] ??= {};
      buckets[day][r.category] ??= { sum: 0, n: 0 };
      buckets[day][r.category].sum += Number(r.price_per_unit);
      buckets[day][r.category].n += 1;
    });
    const days = Object.keys(buckets).sort();
    const data = days.map((d) => {
      const row: Record<string, string | number | null> = { date: d.slice(5) };
      cats.forEach((c) => {
        const b = buckets[d][c];
        row[c] = b ? Math.round(b.sum / b.n) : null;
      });
      return row;
    });
    return { data, categories: Array.from(cats).slice(0, 5) };
  }, [rows]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Market price trends
          </h3>
          <p className="text-sm text-muted-foreground">Avg ₹/unit by category · last 30 days</p>
        </div>
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Not enough data yet.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              {categories.map((c, i) => (
                <Line
                  key={c}
                  type="monotone"
                  dataKey={c}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
