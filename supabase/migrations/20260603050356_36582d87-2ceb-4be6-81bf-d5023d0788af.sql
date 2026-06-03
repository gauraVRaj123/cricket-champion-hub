-- Add monthly fee to existing batches table
ALTER TABLE public.batch_schedules ADD COLUMN IF NOT EXISTS monthly_fee numeric(10,2) DEFAULT 0;

-- =========== STUDENTS ===========
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  age integer,
  parent_name text,
  phone text,
  email text,
  batch_id uuid REFERENCES public.batch_schedules(id) ON DELETE SET NULL,
  monthly_fee numeric(10,2) DEFAULT 0,
  joined_on date NOT NULL DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage students" ON public.students
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students read own row" ON public.students
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Coaches read assigned students" ON public.students
  FOR SELECT TO authenticated
  USING (
    batch_id IN (
      SELECT bs.id FROM public.batch_schedules bs
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========== ATTENDANCE ===========
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.batch_schedules(id) ON DELETE SET NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late')),
  marked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students read own attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Coaches read assigned attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    batch_id IN (
      SELECT bs.id FROM public.batch_schedules bs
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches insert attendance" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    batch_id IN (
      SELECT bs.id FROM public.batch_schedules bs
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches update assigned attendance" ON public.attendance
  FOR UPDATE TO authenticated
  USING (
    batch_id IN (
      SELECT bs.id FROM public.batch_schedules bs
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

-- =========== FEE PAYMENTS ===========
CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  fee_month date NOT NULL,
  paid_on date NOT NULL DEFAULT CURRENT_DATE,
  method text DEFAULT 'cash',
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fee payments" ON public.fee_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students read own payments" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- =========== PERFORMANCE NOTES ===========
CREATE TABLE public.performance_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES public.coaches(id) ON DELETE SET NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_notes TO authenticated;
GRANT ALL ON public.performance_notes TO service_role;
ALTER TABLE public.performance_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage performance" ON public.performance_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students read own performance" ON public.performance_notes
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Coaches read assigned performance" ON public.performance_notes
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.batch_schedules bs ON bs.id = s.batch_id
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches add performance notes" ON public.performance_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    AND student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.batch_schedules bs ON bs.id = s.batch_id
      JOIN public.coaches c ON c.id = bs.coach_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE INDEX idx_students_batch ON public.students(batch_id);
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, session_date);
CREATE INDEX idx_attendance_batch_date ON public.attendance(batch_id, session_date);
CREATE INDEX idx_fee_student_month ON public.fee_payments(student_id, fee_month);
CREATE INDEX idx_perf_student ON public.performance_notes(student_id);