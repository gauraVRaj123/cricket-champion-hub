
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS playing_role text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS medical_info text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS dob date;

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  opponent text,
  match_date date NOT NULL,
  start_time time,
  location text,
  format text NOT NULL DEFAULT 'practice',
  status text NOT NULL DEFAULT 'upcoming',
  batch_id uuid,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_matches_updated BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- MATCH PERFORMANCES
CREATE TABLE public.match_performances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  student_id uuid NOT NULL,
  batting_runs integer DEFAULT 0,
  balls_faced integer DEFAULT 0,
  fours integer DEFAULT 0,
  sixes integer DEFAULT 0,
  dismissal text,
  overs_bowled numeric(4,1) DEFAULT 0,
  runs_conceded integer DEFAULT 0,
  wickets integer DEFAULT 0,
  catches integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_performances TO authenticated;
GRANT ALL ON public.match_performances TO service_role;
ALTER TABLE public.match_performances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage match perf" ON public.match_performances FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Coaches read assigned match perf" ON public.match_performances FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.batch_schedules bs ON bs.id = s.batch_id
    JOIN public.coaches c ON c.id = bs.coach_id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Coaches insert match perf for assigned" ON public.match_performances FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.batch_schedules bs ON bs.id = s.batch_id
    JOIN public.coaches c ON c.id = bs.coach_id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Coaches update match perf for assigned" ON public.match_performances FOR UPDATE TO authenticated
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.batch_schedules bs ON bs.id = s.batch_id
    JOIN public.coaches c ON c.id = bs.coach_id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Students read own match perf" ON public.match_performances FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View announcements for my role" ON public.announcements FOR SELECT TO authenticated
  USING (
    audience = 'all'
    OR (audience = 'admin' AND public.has_role(auth.uid(),'admin'))
    OR (audience = 'coach' AND public.has_role(auth.uid(),'coach'))
    OR (audience = 'student' AND public.has_role(auth.uid(),'student'))
  );
CREATE POLICY "Admins and coaches create announcements" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coach'));
CREATE POLICY "Admins delete announcements" ON public.announcements FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- MESSAGES (coach/admin → student)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_student_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sender reads own sent messages" ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid());
CREATE POLICY "Recipient student reads own messages" ON public.messages FOR SELECT TO authenticated
  USING (recipient_student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Admins read all messages" ON public.messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Coach or admin send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coach'))
  );
CREATE POLICY "Recipient marks read" ON public.messages FOR UPDATE TO authenticated
  USING (recipient_student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- RESOURCES
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'video',
  url text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in view resources" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins coaches add resources" ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coach'));
CREATE POLICY "Admins delete resources" ON public.resources FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'award',
  awarded_on date NOT NULL DEFAULT CURRENT_DATE,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Coaches read assigned achievements" ON public.achievements FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.batch_schedules bs ON bs.id = s.batch_id
    JOIN public.coaches c ON c.id = bs.coach_id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Students read own achievements" ON public.achievements FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
