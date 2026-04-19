import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/marketplace")({
  component: Marketplace,
});

function Marketplace() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,category,price_per_unit,unit,quantity,location,quality_grade,image_urls,demand_score,created_at",
        )
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (error) toast.error(`Failed to load products: ${error.message}`);
      setProducts((data ?? []) as ProductCardData[]);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase();
      const matchesQ =
        !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesCat = category === "all" || p.category === category;
      return matchesQ && matchesCat;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => a.price_per_unit - b.price_per_unit);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price_per_unit - a.price_per_unit);
    if (sort === "demand")
      list = [...list].sort((a, b) => (b.demand_score ?? 0) - (a.demand_score ?? 0));
    return list;
  }, [products, search, category, sort]);

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/c5/4a/7c/c54a7cef87205bd172eeb9c12caa10a9.jpg')",
      }}
    >
      <Navbar />
      <div className="container py-8 text-white">
        <div className="mb-8 drop-shadow-lg">
          <h1 className="font-display text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-white/90">Discover fresh produce directly from farmers near you.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              className="pl-10 bg-black/40 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
              placeholder="Search crops or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="md:w-48 bg-black/40 border-white/20 text-white backdrop-blur-md">
              <Filter className="h-4 w-4 mr-1 text-white" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-white/10 text-white backdrop-blur-xl">
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize hover:bg-white/10">
                  {c === "all" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="md:w-48 bg-black/40 border-white/20 text-white backdrop-blur-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-white/10 text-white backdrop-blur-xl">
              <SelectItem value="recent" className="hover:bg-white/10">
                Most recent
              </SelectItem>
              <SelectItem value="demand" className="hover:bg-white/10">
                Highest demand
              </SelectItem>
              <SelectItem value="price-low" className="hover:bg-white/10">
                Price: low to high
              </SelectItem>
              <SelectItem value="price-high" className="hover:bg-white/10">
                Price: high to low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="font-display text-xl font-semibold mb-1">No crops listed yet</h3>
            <p className="text-muted-foreground">
              Be the first farmer to list — sign up and add your harvest.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
