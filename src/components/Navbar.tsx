import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Sprout, LogOut, LayoutDashboard, ShoppingBasket, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const path = loc.pathname;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/5 title-blur backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between text-white">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-soft group-hover:shadow-glow transition-smooth">
            <img
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=100&h=100"
              alt="Vivasayi Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight text-white hover:text-white/90 transition-colors">
              Vivasayi
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
              Smart Marketplace
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/marketplace">
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-300 ${
                path.startsWith("/marketplace") || path.startsWith("/product")
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-white/80 hover:bg-emerald-500/10 hover:text-emerald-400"
              }`}
            >
              <ShoppingBasket className="h-4 w-4 mr-1" /> Marketplace
            </Button>
          </Link>
          {user && (
            <>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-300 ${
                    path.startsWith("/dashboard")
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "text-white/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Button>
              </Link>
              <Link to="/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-300 ${
                    path.startsWith("/orders")
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "text-white/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                  }`}
                >
                  <Truck className="h-4 w-4 mr-1" /> Orders
                </Button>
              </Link>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-300 ${
                    path.startsWith("/profile")
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "text-white/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                  }`}
                >
                  <User className="h-4 w-4 mr-1" /> Profile
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {role && (
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex capitalize border-white/20 text-white bg-white/5"
                >
                  {role}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />{" "}
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button
                  variant="hero"
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 border-none shadow-lg"
                >
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
