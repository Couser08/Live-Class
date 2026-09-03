import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore, isMentorEmail } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { Sparkles, Check, Gift, ChevronDown, ChevronUp } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuthStore();
  const { openClaimRewardModal, openTourModal } = useUIStore();
  const isMentor = isMentorEmail(user?.email) || user?.role === 'mentor';
  const isPro = isMentor || Boolean(user?.isPro);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

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
    <div className="space-y-8 pb-16 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-indigo-700/40 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-amber-300">
            <Gift className="w-4 h-4 animate-bounce" />
            <span>Beta Launch Early Adopter Reward</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            CodeBuddy Pro is <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-indigo-300">100% Free</span> for 12 Months.
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-medium">
            Unlock Interactive Code Replays, 1-on-1 Mentor Hand Raise Queue, Luxury IDE Themes, and Milestone Snapshots. No credit card required.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm">
                <Check className="w-4 h-4" />
                <span>⭐ CodeBuddy Pro Active on Your Account</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={openClaimRewardModal}
                className="rounded-2xl px-6 py-3.5 font-black shadow-xl shadow-indigo-600/30 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 text-white hover:brightness-105 transition-all text-sm"
                icon={<Sparkles className="w-4 h-4 text-white" />}
              >
                Claim 12-Month Free Trial (₹0) 🎁
              </Button>
            )}

            <button
              type="button"
              onClick={openTourModal}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/10"
            >
              Take Product Tour
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free Starter */}
        <Card className="rounded-3xl p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Community Tier</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Free Starter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For casual learners exploring public live coding sessions.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs text-slate-400">/ forever free</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Join public live classrooms</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>CodeMirror 6 single-canvas editor</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Basic C, HTML & JS compilation</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Public classroom chat</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="outline"
              size="md"
              disabled
              className="w-full rounded-xl font-bold opacity-60"
            >
              Current Base Tier
            </Button>
          </div>
        </Card>

        {/* Tier 2: Pro Student (Featured) */}
        <Card className="rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border-2 border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm">
            12 Mo Free Reward 🎁
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Early Adopter Pass</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <span>Pro Student</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  ⭐ PRO
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Full power for BCA, MCA, Engineering & Bootcamp students.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs line-through text-slate-400">₹499/mo</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">100% Free for 1 Year</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>🎬 Interactive Code Replay Player</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>✋ Priority 1-on-1 Mentor Hand Raise</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>🎨 All Luxury IDE Themes & Fonts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>⏱️ Milestone Snapshots & 1-Click Restore</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>⭐ Verified PRO Learner Badge</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="primary"
              size="md"
              onClick={openClaimRewardModal}
              disabled={isPro}
              className="w-full rounded-xl py-3 font-extrabold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPro ? 'Pro Active (12 Months Free)' : 'Claim 12-Month Free Trial 🚀'}
            </Button>
          </div>
        </Card>

        {/* Tier 3: Mentor Pro */}
        <Card className="rounded-3xl p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Educators & Mentors</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Mentor Pro</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For peer mentors and instructors teaching live coding.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs line-through text-slate-400">₹999/mo</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Free in Beta</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited live classrooms & rooms</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time code stream broadcasting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Interactive Markdown notes broadcaster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Student doubt inspection & takeover</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="outline"
              size="md"
              onClick={openClaimRewardModal}
              className="w-full rounded-xl font-bold"
            >
              Get Mentor Access
            </Button>
          </div>
        </Card>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 pt-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about the 12-Month Pro Free Trial Reward.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {expandedFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2 animate-in fade-in duration-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
