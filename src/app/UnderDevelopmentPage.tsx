import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Sparkles, FolderKanban, Trophy, History, ArrowLeft, Rocket, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

interface UnderDevelopmentPageProps {
  pageType: 'resources' | 'achievements' | 'history';
}

export const UnderDevelopmentPage: React.FC<UnderDevelopmentPageProps> = ({ pageType }) => {
  const { setActiveNavTab } = useUIStore();

  const configs = {
    resources: {
      title: 'Teaching Resources & Cheatsheets',
      subtitle: 'Curated library of HTML, C & JavaScript documentation, templates & video snippets.',
      icon: FolderKanban,
      badgeColor: 'bg-sky-50 text-sky-600 border-sky-200',
      iconBg: 'bg-[#EBF8FF] text-[#0284C7]',
      features: [
        'Interactive HTML5 tag explorer with live examples',
        'C Programming pointer & memory diagram visualizers',
        'Modern JavaScript ES2024 cheatsheets & idioms',
        'Downloadable homework assignments & practice test cases',
      ],
    },
    achievements: {
      title: 'Mentor Badges & Milestones',
      subtitle: 'Celebrate your live teaching streaks, learner reviews, and coding challenges unlocked.',
      icon: Trophy,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-[#FEFCE8] text-[#CA8A04]',
      features: [
        'Master Mentor Level 3 badge for 20+ live sessions',
        'Bug Buster trophy for 50+ real-time code fixes',
        'Community contributor leaderboard & rank cards',
        'Shareable certificate generator for your learners',
      ],
    },
    history: {
      title: 'Live Classroom History & Recordings',
      subtitle: 'Review previous live sessions, replay code typing timelines, and read saved Q&A logs.',
      icon: History,
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      iconBg: 'bg-[#EEF0FF] text-[#5551FF]',
      features: [
        'Full keystroke timeline replay for past HTML & C sessions',
        'Exportable session transcript & chat logs',
        'Learner attendance & duration analytics',
        'Cloud storage integration for recording archives',
      ],
    },
  };

  const config = configs[pageType];
  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavTab('home')}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Main Illustration Card */}
      <Card className="p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feature Icon */}
        <div className={`w-18 h-18 rounded-3xl mx-auto flex items-center justify-center shadow-md ${config.iconBg}`}>
          <Icon className="w-9 h-9" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-500" />
            <span>Active Feature Development</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Coming Soon to CodeBuddy 🚀
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            We are crafting this module with high-performance real-time synchronization, export tools, and seamless mentor controls.
          </p>
        </div>

        {/* Upcoming Roadmap Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left pt-2">
          {config.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs font-semibold text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => setActiveNavTab('home')}
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="rounded-2xl px-6"
          >
            Back to Home
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveNavTab('sessions')}
            icon={<Rocket className="w-4 h-4 text-indigo-600" />}
            className="rounded-2xl px-6 bg-white"
          >
            Launch Live Classroom
          </Button>
        </div>
      </Card>
    </div>
  );
};
