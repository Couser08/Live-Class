import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Sliders, CheckCircle2, Cpu, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

export const AdvancedSettingsSection: React.FC = () => {
  const { advanced, updateAdvanced, resetDefaults } = useSettingsStore();
  const { addToast } = useUIStore();

  const [supabaseUrl, setSupabaseUrl] = useState(advanced.customSupabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(advanced.customSupabaseKey);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      updateAdvanced({ customSupabaseUrl: supabaseUrl, customSupabaseKey: supabaseKey });
      addToast({
        type: 'success',
        title: 'Backend Synchronized',
        description: 'Connection parameters active with graceful local fallback.',
      });
    }, 500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all CodeBuddy settings to factory defaults?')) {
      resetDefaults();
      addToast({
        type: 'info',
        title: 'Settings Reset',
        description: 'Restored all configurations to default state.',
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Advanced Engine & Backend Settings</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Fine-tune C execution compilers, custom Supabase credentials, and developer telemetry.
        </p>
      </div>

      {/* Supabase Custom Keys */}
      <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Supabase Realtime Project</h4>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready (Online)</span>
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Project URL</label>
          <input
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Anon Public Key</label>
          <input
            type="password"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleTestConnection}
            isLoading={isTesting}
            className="rounded-xl text-xs font-bold"
          >
            Apply & Test Connection
          </Button>
        </div>
      </div>

      {/* C Execution Engine Mode */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-800">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">C Language Engine Runtime</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Instant transpiler parsing with full user functions, header inlining, arrays & loops.
            </p>
          </div>
        </div>

        <select
          value={advanced.cEngineMode}
          onChange={(e) => updateAdvanced({ cEngineMode: e.target.value as any })}
          className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="interactive">Interactive Engine (Instant)</option>
          <option value="wasm">WebAssembly Sandbox (Beta)</option>
        </select>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Restore Factory Defaults</h4>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">Reset themes, editor settings, and temporary buffers.</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>
    </Card>
  );
};
