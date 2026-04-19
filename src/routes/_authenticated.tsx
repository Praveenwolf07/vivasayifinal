import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/auth" });
      else setChecked(true);
    }
  }, [user, loading, navigate]);

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}

function AuthenticatedLayout() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}
