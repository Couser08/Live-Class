import React from 'react';
import { Copy, Check, Hash, Code2, Quote } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const { copy, hasCopied } = useClipboard();

  if (!content || !content.trim()) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        No notes written yet. Mentor can write notes in Markdown format.
      </div>
    );
  }

  // Parse lines into blocks
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end: ```lang
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const codeText = codeBlockContent.join('\n');
        const lang = codeBlockLang;
        renderedElements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-2xl bg-[#090D16] border border-slate-800 p-3.5 relative shadow-md font-mono text-xs overflow-x-auto text-slate-100"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
              <span className="flex items-center gap-1">
                <Code2 className="w-3 h-3 text-indigo-400" />
                <span>{lang || 'code'}</span>
              </span>
              <button
                onClick={() => copy(codeText, 'Code copied!')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre">
              {codeText}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '').trim();
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Heading 1: # Heading
    if (line.startsWith('# ')) {
      renderedElements.push(
        <div key={`h1-${i}`} className="pt-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80 mb-2">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Hash className="w-3.5 h-3.5" />
            </span>
            <span>{line.substring(2).trim()}</span>
          </h1>
        </div>
      );
      continue;
    }

    // Heading 2: ## Heading
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 pt-2 pb-0.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          <span>{line.substring(3).trim()}</span>
        </h2>
      );
      continue;
    }

    // Heading 3: ### Heading
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-xs font-bold text-slate-700 dark:text-slate-200 pt-1.5 uppercase tracking-wide">
          {line.substring(4).trim()}
        </h3>
      );
      continue;
    }

    // Numbered list: 1. Item
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
          <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <span className="flex-1">{formatInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Bullet list: - Item or * Item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0 mt-1.5" />
          <span className="flex-1">{formatInline(line.substring(2).trim())}</span>
        </div>
      );
      continue;
    }

    // Blockquote: > Quote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <div key={`quote-${i}`} className="p-3 my-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-500 rounded-r-xl text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
          <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>{formatInline(line.substring(2).trim())}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Regular paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium my-1">
        {formatInline(line)}
      </p>
    );
  }

  return <div className={`space-y-1.5 ${className}`}>{renderedElements}</div>;
};

// Helper to format inline code, bold, italic
function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-700 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
