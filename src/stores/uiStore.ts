import { create } from 'zustand';
import { SupportedLanguage } from '../types/session.types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

interface UIState {
  activeNavTab: string;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isNewSessionModalOpen: boolean;
  isJoinModalOpen: boolean;
  joinModalPrefillCode: string;
  isQuickDrawerOpen: boolean;
  modalDefaultLanguage: SupportedLanguage;
  activeSessionTab: 'editor' | 'files';
  bottomPanelTab: 'chat' | 'notes';
  toasts: ToastMessage[];
  setActiveNavTab: (tab: string) => void;
  toggleSidebarCollapse: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  openNewSessionModal: (language?: SupportedLanguage) => void;
  closeNewSessionModal: () => void;
  openJoinModal: (code?: string) => void;
  closeJoinModal: () => void;
  setActiveSessionTab: (tab: 'editor' | 'files') => void;
  setBottomPanelTab: (tab: 'chat' | 'notes') => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNavTab: 'home',
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  isNewSessionModalOpen: false,
  isJoinModalOpen: false,
  joinModalPrefillCode: '',
  isQuickDrawerOpen: false,
  modalDefaultLanguage: 'html',
  activeSessionTab: 'editor',
  bottomPanelTab: 'chat',
  toasts: [],

  setActiveNavTab: (tab: string) => set({ activeNavTab: tab, isMobileMenuOpen: false }),

  toggleSidebarCollapse: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),

  openNewSessionModal: (language = 'html') =>
    set({ isNewSessionModalOpen: true, modalDefaultLanguage: language }),

  closeNewSessionModal: () => set({ isNewSessionModalOpen: false }),

  openJoinModal: (code = '') => set({ isJoinModalOpen: true, joinModalPrefillCode: code }),

  closeJoinModal: () => set({ isJoinModalOpen: false, joinModalPrefillCode: '' }),

  setActiveSessionTab: (tab) => set({ activeSessionTab: tab }),

  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),

  addToast: (toast) => {
    const id = `toast_${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
