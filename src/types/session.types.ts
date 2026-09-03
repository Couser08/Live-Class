export type UserRole = 'mentor' | 'student' | 'friend' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  isOnline: boolean;
  statusText?: string;
  // Pro Subscription Details
  isPro?: boolean;
  proPlan?: string;
  trialExpiresAt?: string;
  phone?: string;
  stream?: string; // BCA, MCA, B.Tech, etc.
  collegeYear?: string;
  targetGoal?: string;
}

export type SupportedLanguage = 'html' | 'c' | 'javascript';

export interface RoomSession {
  id: string;
  code: string; // 6-char room code (e.g. "CB-7829")
  pin: string;  // 4-digit PIN (e.g. "4921")
  title: string;
  language: SupportedLanguage;
  mentor: UserProfile;
  activeLearners: UserProfile[];
  createdAt: string;
  isLive: boolean;
  shareableUrl: string;
  description?: string;
}

export interface SessionMetrics {
  sessionsCompleted: number;
  teachingTimeHours: number;
  teachingTimeMinutes: number;
  questionsAnswered: number;
  happyLearners: number;
}
