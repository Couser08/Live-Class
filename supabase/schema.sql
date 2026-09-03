-- ==============================================================================
-- CodeBuddy Production Database Schema for Supabase
-- Phase 2 & Beta Launch: Real-time Live Classrooms, RBAC & Auth Integration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mentor', 'student', 'friend', 'viewer')),
    is_online BOOLEAN DEFAULT false,
    status_text TEXT DEFAULT 'Available to Learn',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSIONS (CLASSROOM ROOMS) TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g. 'CB-8821'
    pin VARCHAR(6) NOT NULL,          -- e.g. '5540'
    title TEXT NOT NULL DEFAULT 'Live Coding Classroom',
    language TEXT NOT NULL DEFAULT 'html' CHECK (language IN ('html', 'c', 'javascript')),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_live BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 3. SESSION PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mentor', 'student', 'friend', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(session_id, user_id)
);

-- 4. SESSION FILES (REAL-TIME CODE FILES) TABLE
CREATE TABLE IF NOT EXISTS public.session_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'index.html',
    language TEXT NOT NULL DEFAULT 'html' CHECK (language IN ('html', 'c', 'javascript')),
    content TEXT NOT NULL DEFAULT '',
    is_entrypoint BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESSION MESSAGES & LIVE QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.session_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. SESSION NOTES (LIVE MARKDOWN NOTES) TABLE
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Classroom Notes',
    content TEXT NOT NULL DEFAULT '',
    code_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'html',
    starter_code TEXT DEFAULT '',
    solution_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'passed')),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER (ROLE ASSIGNMENT)
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
  -- Determine role based on email
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.sessions(code);
CREATE INDEX IF NOT EXISTS idx_session_files_session_id ON public.session_files(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON public.session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON public.session_notes(session_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Permissive policies for Beta release
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update to profiles" ON public.profiles;
CREATE POLICY "Allow public insert/update to profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to sessions" ON public.sessions;
CREATE POLICY "Allow public read access to sessions" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update to sessions" ON public.sessions;
CREATE POLICY "Allow public insert/update to sessions" ON public.sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to session_participants" ON public.session_participants;
CREATE POLICY "Allow public access to session_participants" ON public.session_participants FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to session_files" ON public.session_files;
CREATE POLICY "Allow public access to session_files" ON public.session_files FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to session_messages" ON public.session_messages;
CREATE POLICY "Allow public access to session_messages" ON public.session_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to session_notes" ON public.session_notes;
CREATE POLICY "Allow public access to session_notes" ON public.session_notes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to assignments" ON public.assignments;
CREATE POLICY "Allow public access to assignments" ON public.assignments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to assignment_submissions" ON public.assignment_submissions;
CREATE POLICY "Allow public access to assignment_submissions" ON public.assignment_submissions FOR ALL USING (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.sessions, 
    public.session_files, 
    public.session_messages, 
    public.session_participants,
    public.session_notes;
COMMIT;
