import React, { useState } from 'react';
import { Play, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { MockEditorPreview } from '../code/MockEditorPreview';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Modal } from '../common/Modal';

export const HeroBanner: React.FC = () => {
  const { openNewSessionModal, openJoinModal } = useUIStore();
  const { user } = useAuthStore();
  const isMentor = user?.role === 'mentor';
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-3xl bg-[#0c101e] border border-slate-800/90 p-5 sm:p-7 md:p-8 text-white overflow-hidden shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 2xl:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Text & CTA Column */}
          <div className="2xl:col-span-5 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Teach code. <br />
                In <span className="text-[#6875F5] font-black">real time.</span>
              </h2>
              <p className="text-slate-300/90 text-xs sm:text-sm md:text-base leading-relaxed font-normal pt-1 max-w-md">
                Write once, your friend sees it in 1 second. Ask questions. Learn together.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Button
                onClick={() => openNewSessionModal()}
                size="md"
                className="bg-[#6366F1] hover:bg-[#5356E8] text-white font-bold rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>+ Create Classroom</span>
              </Button>

              <Button
                onClick={() => openJoinModal()}
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                <span>Join with PIN</span>
              </Button>

              <button
                onClick={() => setIsHowItWorksOpen(true)}
                className="inline-flex items-center gap-2 bg-[#171D33] hover:bg-[#202745] border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 transition-colors cursor-pointer"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-slate-800 flex items-center justify-center">
                  <Play className="w-2 h-2 fill-slate-300 text-slate-300 ml-0.5" />
                </div>
                <span>How it works</span>
              </button>
            </div>
          </div>

          {/* Right Live Simulation Preview Column */}
          <div className="2xl:col-span-7 w-full overflow-hidden">
            <MockEditorPreview />
          </div>
        </div>
      </div>

      {/* How it works modal */}
      <Modal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        title="How CodeBuddy Works"
        description="Effortless 1-on-1 real-time teaching in 3 simple steps"
      >
        <div className="space-y-4 py-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create a Room & Share PIN</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Generate a 6-character room code and 4-digit PIN or direct 1-click shareable invite link.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
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

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
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
            className="mt-2"
          >
            {isMentor ? 'Create Live Classroom' : 'Join a Classroom'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
