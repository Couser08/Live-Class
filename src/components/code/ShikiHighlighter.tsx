import React, { useEffect, useState } from 'react';
import { highlightCode } from '../../lib/shiki';
import { cn } from '../../lib/utils';

interface ShikiHighlighterProps {
  code: string;
  language?: 'html' | 'c' | 'javascript';
  showLineNumbers?: boolean;
  className?: string;
  theme?: 'tokyo-night' | 'github-dark';
  highlightActiveLine?: number;
}

export const ShikiHighlighter: React.FC<ShikiHighlighterProps> = ({
  code,
  language = 'html',
  showLineNumbers = true,
  className,
  theme = 'tokyo-night',
}) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    highlightCode(code, language, theme)
      .then((html) => {
        if (isMounted) {
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code, language, theme]);

  const lines = code.split('\n');

  return (
    <div
      className={cn(
        'font-mono text-xs leading-relaxed overflow-x-auto relative flex select-text',
        className
      )}
    >
      {/* Line Numbers column */}
      {showLineNumbers && (
        <div className="select-none pr-3 pl-2 py-1 text-right text-slate-500/70 border-r border-slate-700/40 shrink-0">
          {lines.map((_, index) => (
            <div key={index} className="h-5">
              {index + 1}
            </div>
          ))}
        </div>
      )}

      {/* Code Area */}
      <div className="pl-3 py-1 flex-1 min-w-0">
        {isLoading ? (
          <pre className="text-slate-300 font-mono text-xs whitespace-pre">
            {code}
          </pre>
        ) : (
          <div
            className="[&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:overflow-visible [&_code]:font-mono [&_code]:text-xs text-slate-200"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>
    </div>
  );
};
