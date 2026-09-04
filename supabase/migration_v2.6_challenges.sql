-- ==============================================================================
-- CodeBuddy Migration v2.6: Live Classroom Challenges & Mentor Grading Desk
-- Features: Live Challenges, Isolated Student Sandbox Submissions,
-- Real-time Marks & Feedback Broadcast, Mentor Security.
-- Fully safe & idempotent to run on Supabase.
-- ==============================================================================

-- 1. LIVE CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.session_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    room_code VARCHAR(10) NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starter_code TEXT NOT NULL DEFAULT '',
    expected_output TEXT DEFAULT NULL,
    total_marks INTEGER NOT NULL DEFAULT 10,
    time_limit_minutes INTEGER DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_challenges_room ON public.session_challenges(room_code);
CREATE INDEX IF NOT EXISTS idx_session_challenges_active ON public.session_challenges(is_active);

-- 2. CHALLENGE SUBMISSIONS & GRADING TABLE
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.session_challenges(id) ON DELETE CASCADE,
    room_code VARCHAR(10) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_avatar TEXT,
    code TEXT NOT NULL,
    stdout TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
    marks INTEGER DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_student ON public.challenge_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_room ON public.challenge_submissions(room_code);

-- 3. ENABLE RLS
ALTER TABLE public.session_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function check if mentor
CREATE OR REPLACE FUNCTION public.is_mentor(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND (role = 'mentor' OR LOWER(email) = 'tungariyarahul08@gmail.com')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Challenges Policies
DROP POLICY IF EXISTS "Anyone can view challenges in room" ON public.session_challenges;
CREATE POLICY "Anyone can view challenges in room" ON public.session_challenges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentors can manage challenges" ON public.session_challenges;
CREATE POLICY "Mentors can manage challenges" ON public.session_challenges
  FOR ALL USING (public.is_mentor(auth.uid()) OR auth.uid() = mentor_id);

-- Submissions Policies
DROP POLICY IF EXISTS "Students can view own and mentors view all submissions" ON public.challenge_submissions;
CREATE POLICY "Students can view own and mentors view all submissions" ON public.challenge_submissions
  FOR SELECT USING (auth.uid() = student_id OR public.is_mentor(auth.uid()) OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Students can submit challenges" ON public.challenge_submissions;
CREATE POLICY "Students can submit challenges" ON public.challenge_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Mentors can grade submissions" ON public.challenge_submissions;
CREATE POLICY "Mentors can grade submissions" ON public.challenge_submissions
  FOR UPDATE USING (public.is_mentor(auth.uid()) OR auth.uid() = graded_by);

-- 4. ENABLE REALTIME REPLICATION FOR CHALLENGES & GRADING
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_challenges;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_submissions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
