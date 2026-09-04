import { create } from 'zustand';
import { LiveChallenge, ChallengeSubmission } from '../types/challenge.types';

interface ChallengeState {
  activeChallenge: LiveChallenge | null;
  submissions: ChallengeSubmission[];
  mySubmission: ChallengeSubmission | null;
  isCreateModalOpen: boolean;
  isGradingModalOpen: boolean;
  isStudentSandboxOpen: boolean;
  selectedSubmissionId: string | null;

  setActiveChallenge: (challenge: LiveChallenge | null) => void;
  setSubmissions: (submissions: ChallengeSubmission[]) => void;
  addOrUpdateSubmission: (sub: ChallengeSubmission) => void;
  setMySubmission: (sub: ChallengeSubmission | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openGradingModal: (submissionId?: string) => void;
  closeGradingModal: () => void;
  openStudentSandbox: () => void;
  closeStudentSandbox: () => void;
  gradeSubmissionLocal: (submissionId: string, marks: number, feedback: string, mentorName?: string) => void;
  endChallengeLocal: () => void;
  resetAll: () => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  activeChallenge: null,
  submissions: [],
  mySubmission: null,
  isCreateModalOpen: false,
  isGradingModalOpen: false,
  isStudentSandboxOpen: false,
  selectedSubmissionId: null,

  setActiveChallenge: (challenge) => {
    set({ activeChallenge: challenge });
  },

  setSubmissions: (submissions) => {
    set({ submissions });
  },

  addOrUpdateSubmission: (sub) => {
    set((state) => {
      const idx = state.submissions.findIndex((s) => s.id === sub.id || s.studentId === sub.studentId);
      if (idx >= 0) {
        const next = [...state.submissions];
        next[idx] = sub;
        return { submissions: next };
      }
      return { submissions: [sub, ...state.submissions] };
    });
  },

  setMySubmission: (sub) => {
    set({ mySubmission: sub });
  },

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openGradingModal: (submissionId) =>
    set((state) => ({
      isGradingModalOpen: true,
      selectedSubmissionId: submissionId || state.selectedSubmissionId || (state.submissions[0]?.id ?? null),
    })),

  closeGradingModal: () => set({ isGradingModalOpen: false }),

  openStudentSandbox: () => set({ isStudentSandboxOpen: true }),
  closeStudentSandbox: () => set({ isStudentSandboxOpen: false }),

  gradeSubmissionLocal: (submissionId, marks, feedback, mentorName = 'Rahul Sharma (Mentor)') => {
    set((state) => {
      const updatedList = state.submissions.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            marks,
            feedback,
            status: 'graded' as const,
            gradedAt: Date.now(),
            gradedByName: mentorName,
          };
        }
        return sub;
      });

      const updatedMySub =
        state.mySubmission?.id === submissionId
          ? {
              ...state.mySubmission,
              marks,
              feedback,
              status: 'graded' as const,
              gradedAt: Date.now(),
              gradedByName: mentorName,
            }
          : state.mySubmission;

      return {
        submissions: updatedList,
        mySubmission: updatedMySub,
      };
    });
  },

  endChallengeLocal: () => {
    set({
      activeChallenge: null,
      submissions: [],
      mySubmission: null,
      isCreateModalOpen: false,
      isGradingModalOpen: false,
      isStudentSandboxOpen: false,
      selectedSubmissionId: null,
    });
  },

  resetAll: () => {
    set({
      activeChallenge: null,
      submissions: [],
      mySubmission: null,
      isCreateModalOpen: false,
      isGradingModalOpen: false,
      isStudentSandboxOpen: false,
      selectedSubmissionId: null,
    });
  },
}));
