-- ==============================================================================
-- CodeBuddy Production & Latest Realtime Database Migration (v2.5 - Idempotent)
-- Features: Piston Remote GCC Execution, Multi-file Submissions, Live Classrooms,
-- Realtime Presence & Sync, Pro Trial Fields, and Role-Based Access Control.
-- Fully safe to run repeatedly on existing databases.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mentor', 'student', 'friend', 'viewer')),
    is_online BOOLEAN DEFAULT false,
    status_text TEXT DEFAULT 'Available to Learn',
    is_pro BOOLEAN DEFAULT false,
    pro_plan TEXT DEFAULT NULL,
    trial_expires_at TIMESTAMPTZ DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    stream TEXT DEFAULT NULL,       -- e.g. BCA, MCA, B.Tech, CS
    college_year TEXT DEFAULT NULL, -- e.g. 1st Year, 2nd Year, Final Year
    target_goal TEXT DEFAULT NULL,  -- e.g. Placements, Exams, Full-Stack
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions for existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_plan TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_year TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_goal TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. SESSIONS (LIVE CLASSROOM ROOMS) TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g. 'CB-8821'
    pin VARCHAR(6) NOT NULL,          -- e.g. '5540'
    title TEXT NOT NULL DEFAULT 'Live Coding Classroom',
    language TEXT NOT NULL DEFAULT 'c' CHECK (language IN ('html', 'c', 'javascript')),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_live BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS pin VARCHAR(6) DEFAULT '0000';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'c';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT true;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- 4. SESSION PARTICIPANTS & PRESENCE TABLE
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mentor', 'student', 'friend', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- CRITICAL: Ensure columns exist on pre-existing session_participants before creating view!
ALTER TABLE public.session_participants ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.session_participants ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.session_participants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.session_participants ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Backward compatibility view if legacy code queries session_students
CREATE OR REPLACE VIEW public.session_students AS
  SELECT id, session_id, user_id, role, joined_at, is_active, last_seen_at
  FROM public.session_participants
  WHERE role = 'student';

-- 5. SESSION FILES (LIVE CODE EDITOR FILES) TABLE
CREATE TABLE IF NOT EXISTS public.session_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'main.c',
    language TEXT NOT NULL DEFAULT 'c' CHECK (language IN ('html', 'c', 'javascript')),
    content TEXT NOT NULL DEFAULT '',
    is_entrypoint BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.session_files ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'c';
ALTER TABLE public.session_files ADD COLUMN IF NOT EXISTS is_entrypoint BOOLEAN DEFAULT true;
ALTER TABLE public.session_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. SESSION MESSAGES & Q&A TABLE
CREATE TABLE IF NOT EXISTS public.session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'student',
    sender_avatar TEXT,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('chat', 'question', 'answer', 'system')),
    is_highlighted BOOLEAN DEFAULT false,
    reply_to_id UUID REFERENCES public.session_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'student';
ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS sender_avatar TEXT;
ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'chat';
ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;
ALTER TABLE public.session_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.session_messages(id) ON DELETE SET NULL;

-- 7. SESSION NOTES (MARKDOWN SYNC) TABLE
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Classroom Notes',
    content TEXT NOT NULL DEFAULT '',
    code_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PISTON CODE SUBMISSIONS & EXECUTION AUDIT LOG
CREATE TABLE IF NOT EXISTS public.code_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_code VARCHAR(10) DEFAULT NULL,
    language TEXT NOT NULL DEFAULT 'c',
    source_code TEXT NOT NULL,
    companion_files JSONB DEFAULT '{}'::jsonb,
    stdin_input TEXT,
    stdout_output TEXT,
    stderr_output TEXT,
    exit_code INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('success', 'compile_error', 'runtime_error', 'network_error')),
    engine TEXT DEFAULT 'piston-gcc-10.2',
    compiler_version TEXT DEFAULT '10.2.0',
    execution_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for code_submissions
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS room_code VARCHAR(10) DEFAULT NULL;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS companion_files JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS stdin_input TEXT;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS stdout_output TEXT;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS stderr_output TEXT;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS exit_code INTEGER DEFAULT 0;
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS engine TEXT DEFAULT 'piston-gcc-10.2';
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS compiler_version TEXT DEFAULT '10.2.0';
ALTER TABLE public.code_submissions ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER DEFAULT 0;

-- 9. SHARED CODE ACCESS TABLE
CREATE TABLE IF NOT EXISTS public.shared_access (
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (owner_id, viewer_id)
);

