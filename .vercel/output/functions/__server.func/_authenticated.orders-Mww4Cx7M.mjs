import { O as reactExports, j as jsxRuntimeExports, c as createServerFn } from "./_ssr/index.mjs";
import { a as useAuth, s as supabase, t as toast } from "./_ssr/router-BRHzD6YG.mjs";
import { N as Navbar } from "./_ssr/Navbar-BMQ_sPxd.mjs";
import { C as Card, B as Button } from "./_ssr/card-BzN_3N-a.mjs";
import { T as Truck, B as Badge } from "./_ssr/badge-CqlEyfiz.mjs";
import { D as Dialog, d as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./_ssr/dialog-XduvOfbb.mjs";
import { T as Textarea, c as createSsrRpc } from "./_ssr/createSsrRpc-Co2YOj5i.mjs";
import { S as Star } from "./_ssr/star-Arm99CY-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-eL66XWbf.mjs";
import { s as sendNotification } from "./_ssr/notifications-D9aqnfIf.mjs";
import { L as LoaderCircle } from "./_ssr/loader-circle-DtXktx6C.mjs";
import { S as Sparkles } from "./_ssr/sparkles-COLgPrFw.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./_ssr/index-Cf78ubZ7.mjs";
import "./_ssr/Combination-DdrNlcNE.mjs";
function ReviewDialog({
  targetUserId,
  orderId,
  productId,
  roleContext,
  triggerText = "Leave a Review",
  onSuccess
}) {
  const { user } = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  const [rating, setRating] = reactExports.useState(0);
  const [hoverRating, setHoverRating] = reactExports.useState(0);
  const [comment, setComment] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const handleSubmit = async () => {
    if (!user) return toast.error("You must be logged in to review.");
    if (rating === 0) return toast.error("Please select a rating.");
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        target_user_id: targetUserId,
        order_id: orderId || null,
        product_id: productId || null,
        role_context: roleContext,
        rating,
        comment
      });
      if (error) throw error;
      toast.success("Review submitted successfully!");
      setOpen(false);
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review. If table missing, see instructions.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: triggerText }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Leave a Review" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Star,
            {
              className: `h-8 w-8 cursor-pointer transition-colors ${(hoverRating || rating) >= star ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`,
              onMouseEnter: () => setHoverRating(star),
              onMouseLeave: () => setHoverRating(0),
              onClick: () => setRating(star)
            },
            star
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Comments (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Tell others about your experience...",
              value: comment,
              onChange: (e) => setComment(e.target.value),
              rows: 4
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: isSubmitting || rating === 0, children: isSubmitting ? "Submitting..." : "Submit Review" })
      ] })
    ] })
  ] });
}
const optimizeRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("5f6ede81e6b4161f5dc8d79643623309e6247a09cb1e0e9403067fc7541ac911"));
const STATUSES = ["created", "assigned", "in_transit", "delivered", "cancelled"];
function Orders() {
  const {
    user
  } = useAuth();
  const [orders, setOrders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [aiLoading, setAiLoading] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from("orders").select("*, products(name, location, image_urls)").or(`buyer_id.eq.${user.id},farmer_id.eq.${user.id},transporter_id.eq.${user.id}`).order("created_at", {
      ascending: false
    });
    setOrders(data ?? []);
    setLoading(false);
  }, [user]);
  reactExports.useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase.channel("orders-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "orders"
    }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);
  const updateStatus = async (id, status) => {
    const {
      error
    } = await supabase.from("orders").update({
      status
    }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Status updated");
      if (status === "delivered") {
        const order = orders.find((o) => o.id === id);
        if (order) {
          const participants = [{
            id: order.farmer_id,
            role: "farmer"
          }, {
            id: order.buyer_id,
            role: "buyer"
          }, {
            id: order.transporter_id,
            role: "transporter"
          }].filter((p) => p.id);
          participants.forEach((p) => {
            sendNotification({
              data: {
                type: "order_delivered",
                targetUserId: p.id,
                payload: {
                  productName: order.products?.name || "Order",
                  role: p.role
                }
              }
            }).catch((err) => console.error(`Failed to notify ${p.role}:`, err));
          });
        }
      }
    }
  };
  const aiOptimize = async (o) => {
    setAiLoading(o.id);
    try {
      const data = await optimizeRoute({
        data: {
          pickup: o.products?.location,
          quantity: o.quantity,
          total_price: o.total_price
        }
      });
      setAiLoading(null);
      toast.success(`ETA ~${data.eta_hours}h · est. cost ₹${data.cost_estimate} · ${data.tip}`, {
        duration: 8e3
      });
    } catch (error) {
      setAiLoading(null);
      toast.error("AI failed");
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-white" }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-fixed bg-cover bg-center", style: {
    backgroundImage: "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container py-8 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold mb-8 flex items-center gap-3 drop-shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-8 w-8 text-white" }),
        " Orders"
      ] }),
      orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No orders yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: orders.map((o) => {
        const isParticipant = [o.buyer_id, o.farmer_id, o.transporter_id].includes(user?.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0", children: o.products?.image_urls?.[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: o.products.image_urls[0], alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-2xl", children: "🌾" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg", children: o.products?.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                o.quantity,
                " units · ₹",
                o.total_price,
                " · pickup ",
                o.products?.location
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "capitalize", variant: o.status === "delivered" ? "default" : "secondary", children: o.status.replace("_", " ") }),
            isParticipant && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: o.status, onValueChange: (v) => updateStatus(o.id, v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => aiOptimize(o), disabled: aiLoading === o.id, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
              " ",
              aiLoading === o.id ? "..." : "AI route"
            ] })
          ] }),
          o.tracking_notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: o.tracking_notes }),
          o.status === "delivered" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full mt-4 border-t pt-4", children: [
            user?.id === o.farmer_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.buyer_id, orderId: o.id, productId: o.product_id, roleContext: "farmer_rating_buyer", triggerText: "Rate Buyer" }),
              o.transporter_id && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.transporter_id, orderId: o.id, productId: o.product_id, roleContext: "farmer_rating_transporter", triggerText: "Rate Transporter" })
            ] }),
            user?.id === o.buyer_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.farmer_id, orderId: o.id, productId: o.product_id, roleContext: "buyer_rating_farmer", triggerText: "Rate Farmer & Product" }),
              o.transporter_id && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.transporter_id, orderId: o.id, productId: o.product_id, roleContext: "buyer_rating_transporter", triggerText: "Rate Transporter" })
            ] }),
            user?.id === o.transporter_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.farmer_id, orderId: o.id, productId: o.product_id, roleContext: "transporter_rating_farmer", triggerText: "Rate Farmer (Pickup)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { targetUserId: o.buyer_id, orderId: o.id, productId: o.product_id, roleContext: "transporter_rating_buyer", triggerText: "Rate Buyer (Dropoff)" })
            ] })
          ] })
        ] }, o.id);
      }) })
    ] })
  ] });
}
export {
  Orders as component
};
