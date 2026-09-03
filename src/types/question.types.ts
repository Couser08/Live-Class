import { UserProfile } from './session.types';

export interface LiveQuestion {
  id: string;
  sessionId: string;
  author: UserProfile;
  question: string;
  createdAt: string; // e.g., '2m ago' or ISO
  answered: boolean;
  answer?: string;
  hasUnreadPing?: boolean;
  upvotes?: number;
}
