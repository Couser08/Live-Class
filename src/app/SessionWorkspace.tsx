import React, { useState, useEffect, useRef } from 'react';
import { SessionHeader } from '../components/session/SessionHeader';
import { EditorToolbar } from '../components/session/EditorToolbar';
import { InteractiveCodeEditor } from '../components/session/InteractiveCodeEditor';
import { SessionLivePreview } from '../components/session/SessionLivePreview';
import { SessionChatPanel } from '../components/session/SessionChatPanel';
import { SessionHub } from '../components/session/SessionHub';
import { MessageSquare, X } from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore, isMentorEmail } from '../stores/authStore';
import { sessionService } from '../services/sessionService';

export const SessionWorkspace: React.FC = () => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const currentUser = useSessionStore((state) => state.currentUser);
  const userRoleInSession = useSessionStore((state) => state.userRoleInSession);
  const { user: authUser } = useAuthStore();

  const activeUser = authUser || currentUser;
  const isMentor = isMentorEmail(activeUser?.email) || userRoleInSession === 'mentor';

  const [refreshKey, setRefreshKey] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  // Timer ref to check after 1.5 seconds for unread message
  const unreadTimerRef = useRef<any>(null);
  const isChatOpenRef = useRef(isChatOpen);
  isChatOpenRef.current = isChatOpen;

  const handleRefreshPreview = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // If student reaches workspace, broadcast reach immediately so mentor sees live presence
  useEffect(() => {
    if (currentSession?.code && !isMentor && activeUser) {
      sessionService.broadcastStudentReached(currentSession.code, activeUser);
    }
  }, [currentSession?.code, isMentor, activeUser]);

  // Listen to incoming chat messages and trigger red dot only for unread messages after 1.5 seconds
  useEffect(() => {
    if (!currentSession?.code) return;

    const unsubscribe = sessionService.subscribeToRoom(currentSession.code, {
      onChatMessage: (newMsg) => {
        // Ignore internal notes synchronization messages
        if (newMsg.content?.startsWith('__NOTES_SYNC__:')) return;

        // Ignore messages sent by active user themselves
        const isSelf =
          (newMsg.senderId && newMsg.senderId === activeUser.id) ||
          newMsg.senderName?.includes(activeUser.name) ||
          (isMentor && newMsg.senderRole === 'mentor') ||
          (!isMentor && newMsg.senderRole === 'student' && newMsg.senderName?.includes(activeUser.name));

        if (isSelf) return;

        // If chat is currently closed, evaluate unread message after 1.5 seconds
        if (!isChatOpenRef.current) {
          if (unreadTimerRef.current) clearTimeout(unreadTimerRef.current);
          unreadTimerRef.current = setTimeout(() => {
            if (!isChatOpenRef.current) {
              setHasUnreadMessage(true);
            }
          }, 1500);
        }
      },
    });

    return () => {
      unsubscribe();
      if (unreadTimerRef.current) clearTimeout(unreadTimerRef.current);
    };
  }, [currentSession?.code, isMentor, activeUser.name]);

  const handleToggleChat = () => {
    const nextState = !isChatOpen;
    setIsChatOpen(nextState);
    if (nextState) {
      // Clear red dot as soon as user opens chat
      setHasUnreadMessage(false);
      if (unreadTimerRef.current) clearTimeout(unreadTimerRef.current);
    }
  };

  // If no session is active (or user clicked End Session / Hub), display the Live Classrooms Hub!
  if (!currentSession) {
    return <SessionHub />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] space-y-4 pb-2 relative w-full">
      {/* 1. Top Session Navigation Bar */}
      <div className="shrink-0">
        <SessionHeader />
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left: Main Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col min-w-0 gap-2">
          <div className="shrink-0">
            <EditorToolbar onRefreshPreview={handleRefreshPreview} />
          </div>
          <div className="flex-1 flex flex-col">
            <InteractiveCodeEditor />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-full lg:w-1/2 flex flex-col shrink-0 min-h-[300px]">
          <div className="flex-1 flex flex-col">
            <SessionLivePreview refreshKey={refreshKey} />
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-[360px] sm:w-[400px] h-[550px] max-h-[calc(100vh-120px)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#111622]">
            <SessionChatPanel />
          </div>
        )}
        <button
          onClick={handleToggleChat}
          className="w-14 h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer relative"
          title={isChatOpen ? 'Close Chat' : 'Open Live Chat'}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {/* Red dot: only shown when unread message exists and chat is closed */}
          {!isChatOpen && hasUnreadMessage && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};
