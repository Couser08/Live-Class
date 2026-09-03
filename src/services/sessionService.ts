import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupportedLanguage, UserProfile } from '../types/session.types';
import { isMentorEmail } from '../stores/authStore';

export interface SessionData {
  id: string;
  code: string;
  pin: string;
  title: string;
  language: SupportedLanguage;
  isLive: boolean;
  description?: string;
  mentorId?: string;
  mentorName?: string;
}

export interface ChatMessageItem {
  id: string;
  sessionId: string;
  senderName: string;
  senderRole: 'mentor' | 'student';
  senderAvatar?: string;
  content: string;
  createdAt: string;
  isHighlighted?: boolean;
  codeLine?: number;
}

export interface RealtimeCodePayload {
  code: string;
  fileId?: string;
  language: string;
  cursorPos?: { line: number; col: number };
  mentorName?: string;
  timestamp?: number;
}

// In-browser BroadcastChannel singleton cache for zero-latency cross-tab communication
const channelCache = new Map<string, BroadcastChannel>();

const getBroadcastChannel = (roomCode: string): BroadcastChannel | null => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
  const clean = roomCode.trim().toUpperCase();
  if (!channelCache.has(clean)) {
    try {
      channelCache.set(clean, new BroadcastChannel(`codebuddy_room_${clean}`));
    } catch {
      return null;
    }
  }
  return channelCache.get(clean) || null;
};

