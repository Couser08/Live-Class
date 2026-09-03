import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useCodeStore } from '../../stores/codeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSessionStore } from '../../stores/sessionStore';
import { sessionService } from '../../services/sessionService';
import { EditorStatusBarPro } from './EditorStatusBarPro';
import { CommandPaletteModal } from './CommandPaletteModal';
import { Lock, Radio, FlaskConical, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export const InteractiveCodeEditor: React.FC = () => {
  const { mentorCode, setMentorCode, activeLanguage, files, activeFileId, runCode, formatCurrentCode } = useCodeStore();
  const { editorFontSize, lineNumbers, autoCloseBrackets, highlightActiveLine, editorTheme, tabSize } = useSettingsStore();
  const { currentSession, userRoleInSession, isSandboxMode, toggleSandboxMode, mentorCursorPos, setMentorCursor } = useSessionStore();

  const isMentor = userRoleInSession === 'mentor';
  const isReadOnly = !isMentor && !isSandboxMode;

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const fileLang: string = activeFile?.language || activeLanguage;

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isSaved, setIsSaved] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const saveTimerRef = useRef<number | null>(null);
  const broadcastTimerRef = useRef<number | null>(null);

  // Micro-throttled real-time broadcast to connected students (40ms)
  const broadcastLatestCode = useCallback((code: string, pos: { line: number; col: number }) => {
    if (!isMentor || !currentSession?.code) return;
    if (broadcastTimerRef.current) window.clearTimeout(broadcastTimerRef.current);
    broadcastTimerRef.current = window.setTimeout(() => {
      sessionService.broadcastCode(currentSession.code, {
        code,
        language: fileLang,
        cursorPos: pos,
        timestamp: Date.now(),
      });
    }, 40);
  }, [isMentor, currentSession?.code, fileLang]);

  // Code change dispatcher
  const handleCodeChange = useCallback((val: string) => {
    setMentorCode(val);
    setIsSaved(false);

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setIsSaved(true);
    }, 400);

    broadcastLatestCode(val, cursorPos);
  }, [setMentorCode, broadcastLatestCode, cursorPos]);

  // Language grammar extension selector
  const languageExtension = useMemo(() => {
    switch (fileLang.toLowerCase()) {
      case 'c':
      case 'cpp':
        return cpp();
      case 'html':
        return html();
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        return javascript();
      default:
        return cpp();
    }
  }, [fileLang]);

  // Custom typography & line-height styling extension
  const customThemeExtension = useMemo(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${editorFontSize}px`,
        fontFamily: 'Consolas, "Fira Code", "Courier New", Courier, monospace',
      },
      '.cm-scroller': {
        fontFamily: 'Consolas, "Fira Code", "Courier New", Courier, monospace',
        lineHeight: '22px',
        overflow: 'auto',
      },
      '.cm-content': {
        padding: '14px 0',
        caretColor: editorTheme === 'github-light' ? '#4f46e5' : '#a5b4fc',
      },
      '.cm-gutters': {
        backgroundColor: editorTheme === 'github-light' ? '#f8fafc' : 'rgba(0, 0, 0, 0.25)',
        color: editorTheme === 'github-light' ? '#94a3b8' : '#64748b',
        borderRight: editorTheme === 'github-light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '14px',
        fontSize: '12px',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: editorTheme === 'github-light' ? '#4f46e5' : '#818cf8',
        fontWeight: 'bold',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(99, 102, 241, 0.35) !important',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: editorTheme === 'github-light' ? '#4f46e5' : '#a5b4fc',
        borderLeftWidth: '2px',
      },
    });
  }, [editorFontSize, editorTheme]);

  // Combine extensions
  const extensions = useMemo(() => {
    return [languageExtension, customThemeExtension];
  }, [languageExtension, customThemeExtension]);

  // Global editor shortcuts (⌘K, ⌘↵, ⌥⇧F)
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    // ⌘K / Ctrl+K: Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen((prev) => !prev);
      return;
    }

    // ⌘↵ / Ctrl+Enter: Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
      return;
    }

    // ⌥⇧F / Alt+Shift+F: Format Code
    if ((e.altKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      formatCurrentCode();
      return;
    }
  };

  // Synchronize language template with session room
  useEffect(() => {
    if (currentSession?.language && useCodeStore.getState().activeLanguage !== currentSession.language) {
      useCodeStore.getState().setLanguage(currentSession.language);
    }
  }, [currentSession?.language]);

  // Real-time synchronization: Students follow mentor broadcast
  useEffect(() => {
    if (!currentSession?.code) return;

    const unsubscribe = sessionService.subscribeToRoom(currentSession.code, {
      onCodeStream: (payload) => {
        if (!isMentor && !isSandboxMode) {
          setMentorCode(payload.code);
          if (payload.cursorPos) {
            setMentorCursor(payload.cursorPos);
          }
        }
      },
      onChatMessage: () => {},
    });

    return unsubscribe;
  }, [currentSession?.code, isMentor, isSandboxMode, setMentorCode, setMentorCursor]);

  const getThemeBg = () => {
    switch (editorTheme) {
      case 'github-light':
        return 'bg-white border-slate-200';
      case 'dark-plus':
        return 'bg-[#1e1e1e] border-[#333]';
      case 'dracula':
        return 'bg-[#282a36] border-[#44475a]';
      default:
        return 'bg-[#111726] border-slate-800';
    }
  };

  const themeClasses = getThemeBg();

  return (
    <div
      onKeyDown={handleContainerKeyDown}
      className={cn("flex-1 rounded-2xl shadow-xl flex flex-col overflow-hidden relative border", themeClasses)}
    >
      {/* Role State Banner */}
      {!isMentor && (
        <div
          className={cn(
            "px-4 py-2 flex items-center justify-between text-xs font-semibold select-none border-b transition-colors",
            isSandboxMode
              ? "bg-amber-950/80 border-amber-800/80 text-amber-200"
              : "bg-indigo-950/80 border-indigo-800/80 text-indigo-200"
          )}
        >
          {isSandboxMode ? (
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">🧪 Personal Sandbox Mode</span>
              <span className="text-[11px] text-amber-300/80 hidden sm:inline">(Editing locally without affecting classroom)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <Lock className="w-3.5 h-3.5 text-indigo-300" />
              <span className="font-bold text-white">Live Following Mentor: {currentSession?.mentor?.name || 'Mentor'}</span>
              <span className="text-[11px] text-indigo-300/80 hidden sm:inline">(Editor is locked to live broadcast)</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleSandboxMode}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isSandboxMode ? (
              <>
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Follow Stream</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-3 h-3 text-amber-300" />
                <span>Switch to My Sandbox</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mentor Broadcast Banner */}
      {isMentor && (
        <div className="bg-emerald-950/60 border-b border-emerald-800/60 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-emerald-300 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Broadcasting Live Code</span>
            <span className="text-[10px] text-emerald-400/90 hidden sm:inline">(Connected students follow your keystrokes in real-time)</span>
          </div>
          <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-md font-mono">
            Room: {currentSession?.code}
          </span>
        </div>
      )}

      {/* Single-Layer Professional CodeMirror Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        <CodeMirror
          ref={editorRef}
          value={mentorCode}
          height="100%"
          theme={editorTheme === 'github-light' ? 'light' : oneDark}
          extensions={extensions}
          readOnly={isReadOnly}
          editable={!isReadOnly}
          onChange={(val) => {
            handleCodeChange(val);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onUpdate={(viewUpdate) => {
            if (viewUpdate.selectionSet) {
              const head = viewUpdate.state.selection.main.head;
              const line = viewUpdate.state.doc.lineAt(head);
              const newPos = { line: line.number, col: head - line.from + 1 };
              setCursorPos(newPos);
              broadcastLatestCode(mentorCode, newPos);
            }
          }}
          basicSetup={{
            lineNumbers: lineNumbers,
            highlightActiveLineGutter: highlightActiveLine,
            highlightActiveLine: highlightActiveLine,
            bracketMatching: true,
            closeBrackets: autoCloseBrackets,
            autocompletion: true,
            tabSize: tabSize || 2,
            indentOnInput: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
          }}
          className="h-full w-full"
        />
      </div>

      {/* Pro Status Bar */}
      <EditorStatusBarPro
        cursorPos={isMentor ? cursorPos : mentorCursorPos}
        isSaved={isSaved}
        isFocused={isFocused}
      />

      {/* Command Palette Modal (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
