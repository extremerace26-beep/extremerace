CREATE TABLE IF NOT EXISTS public.inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  registration_id UUID,
  full_name TEXT,
  email TEXT,
  category_id TEXT,
  category_name TEXT,
  price_cents INTEGER,
  athlete_snapshot JSONB,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscricoes TO authenticated;
GRANT ALL ON public.inscricoes TO service_role;

CREATE POLICY IF NOT EXISTS "Users view own inscricoes" ON public.inscricoes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users insert own inscricoes" ON public.inscricoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users update own inscricoes" ON public.inscricoes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
