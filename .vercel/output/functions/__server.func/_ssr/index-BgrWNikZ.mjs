import { j as jsxRuntimeExports } from "./index.mjs";
import { a as useAuth, L as Link } from "./router-BRHzD6YG.mjs";
import { B as Button, C as Card, c as createLucideIcon } from "./card-BzN_3N-a.mjs";
import { N as Navbar, L as LayoutDashboard } from "./Navbar-BMQ_sPxd.mjs";
import { S as Sparkles } from "./sparkles-COLgPrFw.mjs";
import { S as Sprout } from "./sprout-CwfamDzM.mjs";
import { G as Gavel } from "./gavel-B7HX9Axp.mjs";
import { T as Truck } from "./badge-CqlEyfiz.mjs";
import { M as MapPin } from "./map-pin-BL5gXdIL.mjs";
import { C as ChartColumn } from "./chart-column-BDYW70m4.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.mjs";
const __iconNode$3 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M12 18V5", key: "adv99a" }],
  ["path", { d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", key: "1e3is1" }],
  ["path", { d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5", key: "1gqd8o" }],
  ["path", { d: "M17.997 5.125a4 4 0 0 1 2.526 5.77", key: "iwvgf7" }],
  ["path", { d: "M18 18a4 4 0 0 0 2-7.464", key: "efp6ie" }],
  ["path", { d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517", key: "1gq6am" }],
  ["path", { d: "M6 18a4 4 0 0 1-2-7.464", key: "k1g0md" }],
  ["path", { d: "M6.003 5.125a4 4 0 0 0-2.526 5.77", key: "q97ue3" }]
];
const Brain = createLucideIcon("brain", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
function Landing() {
  const {
    user
  } = useAuth();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center font-sans", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative overflow-hidden pt-12 pb-24 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container relative py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in drop-shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-yellow-400" }),
        " AI-powered agricultural marketplace"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter", children: [
        "Harvest ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white opacity-90", children: "smarter." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]", children: "Sell directly." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl md:text-2xl text-white max-w-xl leading-snug font-medium drop-shadow-md", children: "Vivasayi connects small-scale farmers with institutional buyers through real-time bidding and logistics." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 pt-4", children: [
        user ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", size: "xl", className: "shadow-2xl scale-105", children: [
          "Go to Dashboard ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-5 w-5 ml-2" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
          mode: "signup"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", size: "xl", className: "shadow-2xl scale-105", children: [
          "Start selling ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/marketplace", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "xl", className: "bg-black/40 backdrop-blur-xl text-white border-white/20 hover:bg-black/60 shadow-xl", children: "Browse marketplace" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container py-32", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto text-center mb-20 text-white drop-shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-5xl md:text-6xl font-black mb-6 tracking-tight", children: "A connected global ecosystem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/90 text-xl font-medium px-4", children: "Marketplace, bidding, and logistics work as one unified pipeline — not isolated tools." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-8 px-4", children: [{
        icon: Sprout,
        title: "Marketplace",
        desc: "Real-time exchange with quality grading, geo-discovery, and AI-powered demand scoring.",
        color: "text-white",
        bg: "bg-white/10"
      }, {
        icon: Gavel,
        title: "Smart Bidding",
        desc: "Transparent price discovery with realtime competitive bids and AI-recommended ranges.",
        color: "text-white",
        bg: "bg-white/10"
      }, {
        icon: Truck,
        title: "Logistics",
        desc: "Automatic transport matching, route optimization, and live delivery tracking.",
        color: "text-white",
        bg: "bg-white/10"
      }].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 bg-black/50 backdrop-blur-2xl border-white/10 hover:bg-black/70 hover:scale-[1.02] transition-all duration-500 group shadow-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-16 w-16 rounded-3xl ${m.bg} backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-6 transition-smooth`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(m.icon, { className: `h-8 w-8 ${m.color}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-3xl font-bold mb-4 text-white", children: m.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 text-lg leading-relaxed", children: m.desc })
      ] }, m.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-black/20 backdrop-blur-lg py-32 border-y border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto text-center mb-16 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-4xl font-black mb-4 uppercase tracking-wider", children: "A closed-loop supply chain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 text-xl font-medium", children: "From field to buyer in seven seamless steps." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4", children: [{
        n: "1",
        t: "Farmer lists crop",
        i: Sprout
      }, {
        n: "2",
        t: "Uploads verified images",
        i: Camera
      }, {
        n: "3",
        t: "Buyer discovers via geo-filter",
        i: MapPin
      }, {
        n: "4",
        t: "Buyer places bid",
        i: Gavel
      }, {
        n: "5",
        t: "Farmer accepts offer",
        i: ShieldCheck
      }, {
        n: "6",
        t: "Logistics auto-assigned",
        i: Truck
      }, {
        n: "7",
        t: "Delivery tracked live",
        i: ChartColumn
      }, {
        n: "AI",
        t: "Price + demand predicted",
        i: Brain
      }].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/60 transition-colors group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 h-10 w-10 rounded-2xl bg-white text-black flex items-center justify-center text-sm font-black shadow-2xl group-hover:-translate-y-1 transition-transform", children: s.n }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.i, { className: "h-8 w-8 text-white mb-4 opacity-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg text-white leading-tight", children: s.t })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "container py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-4 gap-6 px-4", children: [{
      v: "-42%",
      l: "Post-harvest waste"
    }, {
      v: "+38%",
      l: "Farmer income uplift"
    }, {
      v: "ZERO",
      l: "Middlemen costs"
    }, {
      v: "<24h",
      l: "Avg. delivery time"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center bg-black/40 backdrop-blur-3xl border-white/10 shadow-2xl hover:bg-black/60 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl font-black text-white font-display mb-3 tracking-tighter", children: s.v }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-white/70 uppercase tracking-widest", children: s.l })
    ] }, s.l)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "container pb-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-3xl p-16 md:p-24 text-center shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-3xl mx-auto text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-5xl md:text-7xl font-black mb-8 tracking-tighter", children: "Ready to transform your harvest?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 text-xl md:text-2xl font-medium mb-12 max-w-xl mx-auto leading-relaxed", children: "Join thousands of farmers and buyers building a fairer agricultural future." }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "harvest", size: "xl", className: "scale-110 shadow-2xl px-12 py-8 text-xl", children: [
        "Go to Dashboard ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-6 w-6 ml-3" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
        mode: "signup"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "harvest", size: "xl", className: "scale-110 shadow-2xl px-12 py-8 text-xl", children: [
        "Create your account ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-6 w-6 ml-3" })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-white/10 py-20 bg-black/40 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container flex flex-col md:flex-row items-center justify-between gap-12 text-sm text-white/50 px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-2xl overflow-hidden shadow-2xl border border-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=100&h=100", alt: "", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xl text-white block tracking-tight", children: "Vivasayi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest font-bold", children: "Smart Agricultural Marketplace" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-right", children: [
        "Built for the future of farming · ",
        (/* @__PURE__ */ new Date()).getFullYear()
      ] })
    ] }) })
  ] });
}
export {
  Landing as component
};
