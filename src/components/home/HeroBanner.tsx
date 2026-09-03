import React, { useState } from 'react';
import { Plus, LogIn, PlayCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { HeroCodeSlider } from './HeroCodeSlider';
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

          {/* Right Interactive Code & Preview Slider Showcase */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <HeroCodeSlider />
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
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live 500ms Smooth Follow Mode</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                As mentor types, code streams to student screens with real-time 500ms follow mode and cursor highlighting.
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
