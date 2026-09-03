import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if valid Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('http')
);

// Fallback mock client wrapper to prevent fatal initialization crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-liveclass-dummy.supabase.co', 'dummy-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

export default supabase;
