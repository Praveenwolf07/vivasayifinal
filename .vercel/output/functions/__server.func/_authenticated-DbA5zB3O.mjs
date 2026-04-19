import { j as jsxRuntimeExports, a0 as Outlet, O as reactExports } from "./_ssr/index.mjs";
import { a as useAuth, u as useNavigate } from "./_ssr/router-BRHzD6YG.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./_ssr/index-Cf78ubZ7.mjs";
function AuthGate({
  children
}) {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading) {
      if (!user) navigate({
        to: "/auth"
      });
      else setChecked(true);
    }
  }, [user, loading, navigate]);
  if (loading || !checked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function AuthenticatedLayout() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGate, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AuthenticatedLayout as component
};
