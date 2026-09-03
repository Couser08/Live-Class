import { create } from 'zustand';
import { RoomSession, SupportedLanguage, UserProfile, SessionMetrics } from '../types/session.types';
import { generatePin, generateRoomCode } from '../lib/utils';
import { sessionService } from '../services/sessionService';
import { isMentorEmail } from './authStore';
import { useCodeStore } from './codeStore';

interface SessionState {
  currentSession: RoomSession | null;
  activeSessionCardData: RoomSession | null;
  activeSessionsList: RoomSession[];
  metrics: SessionMetrics;
  currentUser: UserProfile;
  userRoleInSession: 'mentor' | 'student';
  isFollowingMentor: boolean;
  isSandboxMode: boolean;
  mentorCursorPos: { line: number; col: number };

  createSession: (title: string, language: SupportedLanguage, mentorUser?: UserProfile) => RoomSession;
  joinSession: (
    roomCode: string,
    pin: string,
    user?: UserProfile
  ) => Promise<{ success: boolean; error?: string; role?: 'mentor' | 'student' }>;
  selectSession: (session: RoomSession) => void;
  leaveSession: () => void;
  endSession: () => void;
  updateLanguage: (language: SupportedLanguage) => void;
  setCurrentUser: (user: Partial<UserProfile>) => void;
  toggleSandboxMode: () => void;
  setFollowingMentor: (val: boolean) => void;
  setMentorCursor: (pos: { line: number; col: number }) => void;
  loadSessions: () => Promise<void>;
}

// Default guest user is strictly a student learner, NOT mentor!
const defaultGuestUser: UserProfile = {
  id: 'usr_guest_learner',
  name: 'Student Learner',
  email: 'learner@codebuddy.app',
  role: 'student',
  isOnline: true,
  statusText: 'Student Learner',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

const getInitialUser = (): UserProfile => {
  if (typeof window === 'undefined') return defaultGuestUser;
  try {
    const raw = localStorage.getItem('codebuddy_auth_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) {
        if (isMentorEmail(parsed.email) || parsed.role === 'mentor') {
          parsed.isPro = true;
          parsed.proPlan = 'Mentor Pro Lifetime';
        }
        return parsed;
      }
    }
  } catch {}
  return defaultGuestUser;
};

const initialUser = getInitialUser();
const initialIsMentor = isMentorEmail(initialUser.email);

