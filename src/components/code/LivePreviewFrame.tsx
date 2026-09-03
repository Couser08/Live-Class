import React, { useMemo } from 'react';
import { RotateCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SupportedLanguage } from '../../types/session.types';

interface LivePreviewFrameProps {
  code: string;
  language: SupportedLanguage;
  className?: string;
  title?: string;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  code,
  language,
  className,
  title = 'Live Preview',
}) => {
  const srcDoc = useMemo(() => {
    if (language === 'html') {
      return code;
    }
    if (language === 'javascript') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; padding: 1rem; color: #1e293b; }
  </style>
</head>
<body>
  <div id="output"></div>
  <script>
    try {
      ${code}
    } catch (err) {
      document.body.innerHTML = '<div style="color: #ef4444; font-family: monospace;">Runtime Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
    }
    // C preview fallback
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'JetBrains Mono', monospace; background: #0f172a; color: #38bdf8; padding: 1rem; font-size: 13px; line-height: 1.5; }
    .log { color: #4ade80; }
  </style>
</head>
<body>
  <div style="color: #94a3b8; margin-bottom: 8px;">[GCC Output - Terminal]</div>
  <div class="log">Hello, World!</div>
  <div class="log">Welcome to C Programming 🚀</div>
  <div style="color: #64748b; margin-top: 12px;">Process exited with status 0</div>
</body>
</html>`;
  }, [code, language]);

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden',
        className
      )}
    >
      {/* Mock Browser Title Bar */}
      <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
        </div>

        {/* Mock URL bar */}
        <div className="flex-1 max-w-[140px] mx-2 bg-white rounded-md border border-slate-200/60 px-2 py-0.5 text-[10px] text-slate-400 text-center truncate">
          {title}
        </div>

        <RotateCw className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
      </div>

      {/* Frame container */}
      <div className="flex-1 bg-white relative">
        <iframe
          srcDoc={srcDoc}
          title="live-render"
          sandbox="allow-scripts"
          className="w-full h-full border-none min-h-[160px]"
        />
      </div>
    </div>
  );
};
