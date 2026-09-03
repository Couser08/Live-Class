import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShikiHighlighter } from '../code/ShikiHighlighter';
import { Edit3, Copy, Check } from 'lucide-react';
import { NoteItem } from './NoteListSidebar';
import { useClipboard } from '../../hooks/useClipboard';

interface NoteContentViewerProps {
  note: NoteItem;
  onEditNote: (note: NoteItem) => void;
}

export const NoteContentViewer: React.FC<NoteContentViewerProps> = ({ note, onEditNote }) => {
  const { copy, hasCopied } = useClipboard();

  return (
    <Card className="p-6 space-y-5">
      {/* Note Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF3EC] dark:bg-orange-950/40 flex items-center justify-center p-2 shadow-xs shrink-0">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <path d="M4 2L6.5 28L16 31L25.5 28L28 2H4Z" fill="#E44D26" />
              <path d="M16 28.5L23.5 26.2L25.5 4H16V28.5Z" fill="#F16529" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {note.title}
              </h2>
              <Badge variant="live" pulse={false} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                {note.language.toUpperCase()}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Last updated: {note.date}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onEditNote(note)}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Note</span>
        </button>
      </div>

      {/* Formatted Content */}
      <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1.5">
            {note.contentHeading1}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {note.contentBody1}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1.5">
            {note.contentHeading2}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-2.5">
            {note.contentBody2}
          </p>

          {/* Shiki Code Block with Copy Button */}
          <div className="bg-[#090D16] rounded-2xl p-3.5 relative border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>{note.language}</span>
              <button
                onClick={() => copy(note.codeSnippet, 'Code snippet copied!')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <ShikiHighlighter
              code={note.codeSnippet}
              language={note.language}
              showLineNumbers={true}
              className="text-[11px]"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
