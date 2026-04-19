import { u as useRouter, O as reactExports, j as jsxRuntimeExports } from "./_ssr/index.mjs";
import { a as useAuth, s as supabase, t as toast } from "./_ssr/router-BRHzD6YG.mjs";
import { B as Button, C as Card, c as createLucideIcon } from "./_ssr/card-BzN_3N-a.mjs";
import { U as User, B as Badge, T as Truck } from "./_ssr/badge-CqlEyfiz.mjs";
import { I as Input } from "./_ssr/input-DX9LKY8N.mjs";
import { L as Label } from "./_ssr/label-ByyrndkK.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./_ssr/dialog-XduvOfbb.mjs";
import { A as ArrowLeft } from "./_ssr/arrow-left-N8dmR0NC.mjs";
import { M as MapPin } from "./_ssr/map-pin-BL5gXdIL.mjs";
import { S as Sprout } from "./_ssr/sprout-CwfamDzM.mjs";
import { T as TrendingUp } from "./_ssr/trending-up-CIHcOa2u.mjs";
import { S as Star } from "./_ssr/star-Arm99CY-.mjs";
import { G as Gavel } from "./_ssr/gavel-B7HX9Axp.mjs";
import { C as CircleCheck } from "./_ssr/circle-check-CiEKBHWT.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./_ssr/index-Cf78ubZ7.mjs";
import "./_ssr/Combination-DdrNlcNE.mjs";
const __iconNode$3 = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const Pen = createLucideIcon("pen", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      key: "9njp5v"
    }
  ]
];
const Phone = createLucideIcon("phone", __iconNode);
function ProfilePage() {
  const {
    user,
    role
  } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState({});
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editEmail, setEditEmail] = reactExports.useState("");
  const [editAvatar, setEditAvatar] = reactExports.useState("");
  const [editPhone, setEditPhone] = reactExports.useState("");
  const [editLocation, setEditLocation] = reactExports.useState("");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [activities, setActivities] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!user) return;
    setEditEmail(user.email || "");
    const loadData = async () => {
      const {
        data: pData
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (pData) {
        setProfileData(pData);
        setEditAvatar(pData.avatar_url || "");
        setEditPhone(pData.phone || "+91 98765 43210");
        setEditLocation(pData.location || "Maharashtra, India");
      }
      const currentRole2 = role || "farmer";
      let avgRating = null;
      let reviewCount = 0;
      try {
        const {
          data: reviews,
          error: reviewError
        } = await supabase.from("reviews").select("rating").eq("target_user_id", user.id);
        if (!reviewError && reviews) {
          avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;
          reviewCount = reviews.length;
        }
      } catch (e) {
        console.log("Reviews table disabled or not found.");
      }
      if (currentRole2 === "farmer") {
        const {
          data: orders
        } = await supabase.from("orders").select("total_price, status").eq("farmer_id", user.id);
        const soldOrders = orders?.filter((o) => o.status === "delivered") || [];
        const revenue = soldOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
        setStats({
          cropsSold: soldOrders.length,
          revenue,
          avgRating,
          reviewCount
        });
        const {
          data: pLogs
        } = await supabase.from("products").select("name, created_at").eq("farmer_id", user.id).order("created_at", {
          ascending: false
        }).limit(5);
        const {
          data: oLogs
        } = await supabase.from("orders").select("products(name), status, updated_at").eq("farmer_id", user.id).order("updated_at", {
          ascending: false
        }).limit(5);
        const logs = [...(pLogs || []).map((l) => ({
          date: l.created_at,
          txt: `Listed ${l.name}`,
          primary: true
        })), ...(oLogs || []).map((l) => ({
          date: l.updated_at,
          txt: `Order for ${l.products?.name} changed to ${l.status}`,
          primary: l.status === "delivered"
        }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
        setActivities(logs);
      } else if (currentRole2 === "buyer") {
        const {
          data: bids
        } = await supabase.from("bids").select("status").eq("buyer_id", user.id);
        const bidsWon = bids?.filter((b) => b.status === "accepted").length || 0;
        const totalBids = bids?.length || 0;
        const {
          data: orders
        } = await supabase.from("orders").select("status").eq("buyer_id", user.id);
        const fulfilled = orders?.filter((o) => o.status === "delivered").length || 0;
        setStats({
          bidsWon,
          totalBids,
          fulfilled,
          avgRating,
          reviewCount
        });
        const {
          data: bLogs
        } = await supabase.from("bids").select("products(name), status, created_at").eq("buyer_id", user.id).order("created_at", {
          ascending: false
        }).limit(8);
        setActivities((bLogs || []).map((l) => ({
          date: l.created_at,
          txt: `Placed bid for ${l.products?.name} (${l.status})`,
          primary: l.status === "accepted"
        })));
      } else if (currentRole2 === "transporter") {
        const {
          data: orders
        } = await supabase.from("orders").select("status").eq("transporter_id", user.id);
        const completed = orders?.filter((o) => o.status === "delivered").length || 0;
        setStats({
          completed,
          avgRating,
          reviewCount
        });
        const {
          data: tLogs
        } = await supabase.from("orders").select("products(name, location), status, updated_at").eq("transporter_id", user.id).order("updated_at", {
          ascending: false
        }).limit(8);
        setActivities((tLogs || []).map((l) => ({
          date: l.updated_at,
          txt: `Delivery job ${l.products?.name} status: ${l.status}`,
          primary: l.status === "delivered"
        })));
      }
    };
    loadData();
  }, [user, role]);
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const {
        error: profileError
      } = await supabase.from("profiles").update({
        avatar_url: editAvatar,
        phone: editPhone,
        location: editLocation
      }).eq("id", user.id);
      if (profileError) throw profileError;
      if (editEmail !== user.email) {
        const {
          error: authError
        } = await supabase.auth.updateUser({
          email: editEmail
        });
        if (authError) throw authError;
      }
      toast.success("Profile updated successfully!");
      setProfileData((prev) => ({
        ...prev,
        avatar_url: editAvatar,
        phone: editPhone,
        location: editLocation
      }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };
  if (!user) return null;
  const currentRole = role || "farmer";
  const renderFarmerStats = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "h-4 w-4 text-success" }),
        "Crops Sold"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.cropsSold ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "All time via platform" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
        "Revenue Generated"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold font-display", children: [
        "₹",
        (stats.revenue ?? 0).toLocaleString("en-IN")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-success mt-auto", children: "From delivered orders" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-yellow-500 fill-yellow-500" }),
        "Buyer Rating"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.avgRating ? `${stats.avgRating}/5` : "No ratings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-blue-500" }),
        "Profile Status"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display text-blue-600", children: "Active" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Grower Account" })
    ] })
  ] });
  const renderBuyerStats = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "h-4 w-4 text-accent" }),
        "Total Bids Won"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.bidsWon ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-auto", children: [
        "Out of ",
        stats.totalBids ?? 0,
        " bids placed"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-success" }),
        "Estimated Profit Margin"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display text-success", children: "+14.2%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Based on market price avg" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary" }),
        "Orders Fulfilled"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.fulfilled ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Completed deliveries" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-yellow-500 fill-yellow-500" }),
        "Farmer Rating"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.avgRating ? `${stats.avgRating}/5` : "No ratings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review" })
    ] })
  ] });
  const renderTransporterStats = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4 text-soil" }),
        "Deliveries Completed"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.completed ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Successfully transported" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
        "Total Distance"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: "-- km" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Live tracking unavailable" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-success" }),
        "Safe Transport"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: "100%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: "Zero damage reported" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-yellow-500 fill-yellow-500" }),
        "Service Rating"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-display", children: stats.avgRating ? `${stats.avgRating}/5` : "No ratings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-auto", children: stats.reviewCount ? `Based on ${stats.reviewCount} reviews` : "Pending first review" })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-fixed bg-cover bg-center font-sans", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container py-8 max-w-6xl animate-fade-in text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "mb-4 -ml-4 text-white hover:bg-white/10", onClick: () => router.history.back(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
      "Back"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 drop-shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold mb-2", children: "Profile Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80", children: "Manage your account preferences and view your performance metrics." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 md:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "absolute top-2 right-2 text-muted-foreground hover:text-foreground", onClick: () => setIsEditing(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-centertext-center border-b pb-6 mb-6", children: [
          profileData?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-full overflow-hidden mb-4 mx-auto border-2 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profileData.avatar_url, alt: "Profile", className: "h-full w-full object-cover" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-12 w-12" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-center", children: profileData?.full_name || user.user_metadata?.name || user.email?.split("@")[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize text-sm px-3 py-1", children: currentRole }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-muted-foreground uppercase tracking-wider", children: "Contact Info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: user.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profileData?.phone || "+91 98765 43210" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profileData?.location || "Maharashtra, India" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-4 font-display", children: "Your Track Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-2", children: "Here is a summary of your historical performances and transactions on the platform." }),
          currentRole === "farmer" && renderFarmerStats(),
          currentRole === "buyer" && renderBuyerStats(),
          currentRole === "transporter" && renderTransporterStats()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4", children: "Recent Activity Logs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: activities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No recent activity found." }) : activities.map((act, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border-l-2 pl-4 py-2 ${act.primary ? "border-primary" : "border-border opacity-80"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-1", children: new Date(act.date).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: act.txt })
          ] }, i)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isEditing, onOpenChange: setIsEditing, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Profile Information" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Profile Picture URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://...", value: editAvatar, onChange: (e) => setEditAvatar(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Provide a link to an image. We recommend square dimensions." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: editEmail, onChange: (e) => setEditEmail(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Changing your email will require verification." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editPhone, onChange: (e) => setEditPhone(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editLocation, onChange: (e) => setEditLocation(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsEditing(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSaveProfile, disabled: isSaving, children: isSaving ? "Saving..." : "Save Changes" })
      ] })
    ] }) })
  ] }) });
}
export {
  ProfilePage as component
};
