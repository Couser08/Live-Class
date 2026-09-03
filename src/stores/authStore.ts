import { create } from 'zustand';
import { UserProfile, UserRole } from '../types/session.types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const MENTOR_EMAIL = 'tungariyarahul08@gmail.com';

export const isMentorEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === MENTOR_EMAIL.toLowerCase();
};

export const determineUserRole = (email?: string | null): UserRole => {
  return isMentorEmail(email) ? 'mentor' : 'student';
};

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoLogin: (role: 'mentor' | 'student') => void;
  initializeAuth: () => Promise<void>;
}

const DEFAULT_MENTOR: UserProfile = {
  id: 'usr_rahul_mentor',
  name: 'Rahul Sharma',
  email: MENTOR_EMAIL,
  role: 'mentor',
  isOnline: true,
  statusText: 'Senior Peer Mentor',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_STUDENT: UserProfile = {
  id: 'usr_learner_01',
  name: 'Aarav Patel',
  email: 'aarav.student@codebuddy.app',
  role: 'student',
  isOnline: true,
  statusText: 'Learning Live Coding',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('codebuddy_auth_user');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load stored auth user:', err);
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  isLoading: false,
  isAuthModalOpen: false,
  authModalMode: 'signin',

  openAuthModal: (mode = 'signin') => {
    set({ isAuthModalOpen: true, authModalMode: mode });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },

  signIn: async (email: string, password = 'password123') => {
    set({ isLoading: true });
    const normalizedEmail = email.trim().toLowerCase();
    const role = determineUserRole(normalizedEmail);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!error && data?.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || (role === 'mentor' ? 'Rahul Sharma' : normalizedEmail.split('@')[0]),
            email: normalizedEmail,
            role,
            isOnline: true,
            statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
            avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
          };

          localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
          set({ user: profile, isLoading: false, isAuthModalOpen: false });
          return { success: true };
        }
      }

      // Local / Fallback Sign In
      const name = role === 'mentor' ? 'Rahul Sharma' : normalizedEmail.split('@')[0];
      const profile: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: normalizedEmail,
        role,
        isOnline: true,
        statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
        avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
      };

      localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
      set({ user: profile, isLoading: false, isAuthModalOpen: false });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err?.message || 'Failed to sign in.' };
    }
  },

  signUp: async (name: string, email: string, password = 'password123') => {
    set({ isLoading: true });
    const normalizedEmail = email.trim().toLowerCase();
    const role = determineUserRole(normalizedEmail);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name, role },
          },
        });

        if (!error && data?.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              name,
              email: normalizedEmail,
              role: role === 'mentor' ? 'mentor' : 'friend',
              is_online: true,
            });
          } catch {}

          const profile: UserProfile = {
            id: data.user.id,
            name,
            email: normalizedEmail,
            role,
            isOnline: true,
            statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
            avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
          };

          localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
          set({ user: profile, isLoading: false, isAuthModalOpen: false });
          return { success: true };
        }
      }

      // Local / Fallback Sign Up
      const profile: UserProfile = {
        id: `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
        role,
        isOnline: true,
        statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
        avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
      };

      localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
      set({ user: profile, isLoading: false, isAuthModalOpen: false });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err?.message || 'Failed to sign up.' };
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem('codebuddy_auth_user');
    set({ user: null, isAuthModalOpen: false });
  },

  demoLogin: (role: 'mentor' | 'student') => {
    const profile = role === 'mentor' ? DEFAULT_MENTOR : DEFAULT_STUDENT;
    localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
    set({ user: profile, isAuthModalOpen: false });
  },

  initializeAuth: async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const email = data.session.user.email || '';
        const role = determineUserRole(email);
        const name = data.session.user.user_metadata?.name || email.split('@')[0];

        const profile: UserProfile = {
          id: data.session.user.id,
          name,
          email,
          role,
          isOnline: true,
          statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
          avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
        };

        localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
        set({ user: profile });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          const role = determineUserRole(email);
          const name = session.user.user_metadata?.name || email.split('@')[0];

          const profile: UserProfile = {
            id: session.user.id,
            name,
            email,
            role,
            isOnline: true,
            statusText: role === 'mentor' ? 'Senior Peer Mentor' : 'Student Learner',
            avatarUrl: role === 'mentor' ? DEFAULT_MENTOR.avatarUrl : DEFAULT_STUDENT.avatarUrl,
          };
          localStorage.setItem('codebuddy_auth_user', JSON.stringify(profile));
          set({ user: profile });
        } else if (_event === 'SIGNED_OUT') {
          localStorage.removeItem('codebuddy_auth_user');
          set({ user: null });
        }
      });
    } catch (err) {
      console.error('Error in initializeAuth:', err);
    }
  },
}));
