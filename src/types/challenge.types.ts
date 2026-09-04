/**
 * Type definitions for Live Classroom Challenges & Mentor Grading Desk
 */

export interface LiveChallenge {
  id: string;
  sessionId: string;
  roomCode: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput?: string;
  totalMarks: number;
  timeLimitMinutes?: number;
  createdAt: number;
  isActive: boolean;
  mentorName?: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  roomCode: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  code: string;
  stdout: string;
  status: 'submitted' | 'graded';
  marks?: number;
  feedback?: string;
  submittedAt: number;
  gradedAt?: number;
  gradedByName?: string;
}

export interface PresetChallengeTemplate {
  id: string;
  title: string;
  language: 'c' | 'html' | 'javascript';
  description: string;
  starterCode: string;
  expectedOutput?: string;
  totalMarks: number;
  timeLimitMinutes?: number;
}
