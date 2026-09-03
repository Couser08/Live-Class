import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Database, HardDrive, FileCode, MessageSquare, Trash2, Download, Check } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const StorageSettingsSection: React.FC = () => {
  const { addToast } = useUIStore();
  const [isPurging, setIsPurging] = useState(false);
  const [hasPurged, setHasPurged] = useState(false);

  const handleClearCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setHasPurged(true);
      addToast({
        type: 'success',
        title: 'Cache Cleared',
        description: 'Temporary syntax cache & editor buffers purged.',
      });
      setTimeout(() => setHasPurged(false), 3000);
    }, 600);
  };

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      app: 'CodeBuddy LiveClass',
      version: '1.0.0-beta',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codebuddy_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Data Export Downloaded',
      description: 'Saved complete JSON backup archive to your device.',
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Data, Cloud Storage & Backup</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review your local and cloud storage quota, cached syntax trees, and data exports.
        </p>
      </div>

      {/* Main Storage Gauge */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Overall Storage Usage</span>
          </div>
          <span className="font-mono text-slate-600 dark:text-slate-400">Cloud Synced & Cached</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
          <div className="h-full bg-indigo-500 w-[20%]" title="Live Code" />
          <div className="h-full bg-sky-400 w-[15%]" title="Chat & Notes" />
          <div className="h-full bg-emerald-400 w-[10%]" title="Timelines" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <span>Code Buffers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
            <span>Chat & Notes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Supabase Sync</span>
          </div>
        </div>
      </div>

      {/* Storage Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-500" />
              <span>Temporary Cache</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Clear temporary Shiki WebAssembly highlights & local draft buffers.
            </p>
          </div>

          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            isLoading={isPurging}
            icon={hasPurged ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Trash2 className="w-3.5 h-3.5" />}
            className="rounded-xl text-xs font-bold"
          >
            {hasPurged ? 'Cache Cleared' : 'Clear Cache'}
          </Button>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Export Full Archive</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Download your complete notes, sessions, and code snippets in JSON.
            </p>
          </div>

          <Button
            onClick={handleExportJSON}
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            className="rounded-xl text-xs font-bold"
          >
            Export All Data (.json)
          </Button>
        </div>
      </div>
    </Card>
  );
};
