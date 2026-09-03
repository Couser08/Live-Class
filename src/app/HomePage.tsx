import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { LanguageSection } from '../components/home/LanguageSection';
import { ActiveSessionCard } from '../components/home/ActiveSessionCard';
import { RecentQuestionsCard } from '../components/home/RecentQuestionsCard';
import { ProTipCard } from '../components/home/ProTipCard';
import { StatsRow } from '../components/home/StatsRow';
import { NewSessionModal } from '../components/home/NewSessionModal';
import { JoinSessionModal } from '../components/home/JoinSessionModal';
import { useSessionStore } from '../stores/sessionStore';
import { useUIStore } from '../stores/uiStore';
import { Share2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const { addToast } = useUIStore();

  const handleShareInvite = () => {
    const inviteUrl = currentSession
      ? `${window.location.origin}/join/${currentSession.code}?pin=${currentSession.pin}`
      : `${window.location.origin}/join`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      addToast({
        type: 'success',
        title: 'Invite Link Copied!',
        description: currentSession
          ? `Room ${currentSession.code} link copied to clipboard.`
          : 'Classroom portal link copied to clipboard.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 max-w-[1400px] mx-auto">
      {/* Top Header Controls: Share Invite on the right */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleShareInvite}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Share Invite</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero, Workspaces, and Platform Statistics */}
        <div className="lg:col-span-8 space-y-6">
          <HeroBanner />
          <LanguageSection />
          <StatsRow />
        </div>

        {/* Right Column: Active Classroom, Recent Questions, and Pro Tip */}
        <div className="lg:col-span-4 space-y-6">
          <ActiveSessionCard />
          <RecentQuestionsCard />
          <ProTipCard />
        </div>
      </div>

      {/* Modals */}
      <NewSessionModal />
      <JoinSessionModal />
    </div>
  );
};
