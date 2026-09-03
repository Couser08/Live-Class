import React from 'react';
import { Card } from '../common/Card';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const GeneralSettingsSection: React.FC = () => {
  const { defaultLanguage, defaultSessionMode, autoSave, updateSettings } = useSettingsStore();

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
        General Settings
      </h3>

      {/* Default Language */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Language</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Choose the language you teach most often.</p>
        </div>
        <select
          value={defaultLanguage}
          onChange={(e) => updateSettings({ defaultLanguage: e.target.value as any })}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="html">HTML</option>
          <option value="c">C Language</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      {/* Default Session Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Session Mode</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Choose how a new session starts.</p>
        </div>
        <select
          value={defaultSessionMode}
          onChange={(e) => updateSettings({ defaultSessionMode: e.target.value as any })}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="live-coding">Live Coding</option>
          <option value="qa">Interactive Q&A</option>
          <option value="assignment">Assignment Mode</option>
        </select>
      </div>

      {/* Auto Save Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto Save</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automatically save code and notes during session.</p>
        </div>
        <button
          onClick={() => updateSettings({ autoSave: !autoSave })}
          className={cn(
            'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
            autoSave ? 'bg-[#5551FF]' : 'bg-slate-300 dark:bg-slate-700'
          )}
        >
          <div
            className={cn(
              'w-4.5 h-4.5 rounded-full bg-white transition-transform absolute top-0.5',
              autoSave ? 'translate-x-5.5' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </Card>
  );
};
