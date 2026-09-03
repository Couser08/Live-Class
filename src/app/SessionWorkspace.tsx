import React, { useState } from 'react';
import { SessionHeader } from '../components/session/SessionHeader';
import { EditorToolbar } from '../components/session/EditorToolbar';
import { InteractiveCodeEditor } from '../components/session/InteractiveCodeEditor';
import { SessionLivePreview } from '../components/session/SessionLivePreview';
import { SessionChatPanel } from '../components/session/SessionChatPanel';
import { SessionHub } from '../components/session/SessionHub';
import { MessageSquare, X } from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';

export const SessionWorkspace: React.FC = () => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleRefreshPreview = () => {
    setRefreshKey((prev) => prev + 1);
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

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-[360px] sm:w-[400px] h-[550px] max-h-[calc(100vh-120px)] shadow-2xl rounded-2xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726]">
            <SessionChatPanel />
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 transition-transform active:scale-95 cursor-pointer relative"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isChatOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white"></span>
          )}
        </button>
      </div>
    </div>
  );
};
