import React from 'react';
import { Card } from '../common/Card';
import { Clock, MessageSquare, Users, GraduationCap } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

export const StatsRow: React.FC = () => {
  const metrics = useSessionStore((state) => state.metrics);

  const stats = [
    {
      id: 'sessions',
      value: metrics.sessionsCompleted.toString(),
      label: 'Classrooms Completed',
      icon: GraduationCap,
    },
    {
      id: 'time',
      value: `${metrics.teachingTimeHours}h ${metrics.teachingTimeMinutes}m`,
      label: 'Total Streamed Time',
      icon: Clock,
    },
    {
      id: 'questions',
      value: metrics.questionsAnswered.toString(),
      label: 'Doubts Resolved',
      icon: MessageSquare,
    },
    {
      id: 'learners',
      value: metrics.happyLearners.toString(),
      label: 'Connected Learners',
      icon: Users,
    },
  ];

  return (
    <Card className="p-5 bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`flex items-center gap-3.5 ${
                idx > 0 ? 'md:pl-6' : ''
              } ${idx >= 2 ? 'pt-4 md:pt-0' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
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
