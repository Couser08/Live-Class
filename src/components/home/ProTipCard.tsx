import React from 'react';
import { Card } from '../common/Card';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const ProTipCard: React.FC = () => {
  const { setActiveNavTab, addToast } = useUIStore();

  const handleExploreNotes = () => {
    setActiveNavTab('my-notes');
    addToast({
      type: 'info',
      title: 'Notes & Bookmarks',
      description: 'Navigated to your saved live session notes & code snippets.',
    });
  };

  return (
    <Card className="p-6 bg-[#F5F6FE] dark:bg-indigo-950/40 border-[#E8EAFF] dark:border-indigo-900/60 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-[#5551FF] dark:text-indigo-400">
          <Lightbulb className="w-4 h-4 fill-current" />
          <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Pro Tip</h4>
        </div>

        {/* Tip text */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Use bookmarks to save important concepts and code snippets during live classrooms.
        </p>
      </div>

      {/* Action */}
      <div>
        <button
          onClick={handleExploreNotes}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5551FF] dark:text-indigo-400 hover:text-[#433CE2] dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        >
          <span>Explore Notes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
};
