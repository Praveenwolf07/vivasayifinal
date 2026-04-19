import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fix default marker icon (Leaflet + bundlers)
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DailyForecast {
  date: string;
  tMax: number;
  tMin: number;
  rain: number;
  wind: number;
  code: number;
}

const codeToIcon = (c: number) => {
  if (c === 0) return <Sun className="h-5 w-5 text-accent" />;
  if (c >= 51 && c <= 67) return <CloudRain className="h-5 w-5 text-primary" />;
  if (c >= 80) return <CloudRain className="h-5 w-5 text-destructive" />;
  return <Cloud className="h-5 w-5 text-muted-foreground" />;
};

const codeLabel = (c: number) => {
  if (c === 0) return "Clear";
  if (c <= 3) return "Partly cloudy";
  if (c <= 48) return "Foggy";
  if (c <= 67) return "Rainy";
  if (c <= 77) return "Snow";
  if (c <= 82) return "Showers";
  return "Storm";
};

const codeToBgSeed = (c: number) => {
  if (c === 0) return "sun";
  if (c <= 3) return "cloudy";
  if (c <= 48) return "fog";
  if (c <= 67) return "rain";
  if (c <= 82) return "storm";
  return "nature";
};

export function WeatherMap({ userId }: { userId: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!coords || !mapRef.current) return;

    // Cleanup any existing instance
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    // Initialize map
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([coords.lat, coords.lng], 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([coords.lat, coords.lng], { icon }).addTo(map).bindPopup(locationLabel);

    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [coords, locationLabel]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude, location")
        .eq("id", userId)
        .maybeSingle();

      let lat = profile?.latitude ?? null;
      let lng = profile?.longitude ?? null;
      const locText = profile?.location ?? "";
      setLocationLabel(locText || "Your field");

      if ((!lat || !lng) && locText) {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locText)}`,
          );
          const j = await r.json();
          if (j?.[0]) {
            lat = parseFloat(j[0].lat);
            lng = parseFloat(j[0].lon);
            await supabase
              .from("profiles")
              .update({ latitude: lat, longitude: lng })
              .eq("id", userId);
          }
        } catch {
          /* ignore */
        }
      }

      if (!lat || !lng) {
        // Fallback: India centroid
        lat = 20.5937;
        lng = 78.9629;
      }

      setCoords({ lat, lng });

      try {
        const w = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=7`,
        );
        const wj = await w.json();
        const days: DailyForecast[] = (wj?.daily?.time ?? []).map((d: string, i: number) => ({
          date: d,
          tMax: wj.daily.temperature_2m_max[i],
          tMin: wj.daily.temperature_2m_min[i],
          rain: wj.daily.precipitation_sum[i],
          wind: wj.daily.wind_speed_10m_max[i],
          code: wj.daily.weather_code[i],
        }));
        setForecast(days);

        // Quick "best harvest window" heuristic
        const dry = days
          .map((d, i) => ({ ...d, i }))
          .filter((d) => d.rain < 1 && d.wind < 25)
          .slice(0, 2);
        if (dry.length) {
          const labels = dry
            .map((d) =>
              new Date(d.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
            )
            .join(" & ");
          setAdvice(`Best harvest window: ${labels}`);
        } else {
          setAdvice("No clear dry window in next 7 days — plan covered storage.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error("Couldn't load weather: " + msg);
      }
      setLoading(false);
    })();
  }, [userId]);

  if (loading)
    return (
      <Card className="p-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/50 bg-white/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Field weather · {locationLabel}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Live conditions & 7-day forecast
            </p>
          </div>
          {advice && (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 text-xs font-semibold">
              {advice}
            </Badge>
          )}
        </div>
      </div>
      <div className="h-64 w-full" ref={mapRef} />
      {!coords && (
        <div className="h-64 w-full flex items-center justify-center bg-muted/20">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((d) => (
          <div
            key={d.date}
            className="group relative overflow-hidden rounded-xl h-48 border transition-all hover:shadow-lg hover:-translate-y-1"
          >
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
              <img
                src={`https://picsum.photos/seed/${codeToBgSeed(d.code)}/400/600`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt=""
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] group-hover:bg-black/30 transition-colors" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white drop-shadow-md">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="flex justify-between items-start">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20">
                    {codeToIcon(d.code)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-medium leading-none">
                      {Math.round(d.tMax)}°
                    </div>
                    <div className="text-xs opacity-70">Low {Math.round(d.tMin)}°</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 inline-block">
                  {codeLabel(d.code)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] opacity-90">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {d.rain}mm
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {Math.round(d.wind)}km
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
