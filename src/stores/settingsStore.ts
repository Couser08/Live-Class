import { create } from 'zustand';
import { SupportedLanguage } from '../types/session.types';

export type AccentColor = 'indigo' | 'blue' | 'emerald' | 'orange' | 'pink';
export type ThemeMode = 'light' | 'system' | 'dark';
export type EditorTheme = 'dark-plus' | 'github-light' | 'dracula' | 'tokyo-night';
export type EditorFontFamily = 'JetBrains Mono' | 'Fira Code' | 'Source Code Pro' | 'Consolas' | 'Ubuntu Mono' | 'Space Mono';

export interface AccountSettings {
  name: string;
  email: string;
  bio: string;
  role: string;
  avatarUrl: string;
}

export interface NotificationSettings {
  soundEffects: boolean;
  emailDigest: boolean;
  questionAlerts: boolean;
  joinLeaveBells: boolean;
}

export interface ChatSettings {
  typingIndicators: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  allowUpvotes: boolean;
}

export interface PrivacySettings {
  requireRoomPin: boolean;
  allowPublicSearch: boolean;
  recordSessions: boolean;
  incognitoPreview: boolean;
}

export interface AdvancedSettings {
  customSupabaseUrl: string;
  customSupabaseKey: string;
  cEngineMode: 'interactive' | 'wasm';
  debugLogs: boolean;
}

interface SettingsState {
  // General
  defaultLanguage: SupportedLanguage;
  defaultSessionMode: 'live-coding' | 'qa' | 'assignment';
  autoSave: boolean;
  autoRunOnTyping: boolean;

  // Appearance
  theme: ThemeMode;
  accentColor: AccentColor;
  editorTheme: EditorTheme;
  editorFontFamily: EditorFontFamily;
  editorFontSize: number;

  // Editor
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  autoCloseBrackets: boolean;
  highlightActiveLine: boolean;

  // Subsections
  account: AccountSettings;
  notifications: NotificationSettings;
  chat: ChatSettings;
  privacy: PrivacySettings;
  advanced: AdvancedSettings;

  updateSettings: (partial: Partial<SettingsState>) => void;
  updateAccount: (partial: Partial<AccountSettings>) => void;
  updateNotifications: (partial: Partial<NotificationSettings>) => void;
  updateChat: (partial: Partial<ChatSettings>) => void;
  updatePrivacy: (partial: Partial<PrivacySettings>) => void;
  updateAdvanced: (partial: Partial<AdvancedSettings>) => void;
  resetDefaults: () => void;
}

export const applyDOMTheme = (theme: ThemeMode, accent: AccentColor) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set accent
  root.setAttribute('data-accent', accent);

  // Set theme
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.classList.toggle('dark', isDark);
};

const loadSavedSettings = (): Partial<SettingsState> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('codebuddy_settings');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
  }
  return {};
};

const saveSettingsToStorage = (settings: Partial<SettingsState>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('codebuddy_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
};

const DEFAULT_SETTINGS = {
  defaultLanguage: 'html' as SupportedLanguage,
  defaultSessionMode: 'live-coding' as const,
  autoSave: true,
  autoRunOnTyping: false,

  theme: 'light' as ThemeMode,
  accentColor: 'indigo' as AccentColor,
  editorTheme: 'tokyo-night' as EditorTheme,
  editorFontFamily: 'JetBrains Mono' as EditorFontFamily,
  editorFontSize: 14,

  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  autoCloseBrackets: true,
  highlightActiveLine: true,

  account: {
    name: 'Rahul Sharma',
    email: 'tungariyarahul08@gmail.com',
    bio: 'Senior Peer Mentor teaching HTML, C, and JavaScript 🚀',
    role: 'Mentor & Tutor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },

  notifications: {
    soundEffects: true,
    emailDigest: true,
    questionAlerts: true,
    joinLeaveBells: false,
  },

  chat: {
    typingIndicators: true,
    autoScroll: true,
    showTimestamps: true,
    allowUpvotes: true,
  },

  privacy: {
    requireRoomPin: true,
    allowPublicSearch: false,
    recordSessions: true,
    incognitoPreview: false,
  },

  advanced: {
    customSupabaseUrl: '',
    customSupabaseKey: '',
    cEngineMode: 'interactive' as const,
    debugLogs: false,
  },
};

const initialSaved = loadSavedSettings();
const initialSettings = { ...DEFAULT_SETTINGS, ...initialSaved };

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialSettings,

  updateSettings: (partial) => {
    set((state) => {
      const next = { ...state, ...partial };
      applyDOMTheme(next.theme, next.accentColor);
      saveSettingsToStorage(next);
      return next;
    });
  },

  updateAccount: (partial) => {
    set((state) => {
      const next = { ...state, account: { ...state.account, ...partial } };
      saveSettingsToStorage(next);
      return next;
    });
  },

  updateNotifications: (partial) => {
    set((state) => {
      const next = { ...state, notifications: { ...state.notifications, ...partial } };
      saveSettingsToStorage(next);
      return next;
    });
  },

  updateChat: (partial) => {
    set((state) => {
      const next = { ...state, chat: { ...state.chat, ...partial } };
      saveSettingsToStorage(next);
      return next;
    });
  },

  updatePrivacy: (partial) => {
    set((state) => {
      const next = { ...state, privacy: { ...state.privacy, ...partial } };
      saveSettingsToStorage(next);
      return next;
    });
  },

  updateAdvanced: (partial) => {
    set((state) => {
      const next = { ...state, advanced: { ...state.advanced, ...partial } };
      saveSettingsToStorage(next);
      return next;
    });
  },

  resetDefaults: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('codebuddy_settings');
      } catch {}
    }
    set(DEFAULT_SETTINGS);
    applyDOMTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.accentColor);
  },
}));

// Apply initial DOM theme on script load
if (typeof document !== 'undefined') {
  applyDOMTheme(initialSettings.theme, initialSettings.accentColor);

  // Listen for system theme changes if user chooses 'system'
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const currentTheme = useSettingsStore.getState().theme;
      if (currentTheme === 'system') {
        applyDOMTheme('system', useSettingsStore.getState().accentColor);
      }
    });
  }
}
