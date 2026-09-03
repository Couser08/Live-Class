import React from 'react';
import { Card } from '../common/Card';
import { Bell, Volume2, Mail, Users } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const NotificationsSettingsSection: React.FC = () => {
  const { notifications, updateNotifications } = useSettingsStore();

  const toggleItems = [
    {
      key: 'soundEffects' as const,
      title: 'Sound Effects & Audio Chimes',
      description: 'Play subtle audio feedback when code is executed or questions arrive.',
      icon: Volume2,
      value: notifications.soundEffects,
    },
    {
      key: 'questionAlerts' as const,
      title: 'Real-Time Question Badges',
      description: 'Highlight unread questions in the live classroom tab instantly.',
      icon: Bell,
      value: notifications.questionAlerts,
    },
    {
      key: 'joinLeaveBells' as const,
      title: 'Learner Join / Leave Chimes',
      description: 'Notify with a soft chime when a student enters or exits the session room.',
      icon: Users,
      value: notifications.joinLeaveBells,
    },
    {
      key: 'emailDigest' as const,
      title: 'Daily Teaching Digest Email',
      description: 'Receive a daily summary of sessions taught, hours logged, and notes saved.',
      icon: Mail,
      value: notifications.emailDigest,
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          Notifications & Sound Alerts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure how you are notified of learner questions and live classroom events.
        </p>
      </div>

      <div className="space-y-4">
        {toggleItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700 gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-800">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateNotifications({ [item.key]: !item.value })}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0',
                  item.value ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs',
                    item.value ? 'left-5.5' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
