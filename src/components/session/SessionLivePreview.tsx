import React, { useMemo } from 'react';
import { RotateCw, Lock, Terminal } from 'lucide-react';
import { useCodeStore } from '../../stores/codeStore';
import { executeCCode } from '../../lib/cInterpreter';

interface SessionLivePreviewProps {
  refreshKey?: number;
}

export const SessionLivePreview: React.FC<SessionLivePreviewProps> = ({ refreshKey = 0 }) => {
  const { executedFiles, activeLanguage, runCode } = useCodeStore();

  const cExecutionResult = useMemo(() => {
    if (activeLanguage === 'c') {
      const mainC = executedFiles['main.c'] || Object.values(executedFiles)[0] || '';
      return executeCCode(mainC, executedFiles);
    }
    return null;
  }, [executedFiles, activeLanguage, refreshKey]);

  const srcDoc = useMemo(() => {
    if (activeLanguage === 'html') {
      const htmlContent = executedFiles['index.html'] || '<!DOCTYPE html><html><body><h1>Hello, CodeBuddy!</h1></body></html>';
      const cssContent = executedFiles['style.css'] || '';
      const jsContent = executedFiles['script.js'] || '';

      // Cleanly link style.css and script.js into index.html
      let combinedDoc = htmlContent;

      // Replace <link rel="stylesheet" href="style.css" /> with inline style
      if (combinedDoc.includes('style.css')) {
        combinedDoc = combinedDoc.replace(
          /<link[^>]*href=["']style\.css["'][^>]*\/?>/gi,
          `<style>\n${cssContent}\n</style>`
        );
      } else {
        // Fallback: inject into head
        if (combinedDoc.includes('</head>')) {
          combinedDoc = combinedDoc.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
        } else {
          combinedDoc = `<style>\n${cssContent}\n</style>\n` + combinedDoc;
        }
      }

      // Replace <script src="script.js"></script> with inline script
      if (combinedDoc.includes('script.js')) {
        combinedDoc = combinedDoc.replace(
          /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
          `<script>\n${jsContent}\n</script>`
        );
      } else {
        // Fallback: inject before body end
        if (combinedDoc.includes('</body>')) {
          combinedDoc = combinedDoc.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
        } else {
          combinedDoc = combinedDoc + `\n<script>\n${jsContent}\n</script>`;
        }
      }

      return combinedDoc;
    }

    if (activeLanguage === 'javascript') {
      const jsCode = executedFiles['index.js'] || Object.values(executedFiles)[0] || '';
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      ${jsCode}
    } catch (e) {
      document.body.innerHTML += '<div style="color: #ef4444; font-family: monospace; padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; margin-top: 10px;">Runtime Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
    }

    return '';
  }, [executedFiles, activeLanguage, refreshKey]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* macOS Window Title Bar */}
      <div className="bg-[#F6F7FB]/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 select-none">
        {/* macOS Traffic Light Buttons */}
        <div className="flex items-center gap-2 group/traffic">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center cursor-pointer shadow-2xs">
            <span className="text-[7px] text-[#7F0000] opacity-0 group-hover/traffic:opacity-100 font-bold leading-none select-none">✕</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center cursor-pointer shadow-2xs">
            <span className="text-[7px] text-[#805000] opacity-0 group-hover/traffic:opacity-100 font-bold leading-none select-none">−</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center cursor-pointer shadow-2xs">
            <span className="text-[7px] text-[#006000] opacity-0 group-hover/traffic:opacity-100 font-bold leading-none select-none">+</span>
          </div>
        </div>

        {/* Safari / Terminal Address Bar Pill */}
        <div className="flex-1 max-w-[280px] mx-auto bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeLanguage === 'c' ? (
              <Terminal className="w-3 h-3 text-sky-500 shrink-0" />
            ) : (
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            )}
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
              {activeLanguage === 'html'
                ? 'codebuddy.live/index.html'
                : activeLanguage === 'c'
                ? 'gcc ./main.c -o ./main.out'
                : 'codebuddy.live/index.js'}
            </span>
          </div>
          <button
            type="button"
            onClick={runCode}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors shrink-0 ml-1"
            title="Re-run program"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        <div className="w-12 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeLanguage}</span>
        </div>
      </div>

      {/* Render Frame Canvas */}
      <div className="flex-1 bg-white dark:bg-[#0B0D1B] relative overflow-auto">
        {activeLanguage === 'c' && cExecutionResult ? (
          <div className="p-4 font-mono text-xs leading-relaxed h-full bg-[#0D1117] text-slate-200 overflow-auto">
            {/* Terminal Header */}
            <div className="text-slate-500 text-[11px] pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
              <span>[GCC v13.2 x86_64-linux-gnu] Output Terminal</span>
              <span>exit: {cExecutionResult.exitCode}</span>
            </div>

            {/* Error Diagnostics */}
            {cExecutionResult.hasErrors && cExecutionResult.errors && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-400 text-xs">
                {cExecutionResult.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}

            {/* Program Output */}
            <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-[12px] leading-5 m-0">
              {cExecutionResult.stdout || (cExecutionResult.hasErrors ? '' : '<Program completed with no stdout>')}
            </pre>

            {/* Terminal Execution Summary */}
            <div className="text-slate-500 text-[10px] mt-4 pt-2 border-t border-slate-800/80">
              Process finished with exit code {cExecutionResult.exitCode} (execution time: {cExecutionResult.executionTimeMs}ms)
            </div>
          </div>
        ) : (
          <iframe
            key={refreshKey}
            srcDoc={srcDoc}
            title="macOS Live DOM Output"
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full border-none min-h-[280px]"
          />
        )}
      </div>
    </div>
  );
};
