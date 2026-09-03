import React from 'react';
import { Card } from '../common/Card';
import { Lightbulb, ArrowRight, Bookmark } from 'lucide-react';
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
    <Card className="p-6 bg-[#F6F7FE] dark:bg-indigo-950/30 border-[#E8EAFF] dark:border-indigo-900/40 rounded-3xl flex flex-col justify-between space-y-4 relative overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
      {/* Decorative Ribbon Bookmark Icon in Top Right */}
      <div className="absolute top-5 right-6 w-8 h-9 rounded-b-md bg-[#818CF8]/80 text-white flex items-center justify-center shadow-xs">
        <Bookmark className="w-4 h-4 fill-white" />
      </div>

      <div className="space-y-2 max-w-[80%]">
        {/* Header */}
        <div className="flex items-center gap-2 text-[#4F46E5] dark:text-indigo-400">
          <Lightbulb className="w-4 h-4 fill-[#4F46E5] text-[#4F46E5]" />
          <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Pro Tip</h4>
        </div>

        {/* Tip text */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          Use bookmarks to save important concepts and code snippets during live classrooms.
        </p>
      </div>

      {/* Action */}
      <div className="pt-1">
        <button
          onClick={handleExploreNotes}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:text-[#4338CA] dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        >
          <span>Explore Notes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
};
