import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Sparkles, Gift, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const STREAMS = [
  'BCA',
  'MCA',
  'B.Tech CSE/IT',
  'B.Sc Computer Science',
  'Diploma in CS/IT',
  'Working / Self-Taught',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Recent Graduate'];

const TARGET_GOALS = [
  'Crack IT Job Placements & Interviews',
  'Score Top Marks in College Labs & Exams',
  'Master C / C++ & Data Structures',
  'Build Production Full-Stack Projects',
];

export const ClaimRewardModal: React.FC = () => {
  const { isClaimRewardModalOpen, closeClaimRewardModal, addToast } = useUIStore();
  const { user, claimProTrial } = useAuthStore();

  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedStream, setSelectedStream] = useState(user?.stream || 'BCA');
  const [selectedYear, setSelectedYear] = useState(user?.collegeYear || '1st Year');
  const [selectedGoal, setSelectedGoal] = useState(user?.targetGoal || TARGET_GOALS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      addToast({
        type: 'warning',
        title: 'Valid Mobile Number Required',
        description: 'Please enter a valid 10-digit mobile number for class notifications.',
      });
      return;
    }

    setIsSubmitting(true);
    const res = await claimProTrial({
      phone: phone.trim(),
      stream: selectedStream,
      collegeYear: selectedYear,
      targetGoal: selectedGoal,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch {}

      addToast({
        type: 'success',
        title: '🎉 12-Month Pro Free Trial Activated!',
        description: 'You now have full access to all Pro features for 365 days.',
      });

      setTimeout(() => {
        setIsSuccess(false);
        closeClaimRewardModal();
      }, 2500);
    }
  };

  return (
    <Modal
      isOpen={isClaimRewardModalOpen}
      onClose={closeClaimRewardModal}
      title="Claim 12-Month Pro Free Trial 🎁"
      description="Beta Launch Special: 100% Free For All Students & Early Mentors"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Congratulations, {user?.name || 'Coder'}! 🚀
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
              Your <strong>CodeBuddy PRO</strong> membership is now active for <strong>12 Months Free</strong> (Valid until September 2027).
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>All Pro Features & Badges Unlocked</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Pro Perks Value Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Free Early Adopter Reward (Normally ₹4,999/yr)</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">₹0 Free</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                Includes Interactive Code Replay, 1-on-1 Mentor Hand Raise Queue, Pro Themes & Fonts, and 1-Click Sandbox Forking.
              </p>
            </div>
          </div>

          {/* 1. Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile / WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Used for classroom start alerts and doubt resolution updates.</p>
          </div>

          {/* 2. Education Stream */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Education Stream / Course <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STREAMS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSelectedStream(s)}
                  className={cn(
                    'px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between',
                    selectedStream === s
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <span className="truncate">{s}</span>
                  {selectedStream === s && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. College Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Academic Year <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                    selectedYear === y
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Primary Target Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              What is your primary goal right now? <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {TARGET_GOALS.map((g) => (
                <div
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between',
                    selectedGoal === g
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  )}
                >
                  <span>{g}</span>
                  {selectedGoal === g && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 font-extrabold shadow-lg shadow-indigo-600/25 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white hover:brightness-105 transition-all"
              icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              {isSubmitting ? 'Activating Pro Reward...' : 'Claim 12-Month Free Trial Now 🚀'}
            </Button>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              No credit card required. 100% Free for 365 Days.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
