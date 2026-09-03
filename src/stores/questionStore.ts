import { create } from 'zustand';
import { LiveQuestion } from '../types/question.types';
import { UserProfile } from '../types/session.types';

interface QuestionState {
  questions: LiveQuestion[];
  addQuestion: (questionText: string, author?: UserProfile, sessionId?: string) => void;
  answerQuestion: (questionId: string, answerText: string) => void;
  toggleReadStatus: (questionId: string) => void;
  clearQuestions: () => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  questions: [],

  addQuestion: (questionText: string, author?: UserProfile, sessionId?: string) => {
    const sender = author || {
      id: `usr_${Date.now()}`,
      name: 'Learner',
      role: 'student',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };

    const newQ: LiveQuestion = {
      id: `q_${Date.now()}`,
      sessionId: sessionId || 'active_session',
      author: {
        id: sender.id,
        name: sender.name,
        role: sender.role as any,
        isOnline: true,
        avatarUrl: sender.avatarUrl,
      },
      question: questionText,
      createdAt: 'Just now',
      answered: false,
      hasUnreadPing: true,
    };
    set((state) => ({ questions: [newQ, ...state.questions] }));
  },

  answerQuestion: (questionId: string, answerText: string) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, answered: true, answer: answerText, hasUnreadPing: false } : q
      ),
    }));
  },

  toggleReadStatus: (questionId: string) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, hasUnreadPing: !q.hasUnreadPing } : q
      ),
    }));
  },

  clearQuestions: () => {
    set({ questions: [] });
  },
}));
