-- 1. user_roles: admins manage roles
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Link coaches to auth users (for coach dashboard login)
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE;

-- 3. Coach can see own coach row
CREATE POLICY "Coaches read own coach row" ON public.coaches
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. Coach can see schedules assigned to them
CREATE POLICY "Coaches read assigned schedules" ON public.batch_schedules
  FOR SELECT TO authenticated
  USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );
