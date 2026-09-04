import React from 'react';
import { Card } from '../common/Card';
import { Download, Trash2, Printer } from 'lucide-react';
import { NoteItem } from './NoteListSidebar';
import { useUIStore } from '../../stores/uiStore';

interface NoteDetailsSidebarProps {
  note: NoteItem;
  onExportPDF?: () => void;
  onDeleteNote: (id: string) => void;
}

export const NoteDetailsSidebar: React.FC<NoteDetailsSidebarProps> = ({
  note,
  onExportPDF,
  onDeleteNote,
}) => {
  const { addToast } = useUIStore();

  const handlePrintPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const escape = (str: string) =>
      (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const tagsHtml = (note.tags || [])
      .map(
        (t) =>
          `<span style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:6px;border:1px solid #e2e8f0;">${escape(t)}</span>`
      )
      .join('');

    const codeHtml = note.codeSnippet
      ? `<div style="margin-top:16px;"><strong>Code Example (${note.language.toUpperCase()}):</strong><pre style="background:#0f172a;color:#f8fafc;padding:16px;border-radius:8px;font-family:Consolas, monospace;font-size:13px;overflow-x:auto;line-height:1.5;"><code>${escape(note.codeSnippet)}</code></pre></div>`
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escape(note.title)} - CodeBuddy Notes</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; }
            h1 { font-size: 24px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 8px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
            h2 { font-size: 16px; font-weight: 700; margin-top: 20px; color: #1e293b; }
            p { font-size: 13.5px; white-space: pre-line; color: #334155; }
            .footer { margin-top: 48px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${escape(note.title)}</h1>
          <div class="meta">
            <span><strong>Language:</strong> ${escape(note.language.toUpperCase())}</span>
            <span><strong>Date:</strong> ${escape(note.date)}</span>
            <span>${tagsHtml}</span>
          </div>
          <h2>${escape(note.contentHeading1)}</h2>
          <p>${escape(note.contentBody1)}</p>
          ${note.contentHeading2 ? `<h2>${escape(note.contentHeading2)}</h2>` : ''}
          ${note.contentBody2 ? `<p>${escape(note.contentBody2)}</p>` : ''}
          ${codeHtml}
          <div class="footer">Exported from CodeBuddy Live Classroom • Senior Mentor: Rahul Tungariya</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${note.title}
*Date: ${note.date}* | *Language: ${note.language.toUpperCase()}* | *Tags: ${note.tags.join(', ')}*

## ${note.contentHeading1}
${note.contentBody1}

${note.contentHeading2 ? `## ${note.contentHeading2}\n${note.contentBody2}\n` : ''}
${note.codeSnippet ? `\`\`\`${note.language}\n${note.codeSnippet}\n\`\`\`\n` : ''}
---
*Exported from CodeBuddy Live Classroom • Senior Mentor: Rahul Tungariya*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Notes Downloaded',
      description: `Saved as ${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`,
    });
  };

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
            onClick={handlePrintPDF}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Print / Export as PDF</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Download Markdown (.md)</span>
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
