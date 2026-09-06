ALTER TABLE public.batch_schedules ADD COLUMN IF NOT EXISTS max_students integer;

CREATE TABLE IF NOT EXISTS public.batch_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batch_schedules(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, coach_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.batch_coaches TO authenticated;
GRANT SELECT ON public.batch_coaches TO anon;
GRANT ALL ON public.batch_coaches TO service_role;

ALTER TABLE public.batch_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read batch_coaches" ON public.batch_coaches FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admin manage batch_coaches" ON public.batch_coaches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "demo manage batch_coaches" ON public.batch_coaches FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.batch_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batch_schedules(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid,
  payment_status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  amount_paid numeric,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.batch_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.batch_enrollments TO anon;
GRANT ALL ON public.batch_enrollments TO service_role;

ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student own enrollments" ON public.batch_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admin all enrollments" ON public.batch_enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "coach batch enrollments" ON public.batch_enrollments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.batch_coaches bc
    JOIN public.coaches c ON c.id = bc.coach_id
    WHERE bc.batch_id = batch_enrollments.batch_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "student insert own enrollment" ON public.batch_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "student update own enrollment" ON public.batch_enrollments FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "demo read enrollments" ON public.batch_enrollments FOR SELECT TO anon USING (true);
CREATE POLICY "demo insert enrollments" ON public.batch_enrollments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "demo update enrollments" ON public.batch_enrollments FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_batch_coaches_batch ON public.batch_coaches(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_coaches_coach ON public.batch_coaches(coach_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch ON public.batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_student ON public.batch_enrollments(student_id);