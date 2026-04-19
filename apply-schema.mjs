import pg from "pg";
import fs from "fs";
const { Client } = pg;

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = fs.readFileSync(".env", "utf8");
    const match = env.match(/DATABASE_URL="?(.+?)"?(\s|$)/);
    if (match) return match[1];
  } catch (e) {}
  return "postgresql://postgres:agri@db.jhfwzpmidksjggvqxolm.supabase.co:5432/postgres";
}

const client = new Client({
  connectionString: getConnectionString(),
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
      order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
      role_context TEXT NOT NULL,
      rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude double precision;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude double precision;

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
    
    DROP POLICY IF EXISTS "Soil reports viewable by everyone" ON public.soil_reports;
    CREATE POLICY "Soil reports viewable by everyone" ON public.soil_reports FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Farmers manage own soil reports" ON public.soil_reports;
    CREATE POLICY "Farmers manage own soil reports" ON public.soil_reports FOR ALL USING (auth.uid() = farmer_id);

    DROP TRIGGER IF EXISTS trg_soil_reports_updated ON public.soil_reports;
    CREATE TRIGGER trg_soil_reports_updated BEFORE UPDATE ON public.soil_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE INDEX IF NOT EXISTS idx_soil_reports_farmer ON public.soil_reports(farmer_id);

    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
    CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
    CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    
    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
    CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
    
    DROP TRIGGER IF EXISTS trg_reviews_updated ON public.reviews;
    CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  `);
  console.log("Migration applied");
  await client.end();
}
run().catch(console.error);