-- ==============================================================================
-- INDEXES FOR FAST HIGH-CONCURRENCY LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.sessions(code);
CREATE INDEX IF NOT EXISTS idx_session_files_session_id ON public.session_files(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON public.session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON public.session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_code_submissions_user_id ON public.code_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_submissions_room_code ON public.code_submissions(room_code);
CREATE INDEX IF NOT EXISTS idx_code_submissions_created_at ON public.code_submissions(created_at DESC);

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER (ROLE ASSIGNMENT & PROFILE PROVISIONING)
-- tungariyarahul08@gmail.com -> Mentor
-- All other emails -> Student
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  IF LOWER(new.email) = 'tungariyarahul08@gmail.com' THEN
    assigned_role := 'mentor';
    user_name := COALESCE(new.raw_user_meta_data->>'name', 'Rahul Sharma');
    user_avatar := 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  ELSE
    assigned_role := 'student';
    user_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    user_avatar := 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_online, avatar_url, status_text)
  VALUES (
    new.id,
    new.email,
    user_name,
    assigned_role,
    true,
    user_avatar,
    CASE WHEN assigned_role = 'mentor' THEN 'Senior Peer Mentor' ELSE 'Student Learner' END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_session_files_updated_at ON public.session_files;
CREATE TRIGGER tr_session_files_updated_at
  BEFORE UPDATE ON public.session_files
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_session_notes_updated_at ON public.session_notes;
CREATE TRIGGER tr_session_notes_updated_at
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- PISTON EXECUTION ANALYTICS FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_execution_stats(p_user_id UUID)
RETURNS TABLE (
  total_runs BIGINT,
  successful_runs BIGINT,
  avg_execution_time_ms NUMERIC,
  latest_language TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_runs,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT AS successful_runs,
    ROUND(COALESCE(AVG(execution_time_ms), 0), 2) AS avg_execution_time_ms,
    COALESCE(
      (SELECT language FROM public.code_submissions WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1),
      'c'
    ) AS latest_language
  FROM public.code_submissions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is the mentor
CREATE OR REPLACE FUNCTION public.is_mentor(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND (role = 'mentor' OR LOWER(email) = 'tungariyarahul08@gmail.com')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_mentor(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_mentor(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_mentor(auth.uid()) OR auth.uid() IS NULL);

-- Sessions Policies
DROP POLICY IF EXISTS "Allow public read access to sessions" ON public.sessions;
CREATE POLICY "Allow public read access to sessions" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Mentors or owners can insert sessions" ON public.sessions;
CREATE POLICY "Mentors or owners can insert sessions" ON public.sessions
  FOR INSERT WITH CHECK (public.is_mentor(auth.uid()) OR mentor_id = auth.uid() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mentors or owners can update sessions" ON public.sessions;
CREATE POLICY "Mentors or owners can update sessions" ON public.sessions
  FOR UPDATE USING (public.is_mentor(auth.uid()) OR mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentors or owners can delete sessions" ON public.sessions;
CREATE POLICY "Mentors or owners can delete sessions" ON public.sessions
  FOR DELETE USING (public.is_mentor(auth.uid()) OR mentor_id = auth.uid());

-- Session Participants Policies
DROP POLICY IF EXISTS "Allow public access to session_participants" ON public.session_participants;
DROP POLICY IF EXISTS "Anyone can view session participants" ON public.session_participants;
CREATE POLICY "Anyone can view session participants" ON public.session_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants can manage their presence" ON public.session_participants;
CREATE POLICY "Participants can manage their presence" ON public.session_participants
  FOR ALL USING (auth.uid() = user_id OR public.is_mentor(auth.uid()) OR auth.uid() IS NULL);

-- Session Files Policies
DROP POLICY IF EXISTS "Allow public access to session_files" ON public.session_files;
DROP POLICY IF EXISTS "Anyone can view session files" ON public.session_files;
CREATE POLICY "Anyone can view session files" ON public.session_files
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants can edit session files" ON public.session_files;
CREATE POLICY "Participants can edit session files" ON public.session_files
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update session files" ON public.session_files;
CREATE POLICY "Participants can update session files" ON public.session_files
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Mentors can delete session files" ON public.session_files;
CREATE POLICY "Mentors can delete session files" ON public.session_files
  FOR DELETE USING (public.is_mentor(auth.uid()));

-- Session Messages Policies
DROP POLICY IF EXISTS "Allow public access to session_messages" ON public.session_messages;
DROP POLICY IF EXISTS "Anyone can view session messages" ON public.session_messages;
CREATE POLICY "Anyone can view session messages" ON public.session_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can post session messages" ON public.session_messages;
CREATE POLICY "Anyone can post session messages" ON public.session_messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Senders or mentors can delete messages" ON public.session_messages;
CREATE POLICY "Senders or mentors can delete messages" ON public.session_messages
  FOR DELETE USING (sender_id = auth.uid() OR public.is_mentor(auth.uid()));

-- Session Notes Policies
DROP POLICY IF EXISTS "Allow public access to session_notes" ON public.session_notes;
DROP POLICY IF EXISTS "Anyone can view session notes" ON public.session_notes;
CREATE POLICY "Anyone can view session notes" ON public.session_notes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants can create and edit session notes" ON public.session_notes;
CREATE POLICY "Participants can create and edit session notes" ON public.session_notes
  FOR ALL USING (true);

-- Code Submissions Policies
DROP POLICY IF EXISTS "Users can view own or shared submissions" ON public.code_submissions;
CREATE POLICY "Users can view own or shared submissions"
  ON public.code_submissions FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.shared_access
      WHERE owner_id = public.code_submissions.user_id
      AND viewer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert submissions" ON public.code_submissions;
CREATE POLICY "Users can insert submissions"
  ON public.code_submissions FOR INSERT
  WITH CHECK (true);

-- Shared Access Policies
DROP POLICY IF EXISTS "Users can manage shared access" ON public.shared_access;
CREATE POLICY "Users can manage shared access"
  ON public.shared_access FOR ALL
  USING (auth.uid() = owner_id);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION (SAFE & IDEMPOTENT)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_files;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.session_notes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.code_submissions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
