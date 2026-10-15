-- Account portals: farmer / merchant / trader
CREATE TABLE public.account_types (
  user_id uuid PRIMARY KEY,
  account_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  display_name text,
  business_name text,
  phone text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.account_types TO authenticated;
GRANT ALL ON public.account_types TO service_role;
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin read" ON public.account_types FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own insert" ON public.account_types FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "own or admin update" ON public.account_types FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.guard_account_type()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.account_type NOT IN ('farmer','merchant','trader') THEN
    RAISE EXCEPTION 'invalid account type';
  END IF;
  IF public.has_role(auth.uid(),'admin') THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := CASE WHEN NEW.account_type = 'farmer' THEN 'approved' ELSE 'pending' END;
  ELSE
    -- non-admins cannot change their own status; changing type resets approval
    IF NEW.account_type <> OLD.account_type THEN
      NEW.status := CASE WHEN NEW.account_type = 'farmer' THEN 'approved' ELSE 'pending' END;
    ELSE
      NEW.status := OLD.status;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_account_type BEFORE INSERT OR UPDATE ON public.account_types
  FOR EACH ROW EXECUTE FUNCTION public.guard_account_type();

CREATE OR REPLACE FUNCTION public.is_approved_buyer(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.account_types WHERE user_id=_uid
    AND account_type IN ('merchant','trader') AND status='approved')
$$;
REVOKE EXECUTE ON FUNCTION public.is_approved_buyer(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_approved_buyer(uuid) TO authenticated;

-- Prices submitted by approved merchants/traders, published by admin
CREATE TABLE public.price_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submitter_name text,
  crop_name text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL DEFAULT 'কেজি',
  market_location text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_submissions TO authenticated;
GRANT ALL ON public.price_submissions TO service_role;
ALTER TABLE public.price_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin read" ON public.price_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "approved buyers insert" ON public.price_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_approved_buyer(auth.uid()) AND status='pending' AND price > 0);
CREATE POLICY "admin update" ON public.price_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own pending or admin delete" ON public.price_submissions FOR DELETE TO authenticated
  USING ((user_id = auth.uid() AND status='pending') OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.review_price_submission(_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.price_submissions; existing public.market_prices;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT * INTO s FROM public.price_submissions WHERE id=_id AND status='pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'submission not found'; END IF;
  UPDATE public.price_submissions SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
    reviewed_at = now() WHERE id=_id;
  IF _approve THEN
    SELECT * INTO existing FROM public.market_prices WHERE crop_name = s.crop_name LIMIT 1;
    IF FOUND THEN
      UPDATE public.market_prices SET yesterday_price = existing.today_price, today_price = s.price,
        unit = s.unit, market_location = COALESCE(s.market_location, existing.market_location),
        weekly_avg = ROUND((COALESCE(existing.weekly_avg, existing.today_price)*6 + s.price)/7, 2),
        updated_at = now()
      WHERE id = existing.id;
    ELSE
      INSERT INTO public.market_prices (crop_name, today_price, yesterday_price, weekly_avg, unit, market_location)
      VALUES (s.crop_name, s.price, s.price, s.price, s.unit, s.market_location);
    END IF;
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.review_price_submission(uuid, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.review_price_submission(uuid, boolean) TO authenticated;

-- Produce farmers sell
CREATE TABLE public.produce_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  seller_name text NOT NULL,
  seller_phone text,
  crop_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'কেজি',
  asking_price numeric NOT NULL,
  location text,
  description text,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produce_listings TO authenticated;
GRANT ALL ON public.produce_listings TO service_role;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read" ON public.produce_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "own insert" ON public.produce_listings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND quantity > 0 AND asking_price > 0);
CREATE POLICY "own or admin update" ON public.produce_listings FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own or admin delete" ON public.produce_listings FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Buyer offers on listings
CREATE TABLE public.produce_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  buyer_name text NOT NULL,
  buyer_phone text,
  offer_price numeric NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produce_offers TO authenticated;
GRANT ALL ON public.produce_offers TO service_role;
ALTER TABLE public.produce_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer seller admin read" ON public.produce_offers FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.produce_listings l WHERE l.id = listing_id AND l.user_id = auth.uid()));
CREATE POLICY "approved buyer insert" ON public.produce_offers FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid() AND public.is_approved_buyer(auth.uid()) AND status='pending' AND offer_price > 0);
CREATE POLICY "seller responds" ON public.produce_offers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.produce_listings l WHERE l.id = listing_id AND l.user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "buyer delete pending" ON public.produce_offers FOR DELETE TO authenticated
  USING ((buyer_id = auth.uid() AND status='pending') OR public.has_role(auth.uid(),'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.produce_listings, public.price_submissions, public.produce_offers;