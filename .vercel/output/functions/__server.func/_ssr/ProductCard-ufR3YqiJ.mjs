import { c as createLucideIcon, C as Card } from "./card-BzN_3N-a.mjs";
import { j as jsxRuntimeExports } from "./index.mjs";
import { L as Link } from "./router-BRHzD6YG.mjs";
import { B as Badge } from "./badge-CqlEyfiz.mjs";
import { P as Package, D as DemandBadge } from "./DemandBadge-ChmoV9z9.mjs";
import { M as MapPin } from "./map-pin-BL5gXdIL.mjs";
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$1);
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
const ProductCard = ({ p }) => {
  const img = p.image_urls?.[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/product/$id", params: { id: p.id }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group overflow-hidden gradient-card border-border/70 hover:shadow-elegant transition-smooth h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] bg-muted overflow-hidden", children: [
      img ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: img,
          alt: p.name,
          className: "h-full w-full object-cover group-hover:scale-105 transition-smooth",
          loading: "lazy"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-10 w-10" }) }),
      p.image_urls && p.image_urls.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "absolute top-2 left-2 bg-background/90 text-foreground border border-border", children: "📷 Verified" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "absolute top-2 right-2 capitalize bg-soil text-soil-foreground border-0", children: p.quality_grade })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-col gap-2 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-lg leading-tight", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground capitalize", children: p.category })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
          p.location
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3" }),
          p.quantity,
          " ",
          p.unit
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-2 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-primary", children: [
            "₹",
            p.price_per_unit
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "per ",
            p.unit
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DemandBadge, { score: p.demand_score })
      ] })
    ] })
  ] }) });
};
export {
  ProductCard as P,
  Search as S
};
