
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE TABLE IF NOT EXISTS public.soil_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL,
  ph numeric,
  moisture numeric,
  nitrogen numeric,
  phosphorus numeric,
  potassium numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Soil reports viewable by everyone"
  ON public.soil_reports FOR SELECT USING (true);

CREATE POLICY "Farmers create own soil reports"
  ON public.soil_reports FOR INSERT
  WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'::app_role));

CREATE POLICY "Farmers update own soil reports"
  ON public.soil_reports FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers delete own soil reports"
  ON public.soil_reports FOR DELETE USING (auth.uid() = farmer_id);

CREATE TRIGGER update_soil_reports_updated_at
  BEFORE UPDATE ON public.soil_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_soil_reports_farmer ON public.soil_reports(farmer_id);

ALTER TABLE public.bids REPLICA IDENTITY FULL;
