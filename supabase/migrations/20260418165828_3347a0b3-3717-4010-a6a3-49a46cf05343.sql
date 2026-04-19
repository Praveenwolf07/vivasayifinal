
CREATE TYPE public.app_role AS ENUM ('farmer', 'buyer', 'transporter', 'admin');
CREATE TYPE public.product_status AS ENUM ('available', 'sold', 'reserved', 'expired');
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.order_status AS ENUM ('created', 'assigned', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE public.quality_grade AS ENUM ('premium', 'standard', 'basic');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, location TEXT, phone TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE POLICY "Roles are viewable by everyone" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, location, phone) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'buyer'::app_role);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT NOT NULL, description TEXT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC NOT NULL CHECK (price_per_unit >= 0),
  quality_grade quality_grade NOT NULL DEFAULT 'standard',
  location TEXT NOT NULL, harvest_date DATE,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  demand_score INT DEFAULT 50 CHECK (demand_score BETWEEN 0 AND 100),
  ai_insights JSONB,
  status product_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_farmer ON public.products(farmer_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Farmers create own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));
CREATE POLICY "Farmers update own products" ON public.products FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers delete own products" ON public.products FOR DELETE USING (auth.uid() = farmer_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_price NUMERIC NOT NULL CHECK (bid_price > 0),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  message TEXT,
  status bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bids_product ON public.bids(product_id);
CREATE INDEX idx_bids_buyer ON public.bids(buyer_id);
CREATE POLICY "Bids viewable by buyer or product farmer" ON public.bids FOR SELECT
USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.farmer_id = auth.uid()));
CREATE POLICY "Buyers can place bids" ON public.bids FOR INSERT
WITH CHECK (auth.uid() = buyer_id AND public.has_role(auth.uid(), 'buyer'));
CREATE POLICY "Bidder can update own bid" ON public.bids FOR UPDATE
USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.farmer_id = auth.uid()));
CREATE TRIGGER trg_bids_updated BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  capacity_kg NUMERIC NOT NULL CHECK (capacity_kg > 0),
  base_location TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  price_per_km NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logistics viewable by everyone" ON public.logistics FOR SELECT USING (true);
CREATE POLICY "Transporters create own logistics" ON public.logistics FOR INSERT
WITH CHECK (auth.uid() = transporter_id AND public.has_role(auth.uid(), 'transporter'));
CREATE POLICY "Transporters update own logistics" ON public.logistics FOR UPDATE USING (auth.uid() = transporter_id);
CREATE POLICY "Transporters delete own logistics" ON public.logistics FOR DELETE USING (auth.uid() = transporter_id);
CREATE TRIGGER trg_logistics_updated BEFORE UPDATE ON public.logistics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status order_status NOT NULL DEFAULT 'created',
  tracking_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_farmer ON public.orders(farmer_id);
CREATE INDEX idx_orders_transporter ON public.orders(transporter_id);
CREATE POLICY "Orders viewable by participants and available transporters" ON public.orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = farmer_id OR auth.uid() = transporter_id OR (transporter_id IS NULL AND public.has_role(auth.uid(), 'transporter')));
CREATE POLICY "Buyer or farmer can create orders" ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Participants can update orders" ON public.orders FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = farmer_id OR auth.uid() = transporter_id OR (transporter_id IS NULL AND public.has_role(auth.uid(), 'transporter')));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Crop images publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'crop-images');
CREATE POLICY "Farmers upload to own folder" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Farmers update own crop images" ON storage.objects FOR UPDATE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Farmers delete own crop images" ON storage.objects FOR DELETE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

ALTER TABLE public.bids REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
