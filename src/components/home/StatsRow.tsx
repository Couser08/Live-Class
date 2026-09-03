import React from 'react';
import { Card } from '../common/Card';
import { Clock, MessageSquare, Heart, Gift } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

export const StatsRow: React.FC = () => {
  const metrics = useSessionStore((state) => state.metrics);

  const stats = [
    {
      id: 'sessions',
      value: metrics.sessionsCompleted.toString(),
      label: 'Sessions Completed',
      icon: Gift,
      iconBg: 'bg-[#EEF0FF] dark:bg-indigo-950/70 text-[#5551FF] dark:text-indigo-400',
    },
    {
      id: 'time',
      value: `${metrics.teachingTimeHours}h ${metrics.teachingTimeMinutes}m`,
      label: 'Teaching Time',
      icon: Clock,
      iconBg: 'bg-[#E8F8F0] dark:bg-emerald-950/70 text-[#10B981] dark:text-emerald-400',
    },
    {
      id: 'questions',
      value: metrics.questionsAnswered.toString(),
      label: 'Questions Answered',
      icon: MessageSquare,
      iconBg: 'bg-[#EBF5FF] dark:bg-blue-950/70 text-[#3B82F6] dark:text-blue-400',
    },
    {
      id: 'learners',
      value: metrics.happyLearners.toString(),
      label: 'Happy Learners',
      icon: Heart,
      iconBg: 'bg-[#FEECEE] dark:bg-rose-950/70 text-[#EF4444] dark:text-rose-400',
    },
  ];

  return (
    <Card className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`flex items-center gap-4 ${
                idx > 0 ? 'md:pl-6' : ''
              } ${idx >= 2 ? 'pt-4 md:pt-0' : ''}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
