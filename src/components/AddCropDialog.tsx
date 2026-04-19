import { useState } from "react";
import { Upload, Sparkles, X, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { analyzeCrop } from "@/server/analyze-crop";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().max(500).optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  price_per_unit: z.number().positive(),
  quality_grade: z.enum(["premium", "standard", "basic"]),
  location: z.string().trim().min(2).max(120),
  harvest_date: z.string().optional(),
});

export const AddCropDialog = ({ onCreated }: { onCreated: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).slice(0, 5);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const removeImg = (i: number) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      category: fd.get("category"),
      description: fd.get("description") || undefined,
      quantity: parseFloat(fd.get("quantity") as string),
      unit: fd.get("unit"),
      price_per_unit: parseFloat(fd.get("price_per_unit") as string),
      quality_grade: fd.get("quality_grade"),
      location: fd.get("location"),
      harvest_date: (fd.get("harvest_date") as string) || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("crop-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("crop-images").getPublicUrl(path);
        urls.push(pub.publicUrl);
      }

      let demand_score = 50;
      let ai_insights: Record<string, unknown> | null = null;
      try {
        const ai = await analyzeCrop({
          data: {
            name: parsed.data.name,
            category: parsed.data.category,
            location: parsed.data.location,
            quality_grade: parsed.data.quality_grade,
            price: parsed.data.price_per_unit,
            quantity: parsed.data.quantity,
          },
        });
        if (ai?.demand_score != null) demand_score = ai.demand_score;
        if (ai) ai_insights = ai as Record<string, unknown>;
      } catch (e: unknown) {
        console.warn("AI analyze failed", e);
      }

      const { error } = await supabase.from("products").insert([
        {
          farmer_id: user.id,
          name: parsed.data.name,
          category: parsed.data.category,
          description: parsed.data.description,
          quantity: parsed.data.quantity,
          unit: parsed.data.unit,
          price_per_unit: parsed.data.price_per_unit,
          quality_grade: parsed.data.quality_grade,
          location: parsed.data.location,
          harvest_date: parsed.data.harvest_date,
          image_urls: urls,
          demand_score,
          ai_insights,
        },
      ]);
      if (error) throw error;
      toast.success("Crop listed! AI analyzed your listing.");
      setOpen(false);
      setFiles([]);
      setPreviews([]);
      onCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to list crop";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">
          <Plus className="h-4 w-4" /> List a crop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">List a new crop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Crop name</Label>
              <Input name="name" required placeholder="Tomatoes" />
            </div>
            <div>
              <Label>Category</Label>
              <Input name="category" required placeholder="Vegetables" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea name="description" rows={2} placeholder="Variety, organic, etc." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input name="quantity" type="number" step="0.01" min="0" required />
            </div>
            <div>
              <Label>Unit</Label>
              <Select name="unit" defaultValue="kg">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ton">ton</SelectItem>
                  <SelectItem value="quintal">quintal</SelectItem>
                  <SelectItem value="crate">crate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price / unit (₹)</Label>
              <Input name="price_per_unit" type="number" step="0.01" min="0" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quality grade</Label>
              <Select name="quality_grade" defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Harvest date</Label>
              <Input name="harvest_date" type="date" />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input name="location" required placeholder="Pune, Maharashtra" />
          </div>

          <div>
            <Label>Crop images (up to 5)</Label>
            <label className="mt-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted transition-smooth">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {previews.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={p} alt="" className="h-full w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImg(i)}
                      className="absolute top-1 right-1 bg-background/90 rounded-full p-1 shadow-soft"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 flex items-start gap-2 text-xs">
            <Sparkles className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
            <span>
              AI will automatically analyze demand, recommend a price range, and suggest the best
              selling window when you submit.
            </span>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Listing...
              </>
            ) : (
              "List crop"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
