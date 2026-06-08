GRANT SELECT ON public.batch_schedules TO anon;
CREATE POLICY "Anyone can view active schedules" ON public.batch_schedules FOR SELECT USING (active = true);