-- Allow anon read on core tables (demo auth has no auth.uid())
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.attendance TO anon;
GRANT SELECT ON public.performance_notes TO anon;
GRANT SELECT ON public.fee_payments TO anon;
GRANT SELECT ON public.coaches TO anon;
GRANT INSERT, UPDATE ON public.attendance TO anon;
GRANT INSERT ON public.performance_notes TO anon;

CREATE POLICY "anon read students" ON public.students FOR SELECT TO anon USING (true);
CREATE POLICY "anon read attendance" ON public.attendance FOR SELECT TO anon USING (true);
CREATE POLICY "anon read performance" ON public.performance_notes FOR SELECT TO anon USING (true);
CREATE POLICY "anon read fee payments" ON public.fee_payments FOR SELECT TO anon USING (true);
CREATE POLICY "anon read all coaches" ON public.coaches FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert attendance" ON public.attendance FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update attendance" ON public.attendance FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon insert performance" ON public.performance_notes FOR INSERT TO anon WITH CHECK (true);