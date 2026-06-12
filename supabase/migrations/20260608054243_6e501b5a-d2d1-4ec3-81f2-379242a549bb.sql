-- Fix 1: Restrict batch_schedules public read to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active schedules" ON public.batch_schedules;

CREATE POLICY "Authenticated users can view active schedules"
ON public.batch_schedules
FOR SELECT
TO authenticated
USING (active = true);

-- Fix 2: Allow admins to access all files in the student-docs storage bucket
DROP POLICY IF EXISTS "Admins can view all student-docs" ON storage.objects;
CREATE POLICY "Admins can view all student-docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-docs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can manage all student-docs" ON storage.objects;
CREATE POLICY "Admins can manage all student-docs"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'student-docs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'student-docs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
