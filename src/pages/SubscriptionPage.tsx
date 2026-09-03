import React, { useState } from 'react';
import { useAuthStore, isMentorEmail } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import {
  Gift,
  PlayCircle,
  Users,
  Code2,
  Trophy,
  ShieldCheck,
  Check,
  RotateCcw,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SubscriptionHeroGraphic } from '../components/subscription/SubscriptionHeroGraphic';

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuthStore();
  const { openClaimRewardModal, openTourModal } = useUIStore();
  const isMentor = isMentorEmail(user?.email) || user?.role === 'mentor';
  const isPro = isMentor || Boolean(user?.isPro);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is the 12-month free trial really 100% free?',
      a: 'Yes, absolutely! As part of our Beta early-adopter launch, all students and mentors can claim a full 365 days of CodeBuddy Pro access with ₹0 payment and no credit card required.',
    },
    {
      q: 'What happens after the 12 months end?',
      a: 'You will never be auto-charged. You can choose whether you wish to continue with Pro or stay on the permanent Free Starter tier.',
    },
    {
      q: 'Can BCA, MCA, B.Tech, and self-taught students claim this reward?',
      a: 'Yes! Any learner enrolled in computer science, coding bootcamps, or self-learning can claim the 12-Month Free Trial Reward by completing the quick 30-second student details survey.',
    },
    {
      q: 'How do the Interactive Code Replay and Hand Raise features work?',
      a: 'With Pro, you get full access to the interactive timeline scrubber player to replay mentor keystrokes at 1.5x/2x speed and the priority queue to request 1-on-1 mentor guidance during live classes.',
    },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      {/* 1. HERO SECTION BANNER */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-8 sm:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Offer Copy & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-[#4F46E5] dark:text-indigo-400">
                Beta Launch • Early Adopter Reward
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              CodeBuddy Pro is{' '}
              <span className="text-[#4F46E5] dark:text-[#6366F1]">100% Free</span> for 12 Months.
            </h1>

            {/* Description Subtitle */}
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Unlock interactive code replays, 1-on-1 mentor hand raise queue, luxury IDE themes, and
              milestone snapshots. No credit card required.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={openClaimRewardModal}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg active:scale-[0.98]"
              >
                <Users className="w-4 h-4 text-indigo-200" />
                <span>Claim 12-Month Free Trial</span>
                <Gift className="w-4 h-4 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={openTourModal}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <PlayCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Take Product Tour</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Isometric Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <SubscriptionHeroGraphic />
          </div>
        </div>

        {/* Lower Feature Badges Strip (4 Features in a Row) */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Badge 1: Interactive Learning */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Interactive Learning</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Learn by doing in real-time</p>
            </div>
          </div>

          {/* Badge 2: Pro IDE Experience */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pro IDE Experience</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Premium themes & tools</p>
            </div>
          </div>

          {/* Badge 3: Milestone Snapshots */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Milestone Snapshots</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Track, save & revisit progress</p>
            </div>
          </div>

          {/* Badge 4: No Payment Needed */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Payment Needed</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">100% free for 12 months</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE-TIER PRICING MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Free Starter */}
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 p-7 flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.08)] transition-all duration-200">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">
                  COMMUNITY TIER
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">Free Starter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  For casual learners exploring public live coding sessions.
                </p>
              </div>

              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mt-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₹0</span>
              <span className="text-xs text-slate-400 font-medium">/ forever free</span>
            </div>

            {/* Feature Checkmarks */}
            <div className="space-y-3.5 py-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Join public live classrooms</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>CodeMirror & single-canvas editor</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Basic C, HTML & JS compilation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Public classroom chat</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-center cursor-default"
            >
              Current Base Tier
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Student (Featured Card) */}
        <div className="bg-white dark:bg-[#111726] rounded-3xl border-2 border-[#5046E5] dark:border-[#6366F1] p-7 flex flex-col justify-between shadow-xl shadow-indigo-500/10 dark:shadow-indigo-950/30 relative overflow-hidden">
          {/* Top-Right Badge: 12 MO FREE REWARD */}
          <div className="absolute top-0 right-0 bg-[#5046E5] text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-4 rounded-bl-2xl shadow-xs flex items-center gap-1.5">
            <span>12 MO FREE REWARD</span>
            <Gift className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </div>

          <div>
            {/* Header */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">
                EARLY ADOPTER PASS
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                <span>Pro Student</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-700/50">
                  <span>☆</span>
                  <span>PRO</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Full power for BCA, MCA, Engineering & Bootcamp students.
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2.5 mt-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₹0</span>
              <span className="text-xs text-slate-400 line-through font-medium">₹499/mo</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                100% Free for 1 Year
              </span>
            </div>

            {/* Pro Features */}
            <div className="space-y-3.5 py-6 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">Interactive Code Replay Player</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">Priority 1-on-1 Mentor Hand Raise</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm shrink-0">🎨</span>
                <span className="font-semibold">All Luxury IDE Themes & Fonts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm shrink-0">⏱️</span>
                <span className="font-semibold">Milestone Snapshots & 1-Click Restore</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm shrink-0">⭐</span>
                <span className="font-semibold">Verified PRO Learner Badge</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={openClaimRewardModal}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-[#5046E5] hover:bg-[#4338CA] shadow-md shadow-indigo-500/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{isPro ? 'Pro Active (Claimed) 🚀' : 'Claim 12-Month Free Trial 🚀'}</span>
            </button>
          </div>
        </div>

        {/* Tier 3: Mentor Pro */}
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 p-7 flex flex-col justify-between shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.08)] transition-all duration-200">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  EDUCATORS & MENTORS
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">Mentor Pro</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  For peer mentors and instructors teaching live coding.
                </p>
              </div>

              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2.5 mt-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₹0</span>
              <span className="text-xs text-slate-400 line-through font-medium">₹999/mo</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Free in Beta</span>
            </div>

            {/* Features */}
            <div className="space-y-3.5 py-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Unlimited live classrooms & rooms</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Real-time code stream broadcasting</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Interactive Markdown notes broadcaster</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Student doubt inspection & takeover</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={openClaimRewardModal}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-center transition-colors cursor-pointer active:scale-[0.98]"
            >
              Get Mentor Access
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TRUST BADGES FOOTER */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>No credit card required</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Cancel anytime</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>100% Free for 12 Months</span>
        </div>
      </div>

      {/* 4. EXPANDABLE FAQ ACCORDION */}
      <div className="mt-12 bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed pr-8 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
