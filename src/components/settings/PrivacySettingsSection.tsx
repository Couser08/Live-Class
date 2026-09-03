import React from 'react';
import { Card } from '../common/Card';
import { Shield, KeyRound, Globe, Video, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const PrivacySettingsSection: React.FC = () => {
  const { privacy, updatePrivacy } = useSettingsStore();

  const toggleItems = [
    {
      key: 'requireRoomPin' as const,
      title: 'Enforce 4-Digit Room PIN on New Sessions',
      description: 'Learners must provide both Room Code and Secret PIN to enter live rooms.',
      icon: KeyRound,
      value: privacy.requireRoomPin,
    },
    {
      key: 'allowPublicSearch' as const,
      title: 'Public Room Discovery in Directory',
      description: 'Allow students to search and join your live room from the public sessions board.',
      icon: Globe,
      value: privacy.allowPublicSearch,
    },
    {
      key: 'recordSessions' as const,
      title: 'Session Keystroke Timeline Recording',
      description: 'Automatically record keystrokes and code diffs for students to replay later.',
      icon: Video,
      value: privacy.recordSessions,
    },
    {
      key: 'incognitoPreview' as const,
      title: 'Incognito Sandboxed Preview Iframe',
      description: 'Purge browser localStorage and cookies from live preview frames on session exit.',
      icon: EyeOff,
      value: privacy.incognitoPreview,
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy & Room Security</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Control access permissions, room PIN policies, and data isolation for 1-on-1 sessions.
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
                onClick={() => updatePrivacy({ [item.key]: !item.value })}
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
