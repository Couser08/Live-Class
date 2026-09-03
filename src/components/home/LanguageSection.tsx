import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useUIStore } from '../../stores/uiStore';
import { useCodeStore } from '../../stores/codeStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { Globe, ArrowRight, Check } from 'lucide-react';
import { SupportedLanguage } from '../../types/session.types';

export const LanguageSection: React.FC = () => {
  const { openNewSessionModal, setActiveNavTab } = useUIStore();
  const { setLanguage } = useCodeStore();
  const { user } = useAuthStore();
  const isMentor = isMentorEmail(user?.email) || user?.role === 'mentor';

  const workspaces: {
    id: SupportedLanguage;
    title: string;
    tag: string;
    description: string;
    icon: React.ReactNode;
    tagBg: string;
    iconBg: string;
    features: string[];
  }[] = [
    {
      id: 'c',
      title: 'C Programming',
      tag: 'Systems & DSA',
      description: 'Pointers, memory management, structs, and hardware-level algorithms with native C execution.',
      icon: <span className="font-mono font-bold text-xs tracking-tighter">&gt;_</span>,
      iconBg: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400',
      tagBg: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400',
      features: ['Native GCC execution', 'Companion header files', 'Pointer memory tracing'],
    },
    {
      id: 'html',
      title: 'Web Development',
      tag: 'HTML / CSS / JS',
      description: 'Modern semantic structure, responsive stylesheets, and DOM event handling with instant live preview.',
      icon: <Globe className="w-4 h-4 text-[#059669] dark:text-emerald-400" />,
      iconBg: 'bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-400',
      tagBg: 'bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-400',
      features: ['Real-time browser preview', 'Responsive viewport testing', 'CSS layout inspector'],
    },
    {
      id: 'javascript',
      title: 'JavaScript Labs',
      tag: 'ES6+ Logic',
      description: 'Asynchronous scripting, data structures, array methods, and algorithmic problem solving.',
      icon: <span className="font-mono font-bold text-xs tracking-tighter">&#123;&#125;</span>,
      iconBg: 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/60 dark:text-amber-400',
      tagBg: 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/60 dark:text-amber-400',
      features: ['Interactive console output', 'Modern ES6+ syntax', 'Instant runtime diagnostics'],
    },
  ];

  const handleLaunch = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (isMentor) {
      openNewSessionModal(lang);
    } else {
      setActiveNavTab('languages');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Workspaces
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Launch specialized live environments configured for peer teaching and self-paced execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {workspaces.map((item) => (
          <Card
            key={item.id}
            className="p-6 bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div className="space-y-4">
              {/* Header Icon + Tag */}
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${item.tagBg}`}>
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-400 font-normal">
                {item.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLaunch(item.id)}
                className="w-full rounded-xl py-2.5 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{isMentor ? `Host ${item.title}` : `Explore ${item.title}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
