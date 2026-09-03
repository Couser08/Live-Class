import React from 'react';
import { Card } from '../common/Card';
import { FileDown, Trash2 } from 'lucide-react';
import { NoteItem } from './NoteListSidebar';

interface NoteDetailsSidebarProps {
  note: NoteItem;
  onExportPDF: () => void;
  onDeleteNote: (id: string) => void;
}

export const NoteDetailsSidebar: React.FC<NoteDetailsSidebarProps> = ({
  note,
  onExportPDF,
  onDeleteNote,
}) => {
  return (
    <div className="space-y-4">
      {/* Note Details Card */}
      <Card className="p-4 space-y-3">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight">
          Note Details
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Language</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 uppercase">
              <span>{note.language}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Created on</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{note.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Last updated</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{note.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Words</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{note.words}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Characters</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{note.characters}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions Card */}
      <Card className="p-4 space-y-2">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight pb-1">
          Quick Actions
        </h3>

        <div className="space-y-1">
          <button
            onClick={onExportPDF}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            <span>Export as PDF</span>
          </button>

          <button
            onClick={() => onDeleteNote(note.id)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Delete Note</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
