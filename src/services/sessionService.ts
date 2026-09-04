import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupportedLanguage, UserProfile } from '../types/session.types';
import { LiveChallenge, ChallengeSubmission } from '../types/challenge.types';
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
  startedAt?: number;
}

export interface ChatMessageItem {
  id: string;
  sessionId: string;
  senderId?: string;
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
  fileName?: string;
  language: string;
  cursorPos?: { line: number; col: number };
  mentorName?: string;
  timestamp?: number;
}

export interface RoomCallbacks {
  onCodeUpdate?: (payload: RealtimeCodePayload) => void;
  onCodeStream?: (payload: RealtimeCodePayload) => void;
  onChatMessage?: (payload: ChatMessageItem) => void;
  onNotesStream?: (content: string) => void;
  onStudentReached?: (student: UserProfile) => void;
  onPresenceSync?: (students: UserProfile[]) => void;
  onChallengeLaunched?: (challenge: LiveChallenge) => void;
  onChallengeSubmitted?: (submission: ChallengeSubmission) => void;
  onGradeReceived?: (submission: ChallengeSubmission) => void;
  onChallengeEnded?: () => void;
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

interface ManagedRoomChannel {
  cleanCode: string;
  sbChannel: any;
  listeners: Set<RoomCallbacks>;
  lastCodeTimestamp: number;
  broadcastChan?: BroadcastChannel | null;
  broadcastHandler?: (e: MessageEvent) => void;
  storageHandler?: (e: StorageEvent) => void;
}

const managedRooms = new Map<string, ManagedRoomChannel>();
const roomMessages = new Map<string, ChatMessageItem[]>();

export const sessionService = {
  /**
   * Create and register session in Supabase and broadcast
   */
  async createSession(session: {
    id?: string;
    code: string;
    pin: string;
    title: string;
    language: SupportedLanguage;
    mentorId?: string;
    mentorName?: string;
    description?: string;
    startedAt?: number;
  }): Promise<void> {
    const cleanCode = session.code.trim().toUpperCase();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('sessions').upsert({
          ...(session.id ? { id: session.id } : {}),
          code: cleanCode,
          pin: session.pin,
          title: session.title,
          language: session.language,
          is_live: true,
          description: session.description || `${session.language.toUpperCase()} Live Classroom`,
        }, { onConflict: 'code' });
      } catch (err) {
        console.warn('Supabase session insert error:', err);
      }
    }
    const channel = getBroadcastChannel('GLOBAL_SESSIONS');
    if (channel) {
      try { channel.postMessage({ type: 'SESSION_CREATED', payload: session }); } catch {}
    }
  },

  async getSessionByCode(code: string): Promise<SessionData | null> {
    const cleanCode = code.trim().toUpperCase();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').eq('code', cleanCode).single();
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
            startedAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          };
        }
      } catch (err) {
        console.warn('Supabase fetch error, checking local sessions:', err);
      }
    }

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
            startedAt: match.startedAt || Date.now(),
          };
        }
      }
    } catch {}
    return null;
  },

  async joinSession(
    code: string,
    pin: string,
    user: UserProfile
  ): Promise<{ success: boolean; session?: SessionData; role: 'mentor' | 'student'; error?: string }> {
    const session = await this.getSessionByCode(code);
    if (!session) return { success: false, role: 'student', error: `Room code "${code.toUpperCase()}" was not found.` };
    if (!session.isLive) return { success: false, role: 'student', error: 'This live session has already ended.' };
    if (session.pin && pin.trim() !== session.pin.trim()) {
      return { success: false, role: 'student', error: 'Incorrect 4-digit PIN for this classroom.' };
    }

    const isMentor = isMentorEmail(user.email) || (session.mentorId && session.mentorId === user.id);
    const role: 'mentor' | 'student' = isMentor ? 'mentor' : 'student';

    if (isSupabaseConfigured && user.id) {
      try {
        await supabase.from('session_participants').upsert({
          session_id: session.id,
          user_id: user.id,
          role: role === 'mentor' ? 'mentor' : 'student',
          is_active: true,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'session_id,user_id' });
      } catch {}
    }

    if (role === 'student') this.broadcastStudentReached(code, user);
    return { success: true, session, role };
  },

  /**
   * Get or initialize the unified active room channel instance
   */
  getOrCreateManagedRoom(cleanCode: string): ManagedRoomChannel {
    let entry = managedRooms.get(cleanCode);
    if (!entry) {
      entry = { cleanCode, sbChannel: null, listeners: new Set(), lastCodeTimestamp: 0 };
      const broadcastChan = getBroadcastChannel(cleanCode);

      const handlePayload = (type: string, data: any) => {
        if (!entry) return;
        if (type === 'code' && data?.code) {
          if (data.timestamp && data.timestamp < entry.lastCodeTimestamp) return;
          if (data.timestamp) entry.lastCodeTimestamp = data.timestamp;
          entry.listeners.forEach((cb) => { cb.onCodeStream?.(data); cb.onCodeUpdate?.(data); });
        } else if (type === 'chat' && data) {
          const mList = roomMessages.get(cleanCode) || [];
          if (!mList.some((m) => m.id === data.id)) {
            mList.push(data);
            roomMessages.set(cleanCode, mList);
          }
          entry.listeners.forEach((cb) => cb.onChatMessage?.(data));
        } else if (type === 'notes' && data?.content !== undefined) {
          entry.listeners.forEach((cb) => cb.onNotesStream?.(data.content));
        } else if (type === 'reached' && data?.user) {
          entry.listeners.forEach((cb) => cb.onStudentReached?.(data.user));
        } else if (type === 'challenge_launched' && data) {
          entry.listeners.forEach((cb) => cb.onChallengeLaunched?.(data));
        } else if (type === 'challenge_submitted' && data) {
          entry.listeners.forEach((cb) => cb.onChallengeSubmitted?.(data));
        } else if (type === 'challenge_graded' && data) {
          entry.listeners.forEach((cb) => cb.onGradeReceived?.(data));
        } else if (type === 'challenge_ended') {
          entry.listeners.forEach((cb) => cb.onChallengeEnded?.());
        }
      };

      let broadcastHandler: ((e: MessageEvent) => void) | undefined;
      if (broadcastChan) {
        broadcastHandler = (e: MessageEvent) => {
          if (!e.data) return;
          if (e.data.type === 'CODE_STREAM') handlePayload('code', e.data.payload);
          else if (e.data.type === 'CHAT_MESSAGE') handlePayload('chat', e.data.payload);
          else if (e.data.type === 'NOTES_STREAM') handlePayload('notes', e.data.payload);
          else if (e.data.type === 'STUDENT_REACHED') handlePayload('reached', e.data.payload);
          else if (e.data.type === 'CHALLENGE_LAUNCHED') handlePayload('challenge_launched', e.data.payload);
          else if (e.data.type === 'CHALLENGE_SUBMITTED') handlePayload('challenge_submitted', e.data.payload);
          else if (e.data.type === 'CHALLENGE_GRADED') handlePayload('challenge_graded', e.data.payload);
          else if (e.data.type === 'CHALLENGE_ENDED') handlePayload('challenge_ended', {});
        };
        broadcastChan.addEventListener('message', broadcastHandler);
      }

      let storageHandler: ((e: StorageEvent) => void) | undefined;
      if (typeof window !== 'undefined') {
        storageHandler = (e: StorageEvent) => {
          if (!e.newValue) return;
          try {
            const parsed = JSON.parse(e.newValue);
            if (e.key === `cb_sync_${cleanCode}`) handlePayload('code', parsed?.payload);
            else if (e.key === `cb_chat_${cleanCode}`) handlePayload('chat', parsed?.message);
            else if (e.key === `cb_reached_${cleanCode}`) handlePayload('reached', parsed);
            else if (e.key === `cb_challenge_${cleanCode}`) handlePayload('challenge_launched', parsed);
            else if (e.key === `cb_sub_ping_${cleanCode}`) handlePayload('challenge_submitted', parsed?.submission);
            else if (e.key === `cb_grade_ping_${cleanCode}`) handlePayload('challenge_graded', parsed?.submission);
            else if (e.key === `cb_challenge_ended_${cleanCode}`) handlePayload('challenge_ended', {});
          } catch {}
        };
        window.addEventListener('storage', storageHandler);
      }

      entry.broadcastChan = broadcastChan;
      entry.broadcastHandler = broadcastHandler;
      entry.storageHandler = storageHandler;

      if (isSupabaseConfigured) {
        try {
          const sb = supabase.channel(`room:${cleanCode}`, { config: { broadcast: { self: false } } });
          sb.on('broadcast', { event: 'code_stream' }, ({ payload }) => handlePayload('code', payload))
            .on('broadcast', { event: 'chat_message' }, ({ payload }) => handlePayload('chat', payload))
            .on('broadcast', { event: 'notes_stream' }, ({ payload }) => handlePayload('notes', payload))
            .on('broadcast', { event: 'student_reached' }, ({ payload }) => handlePayload('reached', payload))
            .on('broadcast', { event: 'challenge_launched' }, ({ payload }) => handlePayload('challenge_launched', payload))
            .on('broadcast', { event: 'challenge_submitted' }, ({ payload }) => handlePayload('challenge_submitted', payload))
            .on('broadcast', { event: 'challenge_graded' }, ({ payload }) => handlePayload('challenge_graded', payload))
            .on('broadcast', { event: 'challenge_ended' }, () => handlePayload('challenge_ended', {}))
            .on('presence', { event: 'sync' }, () => {
              const state = sb.presenceState();
              const students: UserProfile[] = [];
              Object.values(state).forEach((presences: any) => {
                presences.forEach((p: any) => { if (p.user) students.push(p.user); });
              });
              entry!.listeners.forEach((cb) => {
                cb.onPresenceSync?.(students);
                if (students.length > 0) cb.onStudentReached?.(students[0]);
              });
            })
            .subscribe();
          entry.sbChannel = sb;
        } catch {}
      }
      managedRooms.set(cleanCode, entry);
    }
    return entry;
  },

  broadcastCode(roomCode: string, payload: RealtimeCodePayload) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CODE_STREAM', payload }); } catch {}
    try { localStorage.setItem(`cb_sync_${clean}`, JSON.stringify({ payload, t: payload.timestamp || Date.now() })); } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'code_stream', payload }); } catch {}
    }
  },

  broadcastMessage(roomCode: string, message: ChatMessageItem) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CHAT_MESSAGE', payload: message }); } catch {}
    try { localStorage.setItem(`cb_chat_${clean}`, JSON.stringify({ message, t: Date.now() })); } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'chat_message', payload: message }); } catch {}
    }
  },

  broadcastNotes(roomCode: string, content: string) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'NOTES_STREAM', payload: { content } }); } catch {}
    try { localStorage.setItem(`cb_notes_${clean}`, content); } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'notes_stream', payload: { content, timestamp: Date.now() } }); } catch {}
    }
  },

  broadcastStudentReached(roomCode: string, student: UserProfile) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const payload = { user: student, timestamp: Date.now() };
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'STUDENT_REACHED', payload }); } catch {}

    try {
      localStorage.setItem(`cb_reached_${clean}`, JSON.stringify(payload));
      const key = `cb_students_${clean}`;
      const existing: UserProfile[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.some((s) => s.id === student.id || s.email === student.email)) {
        existing.push(student);
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch {}

    if (entry.sbChannel) {
      try {
        entry.sbChannel.send({ type: 'broadcast', event: 'student_reached', payload });
        entry.sbChannel.track({ role: student.role || 'student', user: student, online_at: Date.now() });
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

  broadcastChallenge(roomCode: string, challenge: LiveChallenge) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CHALLENGE_LAUNCHED', payload: challenge }); } catch {}
    try { localStorage.setItem(`cb_challenge_${clean}`, JSON.stringify(challenge)); } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'challenge_launched', payload: challenge }); } catch {}
    }
  },

  broadcastSubmission(roomCode: string, submission: ChallengeSubmission) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CHALLENGE_SUBMITTED', payload: submission }); } catch {}
    try {
      const key = `cb_submissions_${clean}`;
      const existing: ChallengeSubmission[] = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((s) => s.id !== submission.id && s.studentId !== submission.studentId);
      filtered.push(submission);
      localStorage.setItem(key, JSON.stringify(filtered));
      localStorage.setItem(`cb_sub_ping_${clean}`, JSON.stringify({ submission, t: Date.now() }));
    } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'challenge_submitted', payload: submission }); } catch {}
    }
  },

  broadcastGrade(roomCode: string, submission: ChallengeSubmission) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CHALLENGE_GRADED', payload: submission }); } catch {}
    try {
      const key = `cb_submissions_${clean}`;
      const existing: ChallengeSubmission[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = existing.map((s) => (s.id === submission.id ? submission : s));
      localStorage.setItem(key, JSON.stringify(updated));
      localStorage.setItem(`cb_grade_ping_${clean}`, JSON.stringify({ submission, t: Date.now() }));
    } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'challenge_graded', payload: submission }); } catch {}
    }
  },

  broadcastEndChallenge(roomCode: string) {
    const clean = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(clean);
    const channel = getBroadcastChannel(clean);
    if (channel) try { channel.postMessage({ type: 'CHALLENGE_ENDED', payload: {} }); } catch {}
    try {
      localStorage.removeItem(`cb_challenge_${clean}`);
      localStorage.removeItem(`cb_submissions_${clean}`);
      localStorage.setItem(`cb_challenge_ended_${clean}`, String(Date.now()));
    } catch {}
    if (entry.sbChannel) {
      try { entry.sbChannel.send({ type: 'broadcast', event: 'challenge_ended', payload: {} }); } catch {}
    }
  },

  getActiveChallenge(roomCode: string): LiveChallenge | null {
    const clean = roomCode.trim().toUpperCase();
    try {
      const raw = localStorage.getItem(`cb_challenge_${clean}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  },

  getChallengeSubmissions(roomCode: string): ChallengeSubmission[] {
    const clean = roomCode.trim().toUpperCase();
    try {
      const raw = localStorage.getItem(`cb_submissions_${clean}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  /**
   * Subscribe to real-time events for a room with connection pooling
   */
  subscribeToRoom(roomCode: string, callbacks: RoomCallbacks) {
    const cleanCode = roomCode.trim().toUpperCase();
    const entry = this.getOrCreateManagedRoom(cleanCode);
    entry.listeners.add(callbacks);

    return () => {
      entry.listeners.delete(callbacks);
      if (entry.listeners.size === 0) {
        if (entry.storageHandler && typeof window !== 'undefined') {
          window.removeEventListener('storage', entry.storageHandler);
        }
        if (entry.broadcastChan && entry.broadcastHandler) {
          entry.broadcastChan.removeEventListener('message', entry.broadcastHandler);
        }
        if (entry.sbChannel) {
          try { supabase.removeChannel(entry.sbChannel); } catch {}
        }
        managedRooms.delete(cleanCode);
      }
    };
  },

  /**
   * Fetch real-time chat messages for a session
   */
  async getMessages(sessionId: string, roomCode?: string): Promise<ChatMessageItem[]> {
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const resultMessages: ChatMessageItem[] = [];
    const seenIds = new Set<string>();

    const appendUnique = (list: ChatMessageItem[]) => {
      list.forEach((m) => {
        if (!seenIds.has(m.id)) {
          seenIds.add(m.id);
          resultMessages.push(m);
        }
      });
    };

    if (cleanCode && roomMessages.has(cleanCode)) {
      appendUnique(roomMessages.get(cleanCode)!);
    }

    try {
      const keys = [cleanCode ? `cb_msgs_${cleanCode}` : null, `cb_msgs_${sessionId}`].filter(Boolean) as string[];
      keys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) appendUnique(JSON.parse(raw));
      });
    } catch {}

    if (isSupabaseConfigured) {
      try {
        let targetUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId) ? sessionId : null;
        if (!targetUuid && cleanCode) {
          const { data: sRow } = await supabase.from('sessions').select('id').eq('code', cleanCode).maybeSingle();
          if (sRow?.id) targetUuid = sRow.id;
        }

        if (targetUuid) {
          const { data, error } = await supabase.from('session_messages').select('*').eq('session_id', targetUuid).order('created_at', { ascending: true });
          if (!error && data) {
            appendUnique(data.map((d) => ({
              id: d.id,
              sessionId: d.session_id,
              senderId: d.sender_id,
              senderName: d.sender_name,
              senderRole: d.sender_role,
              senderAvatar: d.sender_avatar,
              content: d.content,
              createdAt: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isHighlighted: d.is_highlighted,
            })));
          }
        }
      } catch {}
    }

    return resultMessages;
  },

  async sendMessage(msg: Omit<ChatMessageItem, 'id' | 'createdAt'>, roomCode?: string): Promise<ChatMessageItem> {
    const newMsg: ChatMessageItem = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const cleanCode = (roomCode || '').trim().toUpperCase();

    if (cleanCode) {
      const mList = roomMessages.get(cleanCode) || [];
      if (!mList.some((m) => m.id === newMsg.id)) {
        mList.push(newMsg);
        roomMessages.set(cleanCode, mList);
      }
    }

    if (isSupabaseConfigured) {
      try {
        let targetUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msg.sessionId)
          ? msg.sessionId
          : null;

        if (!targetUuid && cleanCode) {
          const { data: sRow } = await supabase.from('sessions').select('id').eq('code', cleanCode).maybeSingle();
          if (sRow?.id) targetUuid = sRow.id;
        }

        if (targetUuid) {
          await supabase.from('session_messages').insert({
            session_id: targetUuid,
            sender_id: msg.senderId || null,
            sender_name: msg.senderName,
            sender_role: msg.senderRole,
            sender_avatar: msg.senderAvatar,
            content: msg.content,
          });
        }
      } catch (e) {
        console.warn('Supabase sendMessage error:', e);
      }
    }

    try {
      const keys = [cleanCode ? `cb_msgs_${cleanCode}` : null, `cb_msgs_${msg.sessionId}`].filter(Boolean) as string[];
      keys.forEach((key) => {
        const list: any[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.some((m: any) => m.id === newMsg.id)) {
          list.push(newMsg);
          localStorage.setItem(key, JSON.stringify(list));
        }
      });
    } catch {}

    return newMsg;
  },
};
