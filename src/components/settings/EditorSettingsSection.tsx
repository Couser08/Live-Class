import React from 'react';
import { Card } from '../common/Card';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const EditorSettingsSection: React.FC = () => {
  const {
    tabSize,
    wordWrap,
    lineNumbers,
    autoCloseBrackets,
    highlightActiveLine,
    updateSettings,
  } = useSettingsStore();

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
        Editor Settings
      </h3>

      {/* Tab Size */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tab Size</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Set the number of spaces per tab.</p>
        </div>
        <select
          value={tabSize}
          onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
          className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
        </select>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Word Wrap</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Wrap long lines in the editor.</p>
        </div>
        <button
          onClick={() => updateSettings({ wordWrap: !wordWrap })}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
            wordWrap ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs',
              wordWrap ? 'left-5.5' : 'left-0.5'
            )}
          />
        </button>
      </div>

      {/* Line Numbers */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Line Numbers</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Show line numbers in the editor.</p>
        </div>
        <button
          onClick={() => updateSettings({ lineNumbers: !lineNumbers })}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
            lineNumbers ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs',
              lineNumbers ? 'left-5.5' : 'left-0.5'
            )}
          />
        </button>
      </div>

      {/* Auto Close Brackets */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto Close Brackets</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatically close brackets, quotes, etc.</p>
        </div>
        <button
          onClick={() => updateSettings({ autoCloseBrackets: !autoCloseBrackets })}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
            autoCloseBrackets ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs',
              autoCloseBrackets ? 'left-5.5' : 'left-0.5'
            )}
          />
        </button>
      </div>

      {/* Highlight Active Line */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Highlight Active Line</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Highlight the current line in the editor.</p>
        </div>
        <button
          onClick={() => updateSettings({ highlightActiveLine: !highlightActiveLine })}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
            highlightActiveLine ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs',
              highlightActiveLine ? 'left-5.5' : 'left-0.5'
            )}
          />
        </button>
      </div>
    </Card>
  );
};
