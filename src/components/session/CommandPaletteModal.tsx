import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  Wand2,
  History,
  FileCode,
  Zap,
  Palette,
  Download,
} from 'lucide-react';
import { useCodeStore } from '../../stores/codeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    runCode,
    formatCurrentCode,
    setLanguage,
    toggleTimeline,
    toggleAutoRun,
    autoRun,
    activeLanguage,
    mentorCode,
  } = useCodeStore();

  const { updateSettings, theme } = useSettingsStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'cmd_run',
      category: 'Execution',
      title: 'Run Code in Live Preview / Terminal',
      shortcut: '⌘↵',
      icon: Play,
      action: () => {
        runCode();
        addToast({ type: 'success', title: 'Code Executed', description: 'Updated live output.' });
      },
    },
    {
      id: 'cmd_format',
      category: 'Editor',
      title: 'Format Document (Auto-indent)',
      shortcut: '⌥⇧F',
      icon: Wand2,
      action: () => {
        formatCurrentCode();
        addToast({ type: 'info', title: 'Formatted', description: 'Cleaned up indentation.' });
      },
    },
    {
      id: 'cmd_timeline',
      category: 'History',
      title: 'Toggle Keystroke History Timeline',
      shortcut: '⌘H',
      icon: History,
      action: () => toggleTimeline(),
    },
    {
      id: 'cmd_autorun',
      category: 'Execution',
      title: `Toggle Auto-Run on Typing (${autoRun ? 'Currently ON' : 'Currently OFF'})`,
      shortcut: '⌘R',
      icon: Zap,
      action: () => toggleAutoRun(),
    },
    {
      id: 'cmd_lang_html',
      category: 'Language',
      title: 'Switch to HTML Environment',
      shortcut: '',
      icon: FileCode,
      action: () => setLanguage('html'),
    },
    {
      id: 'cmd_lang_c',
      category: 'Language',
      title: 'Switch to C Language (GCC Simulator)',
      shortcut: '',
      icon: FileCode,
      action: () => setLanguage('c'),
    },
    {
      id: 'cmd_lang_js',
      category: 'Language',
      title: 'Switch to JavaScript Environment',
      shortcut: '',
      icon: FileCode,
      action: () => setLanguage('javascript'),
    },
    {
      id: 'cmd_export',
      category: 'File',
      title: 'Export Active Code to File',
      shortcut: '⌘S',
      icon: Download,
      action: () => {
        const ext = activeLanguage === 'html' ? 'html' : activeLanguage === 'c' ? 'c' : 'js';
        const blob = new Blob([mentorCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codebuddy_snippet.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        addToast({ type: 'success', title: 'Exported', description: `Saved codebuddy_snippet.${ext}` });
      },
    },
    {
      id: 'cmd_theme_dark',
      category: 'Appearance',
      title: 'Toggle Dark / Light Theme',
      shortcut: '⌘T',
      icon: Palette,
      action: () => {
        updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#131628] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filteredCommands.length > 0) {
                handleExecute(filteredCommands[0].action);
              }
            }}
            placeholder="Type a command or search actions... (e.g. Run, Format, Theme)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
          />
          <kbd className="hidden sm:inline font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleExecute(cmd.action)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-600/20 text-slate-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{cmd.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{cmd.category}</div>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-300">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
