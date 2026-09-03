import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { LanguageSection } from '../components/home/LanguageSection';
import { ActiveSessionCard } from '../components/home/ActiveSessionCard';
import { RecentQuestionsCard } from '../components/home/RecentQuestionsCard';
import { StatsRow } from '../components/home/StatsRow';
import { ProTipCard } from '../components/home/ProTipCard';
import { NewSessionModal } from '../components/home/NewSessionModal';
import { JoinSessionModal } from '../components/home/JoinSessionModal';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-7 pb-10">
      {/* Top Grid: Hero Banner + Right Sidebar Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Hero Teaching Banner (8 cols on XL) */}
        <div className="xl:col-span-8">
          <HeroBanner />
        </div>

        {/* Right Action & Info Stack (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-5">
          <ActiveSessionCard />
          <RecentQuestionsCard />
        </div>
      </div>

      {/* Middle: Choose Language Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <LanguageSection />
        </div>
      </div>

      {/* Bottom Grid: Stats Row + Pro Tip Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* 4 Metrics Stat Card (8 cols) */}
        <div className="xl:col-span-8 flex flex-col justify-center">
          <StatsRow />
        </div>

        {/* Pro Tip Card (4 cols) */}
        <div className="xl:col-span-4 flex flex-col justify-center">
          <ProTipCard />
        </div>
      </div>

      {/* Global Action Modals */}
      <NewSessionModal />
      <JoinSessionModal />
    </div>
  );
};
