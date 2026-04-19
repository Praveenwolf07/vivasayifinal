import { O as reactExports, j as jsxRuntimeExports } from "./index.mjs";
import { s as supabase, t as toast } from "./router-BRHzD6YG.mjs";
import { N as Navbar } from "./Navbar-BMQ_sPxd.mjs";
import { S as Search, P as ProductCard } from "./ProductCard-ufR3YqiJ.mjs";
import { I as Input } from "./input-DX9LKY8N.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-eL66XWbf.mjs";
import { c as createLucideIcon } from "./card-BzN_3N-a.mjs";
import { L as LoaderCircle } from "./loader-circle-DtXktx6C.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.mjs";
import "./badge-CqlEyfiz.mjs";
import "./DemandBadge-ChmoV9z9.mjs";
import "./trending-up-CIHcOa2u.mjs";
import "./map-pin-BL5gXdIL.mjs";
import "./Combination-DdrNlcNE.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode);
function Marketplace() {
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("recent");
  reactExports.useEffect(() => {
    (async () => {
      const {
        data,
        error
      } = await supabase.from("products").select("id,name,category,price_per_unit,unit,quantity,location,quality_grade,image_urls,demand_score,created_at").eq("status", "available").order("created_at", {
        ascending: false
      });
      if (error) toast.error(`Failed to load products: ${error.message}`);
      setProducts(data ?? []);
      setLoading(false);
    })();
  }, []);
  const categories = reactExports.useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);
  const filtered = reactExports.useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesCat = category === "all" || p.category === category;
      return matchesQ && matchesCat;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => a.price_per_unit - b.price_per_unit);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price_per_unit - a.price_per_unit);
    if (sort === "demand") list = [...list].sort((a, b) => (b.demand_score ?? 0) - (a.demand_score ?? 0));
    return list;
  }, [products, search, category, sort]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container py-8 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 drop-shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold mb-2", children: "Marketplace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/90", children: "Discover fresh produce directly from farmers near you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-10 bg-black/40 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md", placeholder: "Search crops or location...", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "md:w-48 bg-black/40 border-white/20 text-white backdrop-blur-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-4 w-4 mr-1 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-black/80 border-white/10 text-white backdrop-blur-xl", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, className: "capitalize hover:bg-white/10", children: c === "all" ? "All categories" : c }, c)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: setSort, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "md:w-48 bg-black/40 border-white/20 text-white backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "bg-black/80 border-white/10 text-white backdrop-blur-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "recent", className: "hover:bg-white/10", children: "Most recent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "demand", className: "hover:bg-white/10", children: "Highest demand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "price-low", className: "hover:bg-white/10", children: "Price: low to high" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "price-high", className: "hover:bg-white/10", children: "Price: high to low" })
          ] })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🌾" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-semibold mb-1", children: "No crops listed yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Be the first farmer to list — sign up and add your harvest." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { p }, p.id)) })
    ] })
  ] });
}
export {
  Marketplace as component
};
