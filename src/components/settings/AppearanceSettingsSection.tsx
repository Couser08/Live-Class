import React from 'react';
import { Card } from '../common/Card';
import { Check } from 'lucide-react';
import { useSettingsStore, AccentColor } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const AppearanceSettingsSection: React.FC = () => {
  const { theme, accentColor, editorTheme, editorFontFamily, editorFontSize, updateSettings } = useSettingsStore();

  const accentColors: { id: AccentColor; bg: string }[] = [
    { id: 'indigo', bg: 'bg-[#6366F1]' },
    { id: 'blue', bg: 'bg-[#3B82F6]' },
    { id: 'emerald', bg: 'bg-[#10B981]' },
    { id: 'orange', bg: 'bg-[#F97316]' },
    { id: 'pink', bg: 'bg-[#EC4899]' },
  ];

  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.min(22, Math.max(11, editorFontSize + delta));
    updateSettings({ editorFontSize: nextSize });
  };

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
        Appearance
      </h3>

      {/* Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Theme</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Choose your preferred theme.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              theme === 'light' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Light
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              theme === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Dark
          </button>
          <button
            onClick={() => updateSettings({ theme: 'system' })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            System
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Accent Color</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Personalize CodeBuddy with your favorite color.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => updateSettings({ accentColor: color.id })}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs',
                color.bg,
                accentColor === color.id ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''
              )}
            >
              {accentColor === color.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Editor Theme</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Change the code editor color theme.</p>
        </div>
        <select
          value={editorTheme || 'tokyo-night'}
          onChange={(e) => updateSettings({ editorTheme: e.target.value as any })}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="dark-plus">VS Code Dark</option>
          <option value="github-light">GitHub Light</option>
          <option value="dracula">Dracula</option>
          <option value="tokyo-night">Tokyo Night</option>
        </select>
      </div>

      {/* Editor Font Family */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Font Family (Editor)</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Change the font used in the code editor.</p>
        </div>
        <select
          value={editorFontFamily}
          onChange={(e) => updateSettings({ editorFontFamily: e.target.value as any })}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="JetBrains Mono">JetBrains Mono</option>
          <option value="Fira Code">Fira Code</option>
          <option value="Source Code Pro">Source Code Pro</option>
          <option value="Consolas">Consolas</option>
          <option value="Ubuntu Mono">Ubuntu Mono</option>
          <option value="Space Mono">Space Mono</option>
        </select>
      </div>

      {/* Editor Font Size Stepper */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Font Size (Editor)</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Adjust the code editor font size.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => handleFontSizeChange(-1)}
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 shadow-2xs flex items-center justify-center cursor-pointer"
          >
            A-
          </button>
          <span className="w-12 text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {editorFontSize}px
          </span>
          <button
            onClick={() => handleFontSizeChange(1)}
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 shadow-2xs flex items-center justify-center cursor-pointer"
          >
            A+
          </button>
        </div>
      </div>
    </Card>
  );
};
