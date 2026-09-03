import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCw,
  Lock,
  Terminal,
  History,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
} from 'lucide-react';
import { useCodeStore } from '../../stores/codeStore';
import { useAuthStore } from '../../stores/authStore';
import {
  executeCCodeViaPiston,
  saveCodeSubmission,
  getCodeSubmissionsHistory,
  PistonExecutionResult,
  CodeSubmissionRecord,
} from '../../services/pistonService';

interface SessionLivePreviewProps {
  refreshKey?: number;
}

export const SessionLivePreview: React.FC<SessionLivePreviewProps> = ({ refreshKey = 0 }) => {
  const { executedFiles, activeLanguage, runCode, setMentorCode } = useCodeStore();
  const { user } = useAuthStore();

  const [cResult, setCResult] = useState<PistonExecutionResult | null>(null);
  const [isRunningC, setIsRunningC] = useState(false);
  const [stdin, setStdin] = useState('');
  const [isStdinOpen, setIsStdinOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<CodeSubmissionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Reference to abort in-flight execution on rapid edits or unmount
  const executionTokenRef = useRef(0);

  // Trigger Piston GCC execution whenever executedFiles, refreshKey or stdin change for C
  useEffect(() => {
    if (activeLanguage !== 'c') {
      setCResult(null);
      return;
    }

    const mainC = executedFiles['main.c'] || Object.values(executedFiles)[0] || '';
    if (!mainC.trim()) return;

    const currentToken = ++executionTokenRef.current;
    setIsRunningC(true);

    executeCCodeViaPiston(mainC, executedFiles, stdin)
      .then((result) => {
        // Discard stale responses if user triggered another run
        if (currentToken !== executionTokenRef.current) return;
        setCResult(result);
        setIsRunningC(false);

        // Asynchronously persist execution record into Supabase
        saveCodeSubmission(mainC, stdin, result, user?.id);
      })
      .catch(() => {
        if (currentToken !== executionTokenRef.current) return;
        setIsRunningC(false);
      });
  }, [executedFiles, activeLanguage, refreshKey, user?.id]);

  // Load history from Supabase when drawer is opened
  const handleToggleHistory = async () => {
    const nextState = !isHistoryOpen;
    setIsHistoryOpen(nextState);

    if (nextState) {
      setIsLoadingHistory(true);
      const past = await getCodeSubmissionsHistory(user?.id);
      setHistoryList(past);
      setIsLoadingHistory(false);
    }
  };

  // Re-run with custom stdin input
  const handleExecuteWithStdin = () => {
    runCode();
  };

  const srcDoc = useMemo(() => {
    if (activeLanguage === 'html') {
      const htmlContent =
        executedFiles['index.html'] || '<!DOCTYPE html><html><body><h1>Hello, CodeBuddy!</h1></body></html>';
      const cssContent = executedFiles['style.css'] || '';
      const jsContent = executedFiles['script.js'] || '';

      let combinedDoc = htmlContent;
      if (combinedDoc.includes('style.css')) {
        combinedDoc = combinedDoc.replace(
          /<link[^>]*href=["']style\.css["'][^>]*\/?>/gi,
          `<style>\n${cssContent}\n</style>`
        );
      } else if (combinedDoc.includes('</head>')) {
        combinedDoc = combinedDoc.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
      } else {
        combinedDoc = `<style>\n${cssContent}\n</style>\n` + combinedDoc;
      }

      if (combinedDoc.includes('script.js')) {
        combinedDoc = combinedDoc.replace(
          /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
          `<script>\n${jsContent}\n</script>`
        );
      } else if (combinedDoc.includes('</body>')) {
        combinedDoc = combinedDoc.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
      } else {
        combinedDoc = combinedDoc + `\n<script>\n${jsContent}\n</script>`;
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
    <div className="flex-1 bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
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
        <div className="flex-1 max-w-[320px] mx-auto bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shadow-2xs">
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
                ? 'gcc-10.2 ./main.c -o out'
                : 'codebuddy.live/index.js'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {activeLanguage === 'c' && (
              <>
                {/* Stdin Toggle */}
                <button
                  type="button"
                  onClick={() => setIsStdinOpen(!isStdinOpen)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    isStdinOpen || stdin
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Toggle Program Standard Input (stdin)"
                >
                  stdin
                </button>

                {/* History Drawer Toggle */}
                <button
                  type="button"
                  onClick={handleToggleHistory}
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors ${
                    isHistoryOpen ? 'text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                  title="Submission History"
                >
                  <History className="w-3 h-3" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={runCode}
              disabled={isRunningC}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              title="Re-run program"
            >
              {isRunningC ? (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              ) : (
                <RotateCw className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <div className="w-16 text-right flex items-center justify-end gap-1.5">
          {activeLanguage === 'c' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              Piston
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeLanguage}</span>
        </div>
      </div>

      {/* Render Frame Canvas */}
      <div className="flex-1 bg-white dark:bg-[#0B0D1B] relative overflow-hidden flex flex-col">
        {activeLanguage === 'c' ? (
          <div className="flex-1 font-mono text-xs leading-relaxed bg-[#0D1117] text-slate-200 flex flex-col overflow-hidden relative">
            {/* Collapsible stdin panel */}
            {isStdinOpen && (
              <div className="p-3 bg-[#161B22] border-b border-slate-800 text-xs shrink-0 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300">Program Input (stdin for scanf / getchar):</span>
                  <div className="flex items-center gap-2">
                    {stdin && (
                      <button
                        type="button"
                        onClick={() => setStdin('')}
                        className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleExecuteWithStdin}
                      className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Run with Input</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here separated by spaces or newlines (e.g. 42 100)..."
                  rows={2}
                  className="w-full text-xs font-mono bg-[#0D1117] text-slate-200 border border-slate-700/80 rounded-lg p-2 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            )}

            {/* Run History Popover Drawer */}
            {isHistoryOpen && (
              <div className="absolute inset-x-0 top-0 max-h-[260px] bg-[#161B22] border-b border-slate-800 z-30 shadow-2xl overflow-y-auto p-3 animate-in slide-in-from-top-4 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recent C Submissions (Supabase)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Loading past submissions...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No past submissions recorded yet. Runs are saved automatically when logged in!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyList.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-[#0D1117] border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-slate-300">
                              {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              {item.execution_time_ms}ms • {item.status}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMentorCode(item.source_code);
                            setIsHistoryOpen(false);
                          }}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-800/60 cursor-pointer"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Terminal Main Canvas */}
            <div className="flex-1 p-4 overflow-auto flex flex-col justify-between">
              <div>
                {/* Terminal Header */}
                <div className="text-slate-500 text-[11px] pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>[Piston GCC v10.2.0 Linux Container] Output Terminal</span>
                    {isRunningC && (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        <span>Compiling...</span>
                      </span>
                    )}
                  </span>
                  <span>exit: {cResult ? cResult.exitCode : 0}</span>
                </div>

                {/* Compilation or Runtime Diagnostics */}
                {cResult && !cResult.success && (
                  <div className="mb-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono whitespace-pre-wrap">
                    <div className="text-rose-400 font-bold mb-1">
                      {cResult.stage === 'compile' ? 'GCC Compilation Diagnostic:' : 'Runtime Exception / Stderr:'}
                    </div>
                    {cResult.stderr || cResult.output}
                  </div>
                )}

                {/* Standard Output */}
                <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-[12px] leading-5 m-0">
                  {cResult?.stdout ||
                    (cResult && !cResult.success ? '' : isRunningC ? '' : '<Program completed with no stdout>')}
                </pre>
              </div>

              {/* Execution Summary Footer */}
              {cResult && (
                <div className="text-slate-500 text-[10px] mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span>
                    Process finished with exit code {cResult.exitCode} (time: {cResult.executionTimeMs}ms • engine:{' '}
                    {cResult.engine})
                  </span>
                  {stdin && <span className="text-indigo-400">stdin: &quot;{stdin}&quot;</span>}
                </div>
              )}
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
