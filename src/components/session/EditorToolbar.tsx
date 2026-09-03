import React from 'react';
import { Code2, Folder, RotateCw, Play, Zap, GraduationCap, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useCodeStore } from '../../stores/codeStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { cn } from '../../lib/utils';

interface EditorToolbarProps {
  onRefreshPreview?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onRefreshPreview }) => {
  const { activeSessionTab, setActiveSessionTab, addToast } = useUIStore();
  const {
    activeLanguage,
    runCode,
    autoRun,
    toggleAutoRun,
  } = useCodeStore();
  const { user: authUser } = useAuthStore();
  const { userRoleInSession, currentUser, isSandboxMode } = useSessionStore();
  const isMentor = isMentorEmail(authUser?.email || currentUser?.email) || userRoleInSession === 'mentor';

  const fileName =
    activeLanguage === 'html' ? 'index.html' : activeLanguage === 'c' ? 'main.c' : 'script.js';

  const handleRunClick = () => {
    runCode();
    addToast({
      type: 'success',
      title: 'Code Executed',
      description: `Rendered ${activeLanguage.toUpperCase()} output in live preview.`,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 pt-1">
      {/* Left Workspace Mode Tabs */}
      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          onClick={() => setActiveSessionTab('editor')}
          className={cn(
            'inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98]',
            activeSessionTab === 'editor'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/60 shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs'
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        {/* Files Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveSessionTab(activeSessionTab === 'files' ? 'editor' : 'files')}
            className={cn(
              'inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98]',
              activeSessionTab === 'files'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/60 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs'
            )}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>

          {/* File Explorer Popup */}
          {activeSessionTab === 'files' && (
            <div className="absolute top-[110%] left-0 w-64 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Project Files</div>
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {useCodeStore.getState().files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      useCodeStore.getState().setActiveFile(file.id);
                      setActiveSessionTab('editor'); // Auto close on select
                    }}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors group',
                      useCodeStore.getState().activeFileId === file.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[14px]">
                        {file.language === 'html' ? '🌐' : file.language === 'c' ? '⚙️' : file.language === 'javascript' ? '⚡' : file.language === 'css' ? '🎨' : '📄'}
                      </span>
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                    {isMentor && useCodeStore.getState().files.length > 1 && (
                      <button
                        className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          useCodeStore.getState().closeFile(file.id);
                        }}
                        title="Close File"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isMentor && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    onClick={() => {
                      const name = prompt('Enter new file name:');
                      if (name) {
                        let lang: any = 'javascript';
                        if (name.endsWith('.html')) lang = 'html';
                        else if (name.endsWith('.c')) lang = 'c';
                        else if (name.endsWith('.css')) lang = 'css';
                        else if (name.endsWith('.md')) lang = 'markdown';
                        useCodeStore.getState().addNewFile(name, lang);
                      }
                    }}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>New File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active File Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 shadow-2xs min-h-[38px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{useCodeStore.getState().files.find(f => f.id === useCodeStore.getState().activeFileId)?.name || fileName}</span>
        </div>

        {/* Status Role Pill */}
        <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold min-h-[38px]">
          {isMentor ? (
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mentor Broadcaster</span>
            </span>
          ) : isSandboxMode ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
              <span>Local Sandbox</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Follower</span>
            </span>
          )}
        </div>
      </div>

      {/* Center / Right Execution Tools */}
      <div className="flex items-center gap-2">
        {/* Auto-run Toggle */}
        <button
          type="button"
          onClick={toggleAutoRun}
          className={cn(
            'inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer select-none',
            autoRun
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
          title="Toggle live execution on typing"
        >
          <Zap className={cn('w-3 h-3', autoRun ? 'fill-amber-500 text-amber-500' : 'text-slate-400')} />
          <span className="hidden sm:inline">Auto-Run</span>
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              autoRun ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
            )}
          />
        </button>

        {/* Primary Run Code Button */}
        <button
          type="button"
          onClick={handleRunClick}
          className="inline-flex items-center gap-1.5 min-h-[38px] bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer select-none"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Run Code</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
            ⌘↵
          </span>
        </button>

        {/* Refresh Preview */}
        <button
          type="button"
          onClick={onRefreshPreview}
          className="min-w-[38px] min-h-[38px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
          title="Reload preview"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
