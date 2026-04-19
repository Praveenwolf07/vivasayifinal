import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sprout,
  Gavel,
  Truck,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  BarChart3,
  MapPin,
  Camera,
  Brain,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import heroImg from "@/assets/hero-farmer.jpg";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center font-sans"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
      }}
    >
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-24 text-white">
        <div className="container relative py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in drop-shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> AI-powered agricultural
              marketplace
            </div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter">
              Harvest <span className="text-white opacity-90">smarter.</span>
              <br />
              <span className="text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
                Sell directly.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-xl leading-snug font-medium drop-shadow-md">
              Vivasayi connects small-scale farmers with institutional buyers through real-time
              bidding and logistics.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="shadow-2xl scale-105">
                    Go to Dashboard <LayoutDashboard className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" search={{ mode: "signup" }}>
                  <Button variant="hero" size="xl" className="shadow-2xl scale-105">
                    Start selling <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              )}
              <Link to="/marketplace">
                <Button
                  variant="outline"
                  size="xl"
                  className="bg-black/40 backdrop-blur-xl text-white border-white/20 hover:bg-black/60 shadow-xl"
                >
                  Browse marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="container py-32">
        <div className="max-w-3xl mx-auto text-center mb-20 text-white drop-shadow-lg">
          <h2 className="font-display text-5xl md:text-6xl font-black mb-6 tracking-tight">
            A connected global ecosystem
          </h2>
          <p className="text-white/90 text-xl font-medium px-4">
            Marketplace, bidding, and logistics work as one unified pipeline — not isolated tools.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 px-4">
          {[
            {
              icon: Sprout,
              title: "Marketplace",
              desc: "Real-time exchange with quality grading, geo-discovery, and AI-powered demand scoring.",
              color: "text-white",
              bg: "bg-white/10",
            },
            {
              icon: Gavel,
              title: "Smart Bidding",
              desc: "Transparent price discovery with realtime competitive bids and AI-recommended ranges.",
              color: "text-white",
              bg: "bg-white/10",
            },
            {
              icon: Truck,
              title: "Logistics",
              desc: "Automatic transport matching, route optimization, and live delivery tracking.",
              color: "text-white",
              bg: "bg-white/10",
            },
          ].map((m) => (
            <Card
              key={m.title}
              className="p-10 bg-black/50 backdrop-blur-2xl border-white/10 hover:bg-black/70 hover:scale-[1.02] transition-all duration-500 group shadow-2xl"
            >
              <div
                className={`h-16 w-16 rounded-3xl ${m.bg} backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-6 transition-smooth`}
              >
                <m.icon className={`h-8 w-8 ${m.color}`} />
              </div>
              <h3 className="font-display text-3xl font-bold mb-4 text-white">{m.title}</h3>
              <p className="text-white/80 text-lg leading-relaxed">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section className="bg-black/20 backdrop-blur-lg py-32 border-y border-white/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16 text-white">
            <h2 className="font-display text-4xl font-black mb-4 uppercase tracking-wider">
              A closed-loop supply chain
            </h2>
            <p className="text-white/80 text-xl font-medium">
              From field to buyer in seven seamless steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {[
              { n: "1", t: "Farmer lists crop", i: Sprout },
              { n: "2", t: "Uploads verified images", i: Camera },
              { n: "3", t: "Buyer discovers via geo-filter", i: MapPin },
              { n: "4", t: "Buyer places bid", i: Gavel },
              { n: "5", t: "Farmer accepts offer", i: ShieldCheck },
              { n: "6", t: "Logistics auto-assigned", i: Truck },
              { n: "7", t: "Delivery tracked live", i: BarChart3 },
              { n: "AI", t: "Price + demand predicted", i: Brain },
            ].map((s, i) => (
              <div
                key={i}
                className="relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/60 transition-colors group"
              >
                <div className="absolute -top-4 -left-4 h-10 w-10 rounded-2xl bg-white text-black flex items-center justify-center text-sm font-black shadow-2xl group-hover:-translate-y-1 transition-transform">
                  {s.n}
                </div>
                <s.i className="h-8 w-8 text-white mb-4 opacity-100" />
                <div className="font-bold text-lg text-white leading-tight">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="container py-32">
        <div className="grid md:grid-cols-4 gap-6 px-4">
          {[
            { v: "-42%", l: "Post-harvest waste" },
            { v: "+38%", l: "Farmer income uplift" },
            { v: "ZERO", l: "Middlemen costs" },
            { v: "<24h", l: "Avg. delivery time" },
          ].map((s) => (
            <Card
              key={s.l}
              className="p-8 text-center bg-black/40 backdrop-blur-3xl border-white/10 shadow-2xl hover:bg-black/60 transition-colors"
            >
              <div className="text-5xl font-black text-white font-display mb-3 tracking-tighter">
                {s.v}
              </div>
              <div className="text-sm font-bold text-white/70 uppercase tracking-widest">{s.l}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-40">
        <div className="rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-3xl p-16 md:p-24 text-center shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden relative">
          <div className="relative z-10 max-w-3xl mx-auto text-white">
            <h2 className="font-display text-5xl md:text-7xl font-black mb-8 tracking-tighter">
              Ready to transform your harvest?
            </h2>
            <p className="text-white/80 text-xl md:text-2xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Join thousands of farmers and buyers building a fairer agricultural future.
            </p>
            {user ? (
              <Link to="/dashboard">
                <Button
                  variant="harvest"
                  size="xl"
                  className="scale-110 shadow-2xl px-12 py-8 text-xl"
                >
                  Go to Dashboard <LayoutDashboard className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button
                  variant="harvest"
                  size="xl"
                  className="scale-110 shadow-2xl px-12 py-8 text-xl"
                >
                  Create your account <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-20 bg-black/40 backdrop-blur-xl">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-12 text-sm text-white/50 px-8">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=100&h=100"
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-black text-xl text-white block tracking-tight">Vivasayi</span>
              <span className="text-xs uppercase tracking-widest font-bold">
                Smart Agricultural Marketplace
              </span>
            </div>
          </div>
          <div className="font-medium text-right">
            Built for the future of farming · {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
