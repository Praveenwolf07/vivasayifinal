import { c as createLucideIcon } from "./card-BzN_3N-a.mjs";
import { j as jsxRuntimeExports } from "./index.mjs";
import { i as cn } from "./router-BRHzD6YG.mjs";
import { T as TrendingUp } from "./trending-up-CIHcOa2u.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
];
const Package = createLucideIcon("package", __iconNode);
const DemandBadge = ({ score }) => {
  const s = score ?? 50;
  const tier = s >= 75 ? "high" : s >= 50 ? "med" : "low";
  const styles = {
    high: "bg-success/15 text-success border-success/30",
    med: "bg-accent/15 text-accent-foreground border-accent/40",
    low: "bg-muted text-muted-foreground border-border"
  }[tier];
  const label = s >= 75 ? "Hot demand" : s >= 50 ? "Steady" : "Low demand";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
        " ",
        label,
        " · ",
        s
      ]
    }
  );
};
export {
  DemandBadge as D,
  Package as P
};
