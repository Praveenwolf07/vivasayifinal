import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const DemandBadge = ({ score }: { score: number | null | undefined }) => {
  const s = score ?? 50;
  const tier = s >= 75 ? "high" : s >= 50 ? "med" : "low";
  const styles = {
    high: "bg-success/15 text-success border-success/30",
    med: "bg-accent/15 text-accent-foreground border-accent/40",
    low: "bg-muted text-muted-foreground border-border",
  }[tier];
  const label = s >= 75 ? "Hot demand" : s >= 50 ? "Steady" : "Low demand";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles,
      )}
    >
      <TrendingUp className="h-3 w-3" /> {label} · {s}
    </span>
  );
};
