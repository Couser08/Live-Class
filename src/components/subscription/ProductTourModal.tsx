import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUIStore } from '../../stores/uiStore';
import { Radio, Code2, FlaskConical, Sparkles, ChevronRight, ChevronLeft, CheckCircle2, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TourStep {
  stepNumber: number;
  badge: string;
  title: string;
  headline: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  gradient: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    badge: 'Live Peer Classrooms',
    title: 'Real-Time Synchronized Coding',
    headline: 'Follow your mentor keystroke-by-keystroke in real-time.',
    description: 'CodeBuddy streams editor keystrokes, active cursors, and line highlights over low-latency WebSockets so students always stay in sync.',
    icon: <Radio className="w-8 h-8 text-emerald-400 animate-pulse" />,
    highlights: [
      'Zero-lag live code streaming',
      'Follow mentor mode with automatic line focus',
      'Room PIN security & 1-click shareable join links',
    ],
    gradient: 'from-emerald-900/40 via-indigo-950/40 to-slate-900/60',
  },
  {
    stepNumber: 2,
    badge: 'Professional IDE',
    title: 'CodeMirror 6 Multi-File Engine',
    headline: 'Run C, HTML, CSS & JavaScript with instant feedback.',
    description: 'A hardware-accelerated single-canvas code editor with bracket matching, syntax highlighting, companion header support, and live browser previews.',
    icon: <Code2 className="w-8 h-8 text-indigo-400" />,
    highlights: [
      'Single-layer editor: zero cursor jumps or ghosting',
      'Native C interpreter supporting functions & loops',
      'Instant HTML/CSS/JS preview terminal',
    ],
    gradient: 'from-indigo-900/40 via-purple-950/40 to-slate-900/60',
  },
  {
    stepNumber: 3,
    badge: 'Fearless Learning',
    title: 'Personal Sandbox & Markdown Notes',
    headline: 'Fork mentor code to experiment without affecting the class.',
    description: 'Switch anytime between live following and your private sandbox. Mentor broadcasts professional Markdown study notes with copyable code blocks.',
    icon: <FlaskConical className="w-8 h-8 text-amber-400" />,
    highlights: [
      '1-Click Fork into personal private sandbox',
      'Interactive Markdown formatting toolbar',
      '1-Click download of classroom notes & cheatsheets',
    ],
    gradient: 'from-amber-900/30 via-orange-950/30 to-slate-900/60',
  },
  {
    stepNumber: 4,
    badge: 'Pro Superpowers',
    title: 'Interactive Replay & 1-on-1 Help',
    headline: 'Unlock 12 Months of CodeBuddy Pro for ₹0 Free!',
    description: 'As an early beta learner, claim 365 days of full Pro access including Interactive Code Replay, Priority Hand Raise Queue, and Luxury IDE themes.',
    icon: <Gift className="w-8 h-8 text-pink-400 animate-bounce" />,
    highlights: [
      'Interactive timeline code scrubber player',
      'Priority 1-on-1 hand raise & mentor takeover queue',
      'Luxury themes: Catppuccin, Tokyo Night, Dracula Pro',
    ],
    gradient: 'from-pink-900/40 via-purple-900/40 to-indigo-950/60',
  },
];

export const ProductTourModal: React.FC = () => {
  const { isTourModalOpen, closeTourModal, openClaimRewardModal } = useUIStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      closeTourModal();
      openClaimRewardModal();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleClaimDirectly = () => {
    closeTourModal();
    openClaimRewardModal();
  };

  return (
    <Modal
      isOpen={isTourModalOpen}
      onClose={closeTourModal}
      title="Welcome to CodeBuddy Live Classrooms"
      description={`Step ${currentStep.stepNumber} of ${TOUR_STEPS.length} • Interactive Platform Walkthrough`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Step Visual Hero Card */}
        <div
          className={cn(
            'rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden bg-gradient-to-br',
            currentStep.gradient,
            'border-slate-200 dark:border-slate-800 shadow-xl'
          )}
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 dark:bg-black/30 backdrop-blur-md text-white border border-white/10">
                {currentStep.badge}
              </span>
              <div className="p-2 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md">
                {currentStep.icon}
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {currentStep.title}
              </h3>
              <p className="text-sm font-semibold text-indigo-200 mt-0.5">
                {currentStep.headline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Highlights List */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              {currentStep.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/95 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={step.stepNumber}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all cursor-pointer',
                currentStepIndex === idx
                  ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              )}
              aria-label={`Go to step ${step.stepNumber}`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClaimDirectly}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Skip to 12-Mo Free Reward 🎁
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                icon={<ChevronLeft className="w-4 h-4" />}
                className="rounded-xl"
              >
                Back
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              className="rounded-xl px-5 font-bold shadow-md shadow-indigo-600/20"
              icon={isLastStep ? <Sparkles className="w-4 h-4 text-amber-300" /> : <ChevronRight className="w-4 h-4" />}
            >
              {isLastStep ? 'Claim 12-Month Pro Trial 🚀' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
