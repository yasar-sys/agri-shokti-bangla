
CREATE TABLE public.yield_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  field_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  area_hectares DOUBLE PRECISION,
  estimated_yield_min DOUBLE PRECISION NOT NULL,
  estimated_yield_max DOUBLE PRECISION NOT NULL,
  estimated_yield_avg DOUBLE PRECISION NOT NULL,
  yield_unit TEXT NOT NULL DEFAULT 'ton/hectare',
  confidence INTEGER NOT NULL DEFAULT 70,
  reasoning_bn TEXT,
  signals JSONB,
  scenario_label TEXT,
  scenario_inputs JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.yield_predictions TO authenticated;
GRANT ALL ON public.yield_predictions TO service_role;

ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own yield predictions"
  ON public.yield_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own yield predictions"
  ON public.yield_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own yield predictions"
  ON public.yield_predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own yield predictions"
  ON public.yield_predictions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_yield_predictions_updated_at
  BEFORE UPDATE ON public.yield_predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_yield_predictions_user_created ON public.yield_predictions(user_id, created_at DESC);
