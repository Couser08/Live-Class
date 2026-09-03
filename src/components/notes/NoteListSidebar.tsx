import React from 'react';
import { Card } from '../common/Card';
import { Pin, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../../types/session.types';
import { cn } from '../../lib/utils';

export interface NoteItem {
  id: string;
  title: string;
  language: SupportedLanguage;
  date: string;
  readTime: string;
  isPinned?: boolean;
  contentHeading1: string;
  contentBody1: string;
  contentHeading2: string;
  contentBody2: string;
  codeSnippet: string;
  words: number;
  characters: number;
  tags: string[];
}

interface NoteListSidebarProps {
  notes: NoteItem[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  onViewAllNotes: () => void;
}

export const NoteListSidebar: React.FC<NoteListSidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onViewAllNotes,
}) => {
  const badgeColors = {
    html: 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/60',
    c: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/60',
    javascript: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60',
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between px-1 pb-1">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
          All Notes
        </h3>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {notes.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {notes.map((note) => {
          const isSelected = note.id === selectedNoteId;

          return (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={cn(
                'p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border',
                isSelected
                  ? 'bg-[#EEF0FF] dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 shadow-2xs text-[#5551FF] dark:text-indigo-300'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-700'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 uppercase border',
                    badgeColors[note.language]
                  )}
                >
                  {note.language === 'javascript' ? 'JS' : note.language === 'html' ? '5' : 'C'}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {note.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {note.date} • {note.readTime}
                  </p>
                </div>
              </div>

              {note.isPinned && (
                <Pin className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAllNotes}
        className="w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors pt-2 flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>View all notes</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
};
