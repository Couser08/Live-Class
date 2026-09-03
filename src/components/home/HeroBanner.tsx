import React, { useState } from 'react';
import { Plus, LogIn, PlayCircle, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';

export const HeroBanner: React.FC = () => {
  const { openNewSessionModal, openJoinModal } = useUIStore();
  const { user } = useAuthStore();
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const isMentor = isMentorEmail(user?.email) || user?.role === 'mentor';

  return (
    <>
      <div className="relative rounded-3xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Actions */}
          <div className="lg:col-span-6 space-y-5">
            {/* Status Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100/80 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Live • WebSocket Sync</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Interactive Coding. <br />
                Synchronized <span className="text-[#4F46E5] dark:text-indigo-400">Live.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal max-w-md">
                Broadcast editor keystrokes, companion files, and terminal execution to students in real time with line-level focus and sandbox experimentation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                onClick={() => (isMentor ? openNewSessionModal('html') : openNewSessionModal())}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-xs cursor-pointer border-0"
              >
                Create Classroom
              </Button>

              <Button
                onClick={() => openJoinModal()}
                variant="outline"
                size="md"
                icon={<LogIn className="w-4 h-4" />}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-semibold rounded-xl px-4 py-2.5 text-xs cursor-pointer shadow-2xs"
              >
                Join via PIN
              </Button>
            </div>

            {/* See How It Works Link */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>See how it works</span>
              </button>
            </div>
          </div>

          {/* Right Dual-Window Editor & Live Preview Showcase */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <div className="relative flex items-center w-full max-w-[480px]">
              {/* Left Window: Code Editor */}
              <div className="w-[58%] rounded-2xl bg-[#0F141F] border border-slate-800 shadow-xl overflow-hidden text-slate-300 z-10 flex flex-col">
                {/* Window Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-[#141A28]">
                  <span className="text-[11px] font-mono text-slate-300 font-medium">index.html</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Code Snippet with Line Numbers */}
                <div className="p-3 text-[11px] font-mono leading-snug space-y-0.5 select-none overflow-x-hidden">
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">1</span> &lt;<span className="text-indigo-400">!DOCTYPE</span> <span className="text-amber-300">html</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">2</span> &lt;<span className="text-indigo-400">html</span> <span className="text-amber-300">lang</span>=<span className="text-emerald-300">"en"</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">3</span> &lt;<span className="text-indigo-400">head</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">4</span>   &lt;<span className="text-indigo-400">meta</span> <span className="text-amber-300">charset</span>=<span className="text-emerald-300">"UTF-8"</span> /&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">5</span>   &lt;<span className="text-indigo-400">title</span>&gt;Live Class Demo&lt;/<span className="text-indigo-400">title</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">6</span>   &lt;<span className="text-indigo-400">link</span> <span className="text-amber-300">rel</span>=<span className="text-emerald-300">"stylesheet"</span></div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">7</span>     <span className="text-amber-300">href</span>=<span className="text-emerald-300">"style.css"</span> /&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">8</span> &lt;/<span className="text-indigo-400">head</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">9</span> &lt;<span className="text-indigo-400">body</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">10</span>  &lt;<span className="text-indigo-400">div</span> <span className="text-amber-300">class</span>=<span className="text-emerald-300">"card"</span>&gt;</div>
                  <div className="text-slate-300 font-semibold bg-indigo-950/50 -mx-3 px-3"><span className="inline-block w-4 text-slate-500">11</span>    &lt;<span className="text-indigo-400">h1</span>&gt;Hello, World!&lt;/<span className="text-indigo-400">h1</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">12</span>    &lt;<span className="text-indigo-400">p</span>&gt;Learning HTML is fun 🚀&lt;/<span className="text-indigo-400">p</span>&gt;</div>
                  <div className="text-slate-500"><span className="inline-block w-4 text-slate-600">13</span>  &lt;/<span className="text-indigo-400">div</span>&gt;</div>
                </div>

                {/* Footer status bar */}
                <div className="flex items-center justify-between px-3 py-1 border-t border-slate-800/80 text-[9px] font-mono text-slate-500 bg-[#0C101A]">
                  <span>Ln 11, Col 24</span>
                  <span>HTML</span>
                </div>
              </div>

              {/* Center Lightning Badge */}
              <div className="absolute left-[54%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                <Zap className="w-4 h-4 fill-white" />
              </div>

              {/* Right Window: Live Browser Preview */}
              <div className="w-[50%] -ml-6 rounded-2xl bg-white dark:bg-[#161D2B] border border-slate-200/90 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col z-0">
                {/* Browser Controls Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#131926]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">+</span> Live Preview
                  </span>
                </div>

                {/* Live Preview Rendered Body */}
                <div className="p-5 flex flex-col justify-center min-h-[190px] space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Hello, World!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Learning HTML is fun 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      <Modal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        title="How CodeBuddy Works"
        description="Effortless 1-on-1 real-time teaching in 3 simple steps"
      >
        <div className="space-y-4 py-3">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
            <div className="w-7 h-7 rounded-xl bg-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create a Room & Share PIN</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Generate a 6-character room code and 4-digit PIN or direct 1-click shareable invite link.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <div className="w-7 h-7 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live 1-Second Smooth Follow Mode</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                As mentor types, code streams to student screens with real-time cursor highlighting and follow mode.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Interactive Q&A & Sandboxes</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Students ask live questions with line-level context and can switch to personal local sandboxes.
              </p>
            </div>
          </div>

          <Button
            fullWidth
            onClick={() => {
              setIsHowItWorksOpen(false);
              if (isMentor) {
                openNewSessionModal('html');
              } else {
                openJoinModal();
              }
            }}
            className="mt-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-2.5 rounded-xl text-xs"
          >
            {isMentor ? 'Create Live Classroom' : 'Join a Classroom'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
