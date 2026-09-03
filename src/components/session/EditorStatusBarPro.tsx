import React from 'react';
import { Check, Sparkles, Wand2, Play } from 'lucide-react';
import { useCodeStore } from '../../stores/codeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

interface EditorStatusBarProProps {
  cursorPos: { line: number; col: number };
  isSaved: boolean;
  isFocused: boolean;
}

export const EditorStatusBarPro: React.FC<EditorStatusBarProProps> = ({
  cursorPos,
  isSaved,
  isFocused,
}) => {
  const { activeLanguage, runCode, formatCurrentCode } = useCodeStore();
  const editorTheme = useSettingsStore((state) => state.editorTheme);
  const isLight = editorTheme === 'github-light';

  return (
    <div className={cn(
      "px-3.5 py-1.5 border-t flex items-center justify-between text-[11px] font-mono select-none overflow-x-auto gap-4",
      isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-[#0A0D18] border-slate-800 text-slate-400"
    )}>
      {/* Cluster 1: System & Diagnostics */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <Check className={cn('w-3.5 h-3.5', isSaved ? 'text-emerald-400' : 'text-amber-400')} />
          <span className={isSaved ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
            {isSaved ? 'Saved' : 'Saving...'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>⚡ 12ms sync</span>
        </div>

        {isFocused && (
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-indigo-300">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Editing Live</span>
          </span>
        )}
      </div>

      {/* Cluster 2: Document Metrics */}
      <div className="hidden lg:flex items-center gap-3 text-slate-500 shrink-0">
        <span>UTF-8</span>
        <span>LF</span>
        <span>0 selected</span>
      </div>

      {/* Cluster 3: Cursor, Formatting & Actions */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        <span className={cn("font-medium", isLight ? "text-slate-700" : "text-slate-300")}>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>

        <span className="hidden sm:inline">Spaces: 2</span>

        <button
          type="button"
          onClick={formatCurrentCode}
          className={cn(
            "hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer",
            isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          )}
          title="Format Code (⌥⇧F)"
        >
          <Wand2 className="w-3 h-3 text-indigo-500" />
          <span>Format</span>
        </button>

        <span className={cn(
          "uppercase font-bold px-1.5 py-0.5 rounded border",
          isLight ? "text-indigo-700 bg-indigo-50 border-indigo-200" : "text-indigo-300 bg-indigo-950/60 border-indigo-800/50"
        )}>
          {activeLanguage}
        </span>

        <button
          type="button"
          onClick={runCode}
          className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all shadow-xs"
        >
          <Play className="w-2.5 h-2.5 fill-white" />
          <span>Run (⌘↵)</span>
        </button>
      </div>
    </div>
  );
};
