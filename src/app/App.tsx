import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from './HomePage';
import { SessionWorkspace } from './SessionWorkspace';
import { LanguagesPage } from './LanguagesPage';
import { MyNotesPage } from './MyNotesPage';
import { SettingsPage } from './SettingsPage';
import { UnderDevelopmentPage } from './UnderDevelopmentPage';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const activeNavTab = useUIStore((state) => state.activeNavTab);

  const renderContent = () => {
    switch (activeNavTab) {
      case 'home':
        return <HomePage />;

      case 'sessions':
        return <SessionWorkspace />;

      case 'languages':
        return <LanguagesPage />;

      case 'my-notes':
        return <MyNotesPage />;

      case 'resources':
        return <UnderDevelopmentPage pageType="resources" />;

      case 'achievements':
        return <UnderDevelopmentPage pageType="achievements" />;

      case 'history':
        return <UnderDevelopmentPage pageType="history" />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <HomePage />;
    }
  };

  useEffect(() => {
    // Synchronize useAuthStore with useSessionStore on any user update
    const unsubAuthSync = useAuthStore.subscribe((state) => {
      if (state.user) {
        useSessionStore.getState().setCurrentUser(state.user);
      }
    });

    // Sync immediately on mount if user is already in local storage
    const currentAuthUser = useAuthStore.getState().user;
    if (currentAuthUser) {
      useSessionStore.getState().setCurrentUser(currentAuthUser);
    }

    // Initialize Supabase Auth state listener
    useAuthStore.getState().initializeAuth();

    const path = window.location.pathname;
    if (path.startsWith('/join/')) {
      const parts = path.split('/');
      const code = parts[parts.length - 1]?.trim().toUpperCase();
      const urlParams = new URLSearchParams(window.location.search);
      const pin = urlParams.get('pin');

      if (code && pin) {
        // Direct 1-Click Join with PIN
        const user = useAuthStore.getState().user;
        useSessionStore.getState().joinSession(code, pin, user || undefined).then((res) => {
          if (res.success) {
            useUIStore.getState().setActiveNavTab('sessions');
            useUIStore.getState().addToast({
              type: 'success',
              title: res.role === 'mentor' ? 'Connected as Mentor!' : 'Joined Classroom as Student!',
              description: res.role === 'mentor'
                ? `Broadcasting active in room ${code}`
                : `Live following mentor stream in ${code}`,
            });
          } else {
            useUIStore.getState().openJoinModal(code);
            useUIStore.getState().addToast({
              type: 'error',
              title: 'Could Not Auto-Join',
              description: res.error || 'Please enter credentials manually.',
            });
          }
        });
      } else if (code) {
        // Pre-fill Room Code in modal
        useUIStore.getState().openJoinModal(code);
      }
    }

    return () => {
      unsubAuthSync();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>{renderContent()}</AppLayout>
    </QueryClientProvider>
  );
};

export default App;