export const sessionService = {
  /**
   * Create and register session in Supabase and broadcast
   */
  async createSession(session: {
    code: string;
    pin: string;
    title: string;
    language: SupportedLanguage;
    mentorId?: string;
    mentorName?: string;
    description?: string;
  }): Promise<void> {
    const cleanCode = session.code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sessions').upsert(
          {
            code: cleanCode,
            pin: session.pin,
            title: session.title,
            language: session.language,
            is_live: true,
            description: session.description || `${session.language.toUpperCase()} Live Classroom`,
          },
          { onConflict: 'code' }
        );
      } catch (err) {
        console.warn('Supabase session insert error:', err);
      }
    }

    try {
      const channel = getBroadcastChannel('GLOBAL_SESSIONS');
      if (channel) {
        channel.postMessage({ type: 'SESSION_CREATED', payload: session });
      }
    } catch {}
  },

  /**
   * Fetch session details by code
   */
  async getSessionByCode(code: string): Promise<SessionData | null> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('code', cleanCode)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            code: data.code,
            pin: data.pin,
            title: data.title,
            language: data.language as SupportedLanguage,
            isLive: data.is_live,
            description: data.description,
            mentorId: data.mentor_id,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch error, checking local sessions:', err);
      }
    }

    // Check localStorage for recently created sessions
    try {
      const local = localStorage.getItem(`cb_session_${cleanCode}`);
      if (local) return JSON.parse(local);

      const allActive = localStorage.getItem('codebuddy_active_sessions');
      if (allActive) {
        const list: any[] = JSON.parse(allActive);
        const match = list.find((s) => s.code?.toUpperCase() === cleanCode);
        if (match) {
          return {
            id: match.id,
            code: match.code,
            pin: match.pin,
            title: match.title,
            language: match.language,
            isLive: match.isLive,
            description: match.description,
            mentorId: match.mentor?.id,
            mentorName: match.mentor?.name,
          };
        }
      }
    } catch {}

    return null;
  },

  /**
   * Validate credentials and join session
   */
  async joinSession(
    code: string,
    pin: string,
    user: UserProfile
  ): Promise<{ success: boolean; session?: SessionData; role: 'mentor' | 'student'; error?: string }> {
    const session = await this.getSessionByCode(code);

    if (!session) {
      return {
        success: false,
        role: 'student',
        error: `Room code "${code.toUpperCase()}" was not found.`,
      };
    }

    if (!session.isLive) {
      return {
        success: false,
        role: 'student',
        error: 'This live session has already ended.',
      };
    }

    // Validate PIN if present
    if (session.pin && pin.trim() !== session.pin.trim()) {
      return {
        success: false,
        role: 'student',
        error: 'Incorrect 4-digit PIN for this classroom.',
      };
    }

    // Determine Role:
    // If user's email is tungariyarahul08@gmail.com OR user is the mentor who created the session
    const isMentor = isMentorEmail(user.email) || (session.mentorId && session.mentorId === user.id);
    const role: 'mentor' | 'student' = isMentor ? 'mentor' : 'student';

    // Register participant in Supabase if online
    if (isSupabaseConfigured && user.id) {
      try {
        await supabase.from('session_participants').upsert({
          session_id: session.id,
          user_id: user.id,
          role: role === 'mentor' ? 'mentor' : 'student',
          is_active: true,
        });
      } catch {}
    }

    if (role === 'student') {
      this.broadcastStudentReached(code, user);
    }

    return {
      success: true,
      session,
      role,
    };
  },

  /**
   * Broadcast code change to connected students
   */
  broadcastCode(roomCode: string, payload: RealtimeCodePayload) {
    const clean = roomCode.trim().toUpperCase();
    const channel = getBroadcastChannel(clean);
    if (channel) {
      try {
        channel.postMessage({ type: 'CODE_STREAM', payload });
      } catch {}
    }

    // LocalStorage fallback for zero-loss cross-tab sync
    try {
      localStorage.setItem(`cb_sync_${clean}`, JSON.stringify({
        payload,
        t: payload.timestamp || Date.now(),
      }));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        const sbChannel = supabase.channel(`room:${clean}`);
        sbChannel.send({
          type: 'broadcast',
          event: 'code_stream',
          payload,
        });
      } catch {}
    }
  },

  /**
   * Broadcast a chat message or Q&A question
   */
  broadcastMessage(roomCode: string, message: ChatMessageItem) {
    const clean = roomCode.trim().toUpperCase();
    const channel = getBroadcastChannel(clean);
    if (channel) {
      try {
        channel.postMessage({ type: 'CHAT_MESSAGE', payload: message });
      } catch {}
    }

    try {
      localStorage.setItem(`cb_chat_${clean}`, JSON.stringify({
        message,
        t: Date.now(),
      }));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        const sbChannel = supabase.channel(`room:${clean}`);
        sbChannel.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: message,
        });
      } catch {}
    }
  },

  /**
   * Broadcast that a student has reached and joined the live classroom
   */
  broadcastStudentReached(roomCode: string, student: UserProfile) {
    const clean = roomCode.trim().toUpperCase();
    const channel = getBroadcastChannel(clean);
    const payload = { user: student, timestamp: Date.now() };

    if (channel) {
      try { channel.postMessage({ type: 'STUDENT_REACHED', payload }); } catch {}
    }

    try {
      localStorage.setItem(`cb_reached_${clean}`, JSON.stringify(payload));
      const key = `cb_students_${clean}`;
      const existing: UserProfile[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.some((s) => s.id === student.id || s.email === student.email)) {
        existing.push(student);
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch {}

    if (isSupabaseConfigured) {
      try {
        supabase.channel(`room:${clean}`).send({ type: 'broadcast', event: 'student_reached', payload });
      } catch {}
    }
  },

  getConnectedStudents(roomCode: string): UserProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`cb_students_${roomCode.trim().toUpperCase()}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Subscribe to real-time events for a room
   */
  subscribeToRoom(
    roomCode: string,
    callbacks: {
      onCodeUpdate?: (payload: RealtimeCodePayload) => void;
      onCodeStream?: (payload: RealtimeCodePayload) => void;
      onChatMessage?: (payload: ChatMessageItem) => void;
      onStudentReached?: (student: UserProfile) => void;
    }
  ) {
    const cleanCode = roomCode.trim().toUpperCase();
    const channel = getBroadcastChannel(cleanCode);

    let lastCodeTimestamp = 0;
    const handleCodePayload = (payload: RealtimeCodePayload) => {
      if (payload.timestamp && payload.timestamp < lastCodeTimestamp) return;
      if (payload.timestamp) lastCodeTimestamp = payload.timestamp;
      callbacks.onCodeStream?.(payload);
      callbacks.onCodeUpdate?.(payload);
    };

    const handleMsg = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'CODE_STREAM' && data.payload) {
        handleCodePayload(data.payload);
      } else if (data.type === 'CHAT_MESSAGE' && data.payload) {
        callbacks.onChatMessage?.(data.payload);
      } else if (data.type === 'STUDENT_REACHED' && data.payload?.user) {
        callbacks.onStudentReached?.(data.payload.user);
      }
    };

    if (channel) {
      channel.addEventListener('message', handleMsg);
    }

    // Storage event listener ensures changes always reflect even across disparate browser windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `cb_sync_${cleanCode}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.payload) {
            handleCodePayload(parsed.payload);
          }
        } catch {}
      } else if (e.key === `cb_chat_${cleanCode}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.message) {
            callbacks.onChatMessage?.(parsed.message);
          }
        } catch {}
      } else if (e.key === `cb_reached_${cleanCode}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.user) {
            callbacks.onStudentReached?.(parsed.user);
          }
        } catch {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    let sbSubscription: any = null;
    if (isSupabaseConfigured) {
      try {
        sbSubscription = supabase
          .channel(`room:${cleanCode}`)
          .on('broadcast', { event: 'code_stream' }, ({ payload }) => {
            handleCodePayload(payload);
          })
          .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
            callbacks.onChatMessage?.(payload);
          })
          .on('broadcast', { event: 'student_reached' }, ({ payload }) => {
            if (payload?.user) {
              callbacks.onStudentReached?.(payload.user);
            }
          })
          .subscribe();
      } catch {}
    }

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleMsg);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      if (sbSubscription && isSupabaseConfigured) {
        supabase.removeChannel(sbSubscription);
      }
    };
  },

  /**
   * Fetch real-time chat messages for a session
   */
  async getMessages(sessionId: string): Promise<ChatMessageItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('session_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            sessionId: d.session_id,
            senderName: d.sender_name,
            senderRole: d.sender_role,
            senderAvatar: d.sender_avatar,
            content: d.content,
            createdAt: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isHighlighted: d.is_highlighted,
          }));
        }
      } catch {}
    }

    // Check localStorage messages for this session
    try {
      const saved = localStorage.getItem(`cb_msgs_${sessionId}`);
      if (saved) return JSON.parse(saved);
    } catch {}

    return [];
  },

  /**
   * Send a chat message or question
   */
  async sendMessage(msg: Omit<ChatMessageItem, 'id' | 'createdAt'>): Promise<ChatMessageItem> {
    const newMsg: ChatMessageItem = {
      ...msg,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('session_messages').insert({
          session_id: msg.sessionId,
          sender_name: msg.senderName,
          sender_role: msg.senderRole,
          sender_avatar: msg.senderAvatar,
          content: msg.content,
        });
      } catch {}
    }

    try {
      const key = `cb_msgs_${msg.sessionId}`;
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      list.push(newMsg);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    return newMsg;
  },
};
