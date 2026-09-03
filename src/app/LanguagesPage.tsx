import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Play, ArrowRight, Gift, Clock, MessageSquare } from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useCodeStore } from '../stores/codeStore';
import { useUIStore } from '../stores/uiStore';
import { SupportedLanguage } from '../types/session.types';

export const LanguagesPage: React.FC = () => {
  const { setLanguage } = useCodeStore();
  const { updateLanguage, activeSessionsList, metrics } = useSessionStore();
  const { setActiveNavTab, openNewSessionModal, addToast } = useUIStore();
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [selectedTopicsLang, setSelectedTopicsLang] = useState<string | null>(null);

  const activeLang = useCodeStore((state) => state.activeLanguage);

  const languages = [
    {
      id: 'html' as SupportedLanguage,
      title: 'HTML',
      description: 'Structure the web with semantic markup.',
      isActive: activeLang === 'html',
      stats: {
        sessions: activeSessionsList.filter((s) => s.language === 'html').length,
        notes: 1,
        questions: 0,
      },
      buttonVariant: 'primary' as const,
      topics: [
        'Document Structure & Doctype',
        'Head, Meta & Viewport tags',
        'Semantic Elements (<article>, <nav>, <section>)',
        'Forms, Validation & Attributes',
        'Media Elements (<video>, <audio>, <iframe>)',
      ],
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#FFF3EC] flex items-center justify-center p-2.5 shadow-xs">
          <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
            <path d="M4 2L6.5 28L16 31L25.5 28L28 2H4Z" fill="#E44D26" />
            <path d="M16 28.5L23.5 26.2L25.5 4H16V28.5Z" fill="#F16529" />
            <path d="M16 11.5H11.5L11.8 15H16V18.5H12.1L12.4 22L16 23V25.5L9.5 23.5L8.5 7.5H23.5L23.2 11.5H16Z" fill="#EBEBEB" />
            <path d="M16 11.5V15H20L19.6 19.5L16 20.6V23.1L20.5 21.9L21.2 15H16V11.5H23.2L23.5 7.5H16V11.5Z" fill="white" />
          </svg>
        </div>
      ),
    },
    {
      id: 'c' as SupportedLanguage,
      title: 'C Language',
      description: 'Teach the fundamentals of C programming.',
      isActive: activeLang === 'c',
      stats: {
        sessions: activeSessionsList.filter((s) => s.language === 'c').length,
        notes: 1,
        questions: 0,
      },
      buttonVariant: 'cyan' as const,
      topics: [
        'Data Types, Variables & Modifiers',
        'Pointers & Memory Addresses',
        'Control Flow (if, switch, while, for)',
        'Functions & Scope (Pass by reference)',
        'Dynamic Memory Allocation (malloc, free)',
      ],
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#EBF8FF] flex items-center justify-center p-2.5 shadow-xs">
          <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#00599C" />
            <path d="M16 4.5L25.5 10.5V21.5L16 27.5L6.5 21.5V10.5L16 4.5Z" fill="#004482" />
            <path d="M21 12.5C19.8 11.2 18 10.5 16 10.5C12.7 10.5 10 13 10 16C10 19 12.7 21.5 16 21.5C18 21.5 19.8 20.8 21 19.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: 'javascript' as SupportedLanguage,
      title: 'JavaScript',
      description: 'Make the web interactive with JavaScript.',
      isActive: activeLang === 'javascript',
      stats: {
        sessions: activeSessionsList.filter((s) => s.language === 'javascript').length,
        notes: 1,
        questions: 0,
      },
      buttonVariant: 'amber' as const,
      topics: [
        'ES6+ Syntax, Arrow Functions & Destructuring',
        'DOM Manipulation & Event Listeners',
        'Promises, Async/Await & Fetch API',
        'Closures & Scope Chain',
        'Object-Oriented & Functional Patterns',
      ],
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#FEFCE8] flex items-center justify-center p-2.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#F7DF1E] flex items-end justify-end p-1 shadow-xs">
            <span className="font-extrabold text-slate-950 text-xs tracking-tighter">JS</span>
          </div>
        </div>
      ),
    },
  ];

  const handleStartTeaching = (lang: SupportedLanguage) => {
    setLanguage(lang);
    updateLanguage(lang);
    openNewSessionModal(lang);
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Languages
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Choose a language to teach and learn together.
          </p>
        </div>

        <button
          onClick={() => setIsHowItWorksOpen(true)}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl px-4 py-2.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Play className="w-2 h-2 fill-slate-600 text-slate-600 ml-0.5" />
          </div>
          <span>How it works?</span>
        </button>
      </div>

      {/* 3 Main Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {languages.map((lang) => (
          <Card
            key={lang.id}
            className="p-6 flex flex-col justify-between space-y-6 hover:shadow-lg transition-all duration-200 border-slate-150"
          >
            <div className="space-y-5">
              {/* Icon & Title */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {lang.icon}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {lang.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {lang.description}
                    </p>
                  </div>
                </div>
                {lang.isActive && (
                  <Badge variant="live" pulse={false} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    Active
                  </Badge>
                )}
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/70 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-center">
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Sessions</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{lang.stats.sessions}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Notes</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{lang.stats.notes}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Questions</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{lang.stats.questions}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => handleStartTeaching(lang.id)}
                variant={lang.buttonVariant}
                size="md"
                fullWidth
                className="rounded-2xl py-3 text-xs font-bold shadow-xs"
              >
                Start Teaching
              </Button>

              <button
                onClick={() => setSelectedTopicsLang(lang.title)}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Row: Overall Progress & Switch Language */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Overall Progress Dashboard (8 cols) */}
        <Card className="xl:col-span-8 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            Overall Progress
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Metric 1 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/70 text-[#5551FF] dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Total Sessions</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeSessionsList.length + metrics.sessionsCompleted}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Across all languages</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] dark:bg-emerald-950/70 text-[#10B981] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Total Teaching Time</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {metrics.teachingTimeHours}h {metrics.teachingTimeMinutes}m
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Active metrics</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] dark:bg-blue-950/70 text-[#3B82F6] dark:text-blue-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Questions Answered</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {metrics.questionsAnswered}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Community Q&A</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Switch Language Card (4 cols) */}
        <Card className="xl:col-span-4 p-6 bg-[#F5F6FE] dark:bg-indigo-950/40 border-[#E8EAFF] dark:border-indigo-900/60 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-sm text-[#5551FF] dark:text-indigo-400 tracking-tight">
              Switch Language
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              You can switch the active language anytime during a session.
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                setActiveNavTab('sessions');
                addToast({
                  type: 'info',
                  title: 'Switching Language in Session',
                  description: 'Choose any language tab at top of the live editor.',
                });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5551FF] dark:text-indigo-400 hover:text-[#433CE2] dark:hover:text-indigo-300 transition-colors cursor-pointer group"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </Card>
      </div>

      {/* Topics Modal */}
      <Modal
        isOpen={Boolean(selectedTopicsLang)}
        onClose={() => setSelectedTopicsLang(null)}
        title={`${selectedTopicsLang} Curriculum & Topics`}
        description="Structured syllabus for 1-on-1 teaching sessions"
      >
        <div className="space-y-3 py-2">
          {languages
            .find((l) => l.title === selectedTopicsLang)
            ?.topics.map((topic, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-indigo-200 dark:border-indigo-800">
                  {idx + 1}
                </span>
                <span>{topic}</span>
              </div>
            ))}
          <Button fullWidth onClick={() => setSelectedTopicsLang(null)} size="sm" className="mt-2">
            Got it
          </Button>
        </div>
      </Modal>

      {/* How it works modal */}
      <Modal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        title="Multi-Language Live Teaching"
        description="Seamlessly teach HTML, C, and JavaScript in real-time"
      >
        <div className="space-y-3 text-xs text-slate-600 py-2">
          <p>• Switch languages instantly inside active classroom rooms.</p>
          <p>• HTML and JavaScript execute in real-time sandboxed DOM frames.</p>
          <p>• C Language runs with simulated GCC output terminal.</p>
          <Button fullWidth onClick={() => setIsHowItWorksOpen(false)} size="sm">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
