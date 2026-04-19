import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Sprout, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const signUpSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  fullName: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  role: z.enum(["farmer", "buyer", "transporter"]),
});

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<string>(search.mode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      fullName: fd.get("fullName"),
      location: fd.get("location"),
      role: fd.get("role"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          location: parsed.data.location,
          role: parsed.data.role,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Email already registered. Please sign in."
          : error.message,
      );
      return;
    }
    toast.success("Welcome to Vivasayi!");
    navigate({ to: "/dashboard" });
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/80/43/09/804309f9701d452544cc6501ed1e4663.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative container py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-smooth"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
      <div className="relative flex-1 flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md p-8 gradient-card shadow-elegant">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-soft mb-3">
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Vivasayi Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-display text-2xl font-bold">Welcome to Vivasayi</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in or create your account</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@farm.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••"
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="fullName" required placeholder="Ravi Kumar" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@farm.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-password">Password</Label>
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-loc">Location</Label>
                  <Input id="su-loc" name="location" required placeholder="Pune, Maharashtra" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-role">I am a...</Label>
                  <Select name="role" defaultValue="farmer">
                    <SelectTrigger id="su-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">🌾 Farmer — sell my crops</SelectItem>
                      <SelectItem value="buyer">🏪 Buyer — purchase produce</SelectItem>
                      <SelectItem value="transporter">🚚 Transporter — deliver orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
