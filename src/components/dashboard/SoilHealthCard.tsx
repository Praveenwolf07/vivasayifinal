import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { soilAdvisor } from "@/server/soil-advisor";

interface SoilForm {
  ph: string;
  moisture: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  notes: string;
}

const empty: SoilForm = {
  ph: "",
  moisture: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  notes: "",
};

function SoilScan({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-full">
      <AnimatePresence>
        {active && (
          <>
            {/* 3D-like rotating rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 60 }}
              animate={{ opacity: 0.3, scale: 1.2, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 border-2 border-primary rounded-full"
              style={{ transformStyle: "preserve-3d" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: -60 }}
              animate={{ opacity: 0.2, scale: 1.4, rotate: -360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute w-72 h-72 border border-accent rounded-full"
              style={{ transformStyle: "preserve-3d" }}
            />

            {/* Scanning line */}
            <motion.div
              initial={{ y: -150, opacity: 0 }}
              animate={{ y: 150, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-80 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />

            {/* Pulsing particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.5, 0.5],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="absolute w-2 h-2 rounded-full bg-primary/40 blur-[1px]"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SoilHealthCard({ userId }: { userId: string }) {
  const [form, setForm] = useState<SoilForm>(empty);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState<string>("");
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("soil_reports")
        .select("*")
        .eq("farmer_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        if (error.message.includes('relation "public.soil_reports" does not exist')) {
          console.error("The soil_reports table is missing from your Supabase database.");
        } else {
          console.error("Error fetching soil reports:", error.message);
        }
        return;
      }
      if (data) {
        setReportId(data.id);
        setForm({
          ph: data.ph?.toString() ?? "",
          moisture: data.moisture?.toString() ?? "",
          nitrogen: data.nitrogen?.toString() ?? "",
          phosphorus: data.phosphorus?.toString() ?? "",
          potassium: data.potassium?.toString() ?? "",
          notes: data.notes ?? "",
        });
      }
    })();
  }, [userId]);

  const radarData = [
    { metric: "pH", value: Math.min(parseFloat(form.ph || "0") * 10, 100) },
    { metric: "Moisture", value: parseFloat(form.moisture || "0") },
    { metric: "N", value: parseFloat(form.nitrogen || "0") },
    { metric: "P", value: parseFloat(form.phosphorus || "0") },
    { metric: "K", value: parseFloat(form.potassium || "0") },
  ];

  const save = async () => {
    setSaving(true);
    const payload = {
      farmer_id: userId,
      ph: form.ph ? parseFloat(form.ph) : null,
      moisture: form.moisture ? parseFloat(form.moisture) : null,
      nitrogen: form.nitrogen ? parseFloat(form.nitrogen) : null,
      phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null,
      potassium: form.potassium ? parseFloat(form.potassium) : null,
      notes: form.notes || null,
    };
    const { data, error } = reportId
      ? await supabase.from("soil_reports").update(payload).eq("id", reportId).select().single()
      : await supabase.from("soil_reports").insert(payload).select().single();
    setSaving(false);
    if (error) {
      if (error.message.includes('relation "public.soil_reports" does not exist')) {
        return toast.error(
          "Database table 'soil_reports' is missing. Please run the migration script or create the table in Supabase.",
        );
      }
      return toast.error(error.message);
    }
    setReportId(data.id);
    toast.success("Soil report saved");
  };

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await soilAdvisor({
        data: {
          ph: parseFloat(form.ph || "0"),
          moisture: parseFloat(form.moisture || "0"),
          nitrogen: parseFloat(form.nitrogen || "0"),
          phosphorus: parseFloat(form.phosphorus || "0"),
          potassium: parseFloat(form.potassium || "0"),
          notes: form.notes,
        },
      });
      setAdvice(res.advice);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("AI advisor failed: " + msg);
    }
    setAnalyzing(false);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display text-xl font-bold">Soil health</h3>
          <p className="text-sm text-muted-foreground">
            Log soil readings, get AI-powered crop advice
          </p>
        </div>
        <Badge variant="outline" className="bg-soil/10 text-soil border-soil/30">
          N-P-K · pH · Moisture
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["ph", "pH (0-14)"],
              ["moisture", "Moisture (%)"],
              ["nitrogen", "Nitrogen (mg/kg)"],
              ["phosphorus", "Phosphorus (mg/kg)"],
              ["potassium", "Potassium (mg/kg)"],
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                step="0.1"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}
          <div className="col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button onClick={save} disabled={saving} variant="outline" className="flex-1">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <Button
              onClick={analyze}
              disabled={analyzing}
              className="flex-1 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 text-white shadow-md"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI advice
            </Button>
          </div>
        </div>
        <div className="relative group">
          <div className="h-64 relative z-10 bg-white/40 backdrop-blur-md rounded-2xl border border-border/50 p-4 shadow-inner overflow-hidden">
            <SoilScan active={analyzing} />
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="var(--primary)"
                  fillOpacity={0.4}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <motion.div
            animate={analyzing ? { scale: [1, 1.02, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none transition-opacity ${analyzing ? "opacity-100" : "opacity-0"}`}
          />
          {advice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              {advice}
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}
