import { Link } from "@tanstack/react-router";
import { MapPin, Image as ImageIcon, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemandBadge } from "./DemandBadge";

export interface ProductCardData {
  id: string;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity: number;
  location: string;
  quality_grade: string;
  image_urls: string[] | null;
  demand_score: number | null;
}

export const ProductCard = ({ p }: { p: ProductCardData }) => {
  const img = p.image_urls?.[0];
  return (
    <Link to="/product/$id" params={{ id: p.id }}>
      <Card className="group overflow-hidden gradient-card border-border/70 hover:shadow-elegant transition-smooth h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={p.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
          {p.image_urls && p.image_urls.length > 0 && (
            <Badge className="absolute top-2 left-2 bg-background/90 text-foreground border border-border">
              📷 Verified
            </Badge>
          )}
          <Badge className="absolute top-2 right-2 capitalize bg-soil text-soil-foreground border-0">
            {p.quality_grade}
          </Badge>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-lg leading-tight">{p.name}</h3>
            <span className="text-xs text-muted-foreground capitalize">{p.category}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {p.location}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {p.quantity} {p.unit}
            </span>
          </div>
          <div className="mt-auto pt-2 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">₹{p.price_per_unit}</div>
              <div className="text-xs text-muted-foreground">per {p.unit}</div>
            </div>
            <DemandBadge score={p.demand_score} />
          </div>
        </div>
      </Card>
    </Link>
  );
};
