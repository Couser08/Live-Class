import React from 'react';
import { Card } from '../common/Card';
import { MessageSquare, Sparkles, ArrowDownToLine, ThumbsUp, Clock } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const ChatSettingsSection: React.FC = () => {
  const { chat, updateChat } = useSettingsStore();

  const toggleItems = [
    {
      key: 'typingIndicators' as const,
      title: 'Live Typing Indicators',
      description: "Display 'Learner is typing...' when friend or student drafts a query.",
      icon: Sparkles,
      value: chat.typingIndicators,
    },
    {
      key: 'autoScroll' as const,
      title: 'Auto-Scroll to Newest Message',
      description: 'Automatically scroll chat timeline when new learner queries arrive.',
      icon: ArrowDownToLine,
      value: chat.autoScroll,
    },
    {
      key: 'showTimestamps' as const,
      title: 'Show Exact Message Timestamps',
      description: 'Display clock timestamps on every question and reply bubble.',
      icon: Clock,
      value: chat.showTimestamps,
    },
    {
      key: 'allowUpvotes' as const,
      title: 'Learner Upvotes & Reactions',
      description: 'Allow students to react to clear explanations and key answers.',
      icon: ThumbsUp,
      value: chat.allowUpvotes,
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Chat & Q&A Workspace Settings</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tune interactive messaging, question prioritization, and timeline behaviors.
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
                onClick={() => updateChat({ [item.key]: !item.value })}
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
