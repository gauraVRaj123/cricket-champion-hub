
-- COACHES
CREATE TABLE public.coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  certifications text,
  experience_years integer DEFAULT 0,
  bio text,
  photo_url text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coaches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaches TO authenticated;
GRANT ALL ON public.coaches TO service_role;

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coaches" ON public.coaches
  FOR SELECT USING (active = true);
CREATE POLICY "Admins view all coaches" ON public.coaches
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert coaches" ON public.coaches
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update coaches" ON public.coaches
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete coaches" ON public.coaches
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- BATCH SCHEDULES
CREATE TABLE public.batch_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name text NOT NULL,
  age_group text NOT NULL,
  days text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  coach_id uuid REFERENCES public.coaches(id) ON DELETE SET NULL,
  location text,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.batch_schedules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batch_schedules TO authenticated;
GRANT ALL ON public.batch_schedules TO service_role;

ALTER TABLE public.batch_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules" ON public.batch_schedules
  FOR SELECT USING (active = true);
CREATE POLICY "Admins view all schedules" ON public.batch_schedules
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert schedules" ON public.batch_schedules
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update schedules" ON public.batch_schedules
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete schedules" ON public.batch_schedules
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER batch_schedules_updated_at BEFORE UPDATE ON public.batch_schedules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
