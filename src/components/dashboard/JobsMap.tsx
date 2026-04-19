import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Loader2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  lat: number;
  lng: number;
  total: number;
  name: string;
  location: string;
}

export function JobsMap() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total_price, products(name, location, farmer_id)")
        .is("transporter_id", null);
      const ids = (data ?? [])
        .map((o) => (o.products as Record<string, unknown>)?.farmer_id as string)
        .filter(Boolean);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, latitude, longitude")
        .in("id", ids);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
      const jobsList: Job[] = (data ?? []).flatMap((o) => {
        const products = o.products as Record<string, unknown>;
        const p = profMap.get(products?.farmer_id as string);
        if (!p?.latitude || !p?.longitude) return [];
        return [
          {
            id: o.id,
            lat: p.latitude,
            lng: p.longitude,
            total: Number(o.total_price),
            name: products?.name,
            location: products?.location,
          },
        ];
      });
      setJobs(jobsList);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current) return;

    const center: [number, number] = jobs[0] ? [jobs[0].lat, jobs[0].lng] : [20.5937, 78.9629];

    // Cleanup
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = L.map(mapRef.current).setView(center, jobs.length > 0 ? 5 : 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    jobs.forEach((j) => {
      L.circleMarker([j.lat, j.lng], {
        radius: Math.min(8 + j.total / 1000, 22),
        color: j.total > 5000 ? "#16a34a" : j.total > 1500 ? "#f59e0b" : "#64748b",
        fillOpacity: 0.6,
      })
        .addTo(map)
        .bindPopup(
          `<div class="text-sm">
            <div class="font-semibold">${j.name}</div>
            <div>${j.location}</div>
            <div class="font-bold text-primary">₹${j.total.toLocaleString()}</div>
          </div>`,
        );
    });

    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [loading, jobs]);

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/50 bg-white/50">
        <h3 className="font-display text-2xl font-bold tracking-tight flex items-center gap-3">
          <Truck className="h-6 w-6 text-primary" /> Live pickup jobs
        </h3>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Color-coded by order value · Real-time availability
        </p>
      </div>
      <div className="h-80 w-full" ref={mapRef} />
      {loading && (
        <div className="h-80 w-full flex items-center justify-center bg-muted/20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && jobs.length === 0 && (
        <div className="p-6 text-center text-muted-foreground text-sm">
          No mappable jobs (farmers need lat/lng on profiles).
        </div>
      )}
    </Card>
  );
}
