import { O as reactExports, j as jsxRuntimeExports, c as createServerFn } from "./index.mjs";
import { b as Route$3, u as useNavigate, a as useAuth, s as supabase, L as Link, t as toast } from "./router-BRHzD6YG.mjs";
import { N as Navbar } from "./Navbar-BMQ_sPxd.mjs";
import { C as Card, B as Button, c as createLucideIcon } from "./card-BzN_3N-a.mjs";
import { I as Input } from "./input-DX9LKY8N.mjs";
import { L as Label } from "./label-ByyrndkK.mjs";
import { T as Textarea, c as createSsrRpc } from "./createSsrRpc-Co2YOj5i.mjs";
import { B as Badge } from "./badge-CqlEyfiz.mjs";
import { D as DemandBadge, P as Package } from "./DemandBadge-ChmoV9z9.mjs";
import { s as sendNotification } from "./notifications-D9aqnfIf.mjs";
import { L as LoaderCircle } from "./loader-circle-DtXktx6C.mjs";
import { A as ArrowLeft } from "./arrow-left-N8dmR0NC.mjs";
import { M as MapPin } from "./map-pin-BL5gXdIL.mjs";
import { S as Sparkles } from "./sparkles-COLgPrFw.mjs";
import { G as Gavel } from "./gavel-B7HX9Axp.mjs";
import { C as CircleCheck } from "./circle-check-CiEKBHWT.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.mjs";
import "./trending-up-CIHcOa2u.mjs";
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode);
const suggestBid = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("df43cfb8f55559d221a55fd494aa95e48c27f4611abe9e2d3e13a61da1e76c1b"));
function ProductDetail() {
  const {
    id
  } = Route$3.useParams();
  const navigate = useNavigate();
  const {
    user,
    role
  } = useAuth();
  const [product, setProduct] = reactExports.useState(null);
  const [bids, setBids] = reactExports.useState([]);
  const [activeImg, setActiveImg] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [bidPrice, setBidPrice] = reactExports.useState("");
  const [bidQty, setBidQty] = reactExports.useState("");
  const [bidMsg, setBidMsg] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [aiSuggesting, setAiSuggesting] = reactExports.useState(false);
  const isOwner = user?.id === product?.farmer_id;
  const highest = bids[0]?.bid_price;
  reactExports.useEffect(() => {
    if (!id) return;
    (async () => {
      const {
        data: p
      } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(p);
      const {
        data: b
      } = await supabase.from("bids").select("*").eq("product_id", id).order("bid_price", {
        ascending: false
      });
      setBids(b ?? []);
      setLoading(false);
    })();
    const channel = supabase.channel(`bids-${id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "bids",
      filter: `product_id=eq.${id}`
    }, async () => {
      const {
        data: b
      } = await supabase.from("bids").select("*").eq("product_id", id).order("bid_price", {
        ascending: false
      });
      setBids(b ?? []);
    }).subscribe();
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
            demand_score: product.demand_score
          }
        }
      });
      setAiSuggesting(false);
      if (data?.suggested_price) {
        setBidPrice(String(data.suggested_price));
        toast.success(`AI suggests ₹${data.suggested_price}/${product.unit} — ${data.reasoning ?? ""}`);
      }
    } catch (e) {
      setAiSuggesting(false);
      toast.error("AI suggestion failed");
    }
  };
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate({
        to: "/auth"
      });
      return;
    }
    if (role !== "buyer") {
      toast.error("Only buyer accounts can place bids");
      return;
    }
    const price = parseFloat(bidPrice), qty = parseFloat(bidQty);
    if (!price || !qty) {
      toast.error("Enter price and quantity");
      return;
    }
    setSubmitting(true);
    const {
      error
    } = await supabase.from("bids").insert({
      product_id: id,
      buyer_id: user.id,
      bid_price: price,
      quantity: qty,
      message: bidMsg || null
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bid placed!");
    if (product?.farmer_id) {
      sendNotification({
        data: {
          type: "bid_placed",
          targetUserId: product.farmer_id,
          payload: {
            productName: product.name,
            bidPrice: price,
            quantity: qty
          }
        }
      }).catch(console.error);
    }
    setBidPrice("");
    setBidQty("");
    setBidMsg("");
  };
  const handleAcceptBid = async (bid) => {
    if (!product || !user) return;
    const {
      error: bidErr
    } = await supabase.from("bids").update({
      status: "accepted"
    }).eq("id", bid.id);
    if (bidErr) {
      toast.error(bidErr.message);
      return;
    }
    await supabase.from("bids").update({
      status: "rejected"
    }).eq("product_id", product.id).neq("id", bid.id).eq("status", "pending");
    const {
      error: orderErr
    } = await supabase.from("orders").insert({
      product_id: product.id,
      bid_id: bid.id,
      buyer_id: bid.buyer_id,
      farmer_id: product.farmer_id,
      quantity: bid.quantity,
      total_price: bid.bid_price * bid.quantity,
      status: "created"
    });
    if (orderErr) {
      toast.error(orderErr.message);
      return;
    }
    await supabase.from("products").update({
      status: "sold"
    }).eq("id", product.id);
    toast.success("Bid accepted! Order created.");
    sendNotification({
      data: {
        type: "bid_confirmed",
        targetUserId: bid.buyer_id,
        payload: {
          productName: product.name,
          totalPrice: bid.bid_price * bid.quantity
        }
      }
    }).catch(console.error);
    navigate({
      to: "/orders"
    });
  };
  const handleRejectBid = async (bid) => {
    const {
      error
    } = await supabase.from("bids").update({
      status: "rejected"
    }).eq("id", bid.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bid rejected");
      if (product) {
        sendNotification({
          data: {
            type: "bid_rejected",
            targetUserId: bid.buyer_id,
            payload: {
              productName: product.name
            }
          }
        }).catch(console.error);
      }
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-white" }) })
  ] });
  if (!product) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container py-20 text-center text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Product not found." }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container py-6 text-white text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/marketplace", className: "inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-smooth mb-6 drop-shadow-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to marketplace"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "aspect-[4/3] overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm", children: product.image_urls && product.image_urls.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_urls[activeImg], alt: product.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-6xl", children: "🌾" }) }),
          product.image_urls && product.image_urls.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 mt-3", children: product.image_urls.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveImg(i), className: `aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${i === activeImg ? "border-primary" : "border-transparent"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u, alt: `${product.name} ${i + 1}`, className: "h-full w-full object-cover" }) }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: product.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-soil text-soil-foreground border-0 capitalize", children: product.quality_grade }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DemandBadge, { score: product.demand_score })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold", children: product.name }),
            product.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: product.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 gradient-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Asking price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-bold text-primary", children: [
                "₹",
                product.price_per_unit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "per ",
                product.unit
              ] })
            ] }),
            highest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Highest bid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-accent-foreground", children: [
                "₹",
                highest
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
              product.location
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-primary" }),
              product.quantity,
              " ",
              product.unit
            ] }),
            product.harvest_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary" }),
              "Harvested ",
              new Date(product.harvest_date).toLocaleDateString()
            ] })
          ] }),
          product.ai_insights && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-accent/30 bg-accent/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-accent-foreground" }),
              " AI Insights"
            ] }),
            product.ai_insights.best_selling_window && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Best selling window:" }),
              " ",
              product.ai_insights.best_selling_window
            ] }),
            product.ai_insights.price_range && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Recommended range:" }),
              " ",
              product.ai_insights.price_range
            ] }),
            product.ai_insights.harvest_tip && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Tip:" }),
              " ",
              product.ai_insights.harvest_tip
            ] })
          ] }),
          !isOwner && product.status === "available" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "h-4 w-4" }),
              " Place a bid"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePlaceBid, className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                    "Bid price / ",
                    product.unit
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: bidPrice, onChange: (e) => setBidPrice(e.target.value), placeholder: "₹" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                    "Quantity (",
                    product.unit,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", max: product.quantity, value: bidQty, onChange: (e) => setBidQty(e.target.value) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Message (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: bidMsg, onChange: (e) => setBidMsg(e.target.value), placeholder: "Pickup time, etc." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", className: "flex-1", disabled: submitting, children: submitting ? "Placing..." : "Place bid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: handleAiSuggest, disabled: aiSuggesting, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                  " ",
                  aiSuggesting ? "..." : "AI suggest"
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "h-5 w-5" }),
          " Bids (",
          bids.length,
          ")",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground ml-2", children: "live" })
        ] }),
        bids.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: "No bids yet. Be the first!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: bids.map((b, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-4 flex items-center justify-between gap-4 ${idx === 0 && b.status === "pending" ? "border-primary border-2" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg", children: [
                "₹",
                b.bid_price
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "× ",
                b.quantity,
                " ",
                product.unit
              ] }),
              idx === 0 && b.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-success text-success-foreground border-0", children: "Highest" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: b.status === "accepted" ? "default" : b.status === "rejected" ? "destructive" : "secondary", className: "capitalize", children: b.status })
            ] }),
            b.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: b.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: new Date(b.created_at).toLocaleString() })
          ] }),
          isOwner && b.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "success", onClick: () => handleAcceptBid(b), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
              " Accept"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleRejectBid(b), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
              " Reject"
            ] })
          ] })
        ] }, b.id)) })
      ] })
    ] })
  ] });
}
export {
  ProductDetail as component
};
