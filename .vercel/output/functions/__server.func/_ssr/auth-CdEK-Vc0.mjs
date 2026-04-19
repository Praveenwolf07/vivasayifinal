import { O as reactExports, j as jsxRuntimeExports } from "./index.mjs";
import { R as Route$6, u as useNavigate, a as useAuth, L as Link, t as toast, s as supabase } from "./router-BRHzD6YG.mjs";
import { C as Card, B as Button } from "./card-BzN_3N-a.mjs";
import { I as Input } from "./input-DX9LKY8N.mjs";
import { L as Label } from "./label-ByyrndkK.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, o as objectType, s as stringType, e as enumType } from "./tabs-CsFoLAYh.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-eL66XWbf.mjs";
import { A as ArrowLeft } from "./arrow-left-N8dmR0NC.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Cf78ubZ7.mjs";
import "./Combination-DdrNlcNE.mjs";
const signUpSchema = objectType({
  email: stringType().trim().email().max(255),
  password: stringType().min(6).max(100),
  fullName: stringType().trim().min(2).max(80),
  location: stringType().trim().min(2).max(120),
  role: enumType(["farmer", "buyer", "transporter"])
});
const signInSchema = objectType({
  email: stringType().trim().email().max(255),
  password: stringType().min(6).max(100)
});
function AuthPage() {
  const search = Route$6.useSearch();
  const [tab, setTab] = reactExports.useState(search.mode);
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  reactExports.useEffect(() => {
    if (user) navigate({
      to: "/dashboard"
    });
  }, [user, navigate]);
  const handleSignUp = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      fullName: fd.get("fullName"),
      location: fd.get("location"),
      role: fd.get("role")
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          location: parsed.data.location,
          role: parsed.data.role
        }
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already registered") ? "Email already registered. Please sign in." : error.message);
      return;
    }
    toast.success("Welcome to Vivasayi!");
    navigate({
      to: "/dashboard"
    });
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password")
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative", style: {
    backgroundImage: "url('https://i.pinimg.com/736x/80/43/09/804309f9701d452544cc6501ed1e4663.jpg')"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative container py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-smooth", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back home"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex-1 flex items-center justify-center px-4 pb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md p-8 gradient-card shadow-elegant", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-soft mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=150&h=150", alt: "Vivasayi Logo", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold", children: "Welcome to Vivasayi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sign in or create your account" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signin", children: "Sign in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Create account" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signin", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "si-email", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "si-email", name: "email", type: "email", required: true, placeholder: "you@farm.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "si-password", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "si-password", name: "password", type: "password", required: true, placeholder: "••••••" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", size: "lg", className: "w-full", disabled: loading, children: loading ? "Signing in..." : "Sign in" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "su-name", children: "Full name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "su-name", name: "fullName", required: true, placeholder: "Ravi Kumar" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "su-email", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "su-email", name: "email", type: "email", required: true, placeholder: "you@farm.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "su-password", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "su-password", name: "password", type: "password", required: true, minLength: 6, placeholder: "At least 6 characters" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "su-loc", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "su-loc", name: "location", required: true, placeholder: "Pune, Maharashtra" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "su-role", children: "I am a..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { name: "role", defaultValue: "farmer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "su-role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "farmer", children: "🌾 Farmer — sell my crops" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "buyer", children: "🏪 Buyer — purchase produce" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transporter", children: "🚚 Transporter — deliver orders" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", size: "lg", className: "w-full", disabled: loading, children: loading ? "Creating..." : "Create account" })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  AuthPage as component
};