const getSavedSessions = (): RoomSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('codebuddy_active_sessions');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const getSavedCurrentSession = (): RoomSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('codebuddy_current_session');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const initialCurrentSession = getSavedCurrentSession();
const initialSavedList = getSavedSessions();
const sessionMentorMatches = initialCurrentSession && (
  initialCurrentSession.mentor?.id === initialUser.id || 
  isMentorEmail(initialUser.email) || 
  initialCurrentSession.mentor?.email === initialUser.email
);

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: initialCurrentSession,
  activeSessionCardData: initialCurrentSession || (initialSavedList[0] || null),
  activeSessionsList: initialSavedList,
  currentUser: initialUser,
  userRoleInSession: (sessionMentorMatches || initialIsMentor) ? 'mentor' : 'student',
  isFollowingMentor: !(sessionMentorMatches || initialIsMentor),
  isSandboxMode: false,
  mentorCursorPos: { line: 1, col: 1 },
  metrics: {
    sessionsCompleted: 0,
    teachingTimeHours: 0,
    teachingTimeMinutes: 0,
    questionsAnswered: 0,
    happyLearners: 0,
  },

  loadSessions: async () => {
    const saved = getSavedSessions();
    set({ activeSessionsList: saved });
  },

  createSession: (title: string, language: SupportedLanguage, mentorUser?: UserProfile) => {
    const code = generateRoomCode();
    const pin = generatePin();
    const mentor = mentorUser || get().currentUser;
    const shareableUrl = `${window.location.origin}/join/${code}?pin=${pin}`;

    const newSession: RoomSession = {
      id: `sess_${Date.now()}`,
      code,
      pin,
      title: title || `${language.toUpperCase()} Live Classroom`,
      language,
      mentor,
      activeLearners: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
      shareableUrl,
    };

    const updatedList = [newSession, ...get().activeSessionsList.filter((s) => s.code !== code)];
    try {
      localStorage.setItem('codebuddy_active_sessions', JSON.stringify(updatedList));
      localStorage.setItem(`cb_session_${code}`, JSON.stringify(newSession));
      localStorage.setItem('codebuddy_current_session', JSON.stringify(newSession));
    } catch {}

    // Immediately insert into Supabase table so incognito & external users can join!
    sessionService.createSession({
      code,
      pin,
      title: newSession.title,
      language,
      mentorId: mentor.id,
      mentorName: mentor.name,
    });

    // Switch workspace editor files to the selected language template!
    useCodeStore.getState().setLanguage(language);

    set({
      currentSession: newSession,
      activeSessionCardData: newSession,
      activeSessionsList: updatedList,
      userRoleInSession: 'mentor',
      isFollowingMentor: false,
      isSandboxMode: false,
    });

    return newSession;
  },

  joinSession: async (roomCode: string, pin: string, user?: UserProfile) => {
    const activeUser = user || get().currentUser;
    const res = await sessionService.joinSession(roomCode, pin, activeUser);

    if (!res.success || !res.session) {
      return { success: false, error: res.error || 'Failed to join session.' };
    }

    const sessionData = res.session;
    const joinedSession: RoomSession = {
      id: sessionData.id,
      code: sessionData.code,
      pin: sessionData.pin,
      title: sessionData.title,
      language: sessionData.language,
      mentor: {
        id: sessionData.mentorId || 'mentor_01',
        name: sessionData.mentorName || 'Rahul Sharma',
        role: 'mentor',
        isOnline: true,
        statusText: 'Senior Peer Mentor',
      },
      activeLearners: [activeUser],
      createdAt: 'Active Now',
      isLive: true,
      shareableUrl: `${window.location.origin}/join/${sessionData.code}?pin=${sessionData.pin}`,
      description: sessionData.description,
    };

    const updatedList = [joinedSession, ...get().activeSessionsList.filter((s) => s.code !== sessionData.code)];
    try {
      localStorage.setItem('codebuddy_active_sessions', JSON.stringify(updatedList));
      localStorage.setItem(`cb_session_${sessionData.code}`, JSON.stringify(joinedSession));
      localStorage.setItem('codebuddy_current_session', JSON.stringify(joinedSession));
    } catch {}

    // Switch workspace code editor files to match joined classroom language!
    useCodeStore.getState().setLanguage(sessionData.language);

    // Strictly enforce student role unless user's email matches mentor email
    const finalRole = isMentorEmail(activeUser.email) ? 'mentor' : 'student';

    set({
      currentSession: joinedSession,
      activeSessionCardData: joinedSession,
      activeSessionsList: updatedList,
      userRoleInSession: finalRole,
      isFollowingMentor: finalRole === 'student',
      isSandboxMode: false,
    });

    return { success: true, role: finalRole };
  },

  selectSession: (session: RoomSession) => {
    const isMentor = isMentorEmail(get().currentUser.email) || session.mentor?.id === get().currentUser.id;
    useCodeStore.getState().setLanguage(session.language);
    try {
      localStorage.setItem('codebuddy_current_session', JSON.stringify(session));
    } catch {}
    set({
      currentSession: session,
      activeSessionCardData: session,
      userRoleInSession: isMentor ? 'mentor' : 'student',
      isFollowingMentor: !isMentor,
      isSandboxMode: false,
    });
  },

  leaveSession: () => {
    try {
      localStorage.removeItem('codebuddy_current_session');
    } catch {}
    set({
      currentSession: null,
      userRoleInSession: 'student',
      isFollowingMentor: true,
      isSandboxMode: false,
    });
  },

  endSession: () => {
    const current = get().currentSession;
    try {
      localStorage.removeItem('codebuddy_current_session');
    } catch {}
    if (current) {
      sessionService.broadcastMessage(current.code, {
        id: `msg_end_${Date.now()}`,
        sessionId: current.id,
        senderName: 'System',
        senderRole: 'mentor',
        content: 'This live session has been ended by the mentor.',
        createdAt: 'Now',
      });

      const updatedList = get().activeSessionsList.filter((s) => s.code !== current.code);
      try {
        localStorage.setItem('codebuddy_active_sessions', JSON.stringify(updatedList));
        localStorage.removeItem(`cb_session_${current.code}`);
      } catch {}

      set((state) => ({
        currentSession: null,
        activeSessionCardData: null,
        activeSessionsList: updatedList,
        metrics: {
          ...state.metrics,
          sessionsCompleted: state.metrics.sessionsCompleted + 1,
        },
      }));
    } else {
      set({
        currentSession: null,
        activeSessionCardData: null,
      });
    }
  },

  updateLanguage: (language: SupportedLanguage) => {
    const current = get().currentSession;
    if (current) {
      useCodeStore.getState().setLanguage(language);
      const updated = { ...current, language };
      set({
        currentSession: updated,
        activeSessionCardData: updated,
      });
    }
  },

  setCurrentUser: (user: Partial<UserProfile>) => {
    set((state) => {
      const updatedUser = { ...state.currentUser, ...user };
      const isMentor = isMentorEmail(updatedUser.email) || updatedUser.role === 'mentor';
      if (isMentor) {
        updatedUser.isPro = true;
        updatedUser.proPlan = 'Mentor Pro Lifetime';
      }
      return {
        currentUser: updatedUser,
        userRoleInSession: isMentor ? 'mentor' : 'student',
        isFollowingMentor: !isMentor,
      };
    });
  },

  toggleSandboxMode: () => {
    set((state) => ({ isSandboxMode: !state.isSandboxMode }));
  },

  setFollowingMentor: (val: boolean) => {
    set({ isFollowingMentor: val });
  },

  setMentorCursor: (pos: { line: number; col: number }) => {
    set({ mentorCursorPos: pos });
  },
}));
