import React, { useState, useRef, useEffect, useCallback } from 'react';
import { highlightCode } from '../../lib/shiki';
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
  const { editorFontSize, lineNumbers, autoCloseBrackets, highlightActiveLine, editorTheme } = useSettingsStore();
  const { currentSession, userRoleInSession, isSandboxMode, toggleSandboxMode, mentorCursorPos, setMentorCursor } = useSessionStore();

  const isMentor = userRoleInSession === 'mentor';
  const isReadOnly = !isMentor && !isSandboxMode;

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const fileLang: any = activeFile?.language || activeLanguage;

  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isSaved, setIsSaved] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Sync Shiki syntax highlighting
  useEffect(() => {
    let isMounted = true;
    highlightCode(mentorCode, fileLang, editorTheme).then((html) => {
      if (isMounted) setHighlightedHtml(html);
    });
    return () => {
      isMounted = false;
    };
  }, [mentorCode, fileLang, editorTheme]);

  // Ensure workspace language matches current session language
  useEffect(() => {
    if (currentSession?.language && useCodeStore.getState().activeLanguage !== currentSession.language) {
      useCodeStore.getState().setLanguage(currentSession.language);
    }
  }, [currentSession?.language]);

  // Real-time synchronization: Students listen to Mentor broadcasts
  useEffect(() => {
    if (!currentSession?.code) return;

    const unsubscribe = sessionService.subscribeToRoom(currentSession.code, {
      onCodeStream: (payload) => {
        // If student is following mentor, sync code immediately
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
  }, [currentSession?.code, isMentor, isSandboxMode]);

  // Handle scroll synchronization
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = (val: string, selectionStart: number) => {
    const linesUpToCursor = val.substring(0, selectionStart).split('\n');
    const newPos = {
      line: linesUpToCursor.length,
      col: linesUpToCursor[linesUpToCursor.length - 1].length + 1,
    };
    setCursorPos(newPos);

    // Mentor broadcasts cursor movement
    if (isMentor && currentSession?.code) {
      sessionService.broadcastCode(currentSession.code, {
        code: val,
        language: fileLang,
        cursorPos: newPos,
        timestamp: Date.now(),
      });
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isReadOnly) return; // Prevent student from editing during live follow mode

      const textarea = textareaRef.current;
      if (!textarea) return;

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

      // Tab key (2 spaces)
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = mentorCode.substring(0, start) + '  ' + mentorCode.substring(end);
        setMentorCode(newValue);

        if (isMentor && currentSession?.code) {
          sessionService.broadcastCode(currentSession.code, {
            code: newValue,
            language: fileLang,
            cursorPos: { line: cursorPos.line, col: cursorPos.col + 2 },
            timestamp: Date.now(),
          });
        }

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          updateCursorPosition(newValue, start + 2);
        }, 0);
        return;
      }

      // Auto-close brackets & quotes
      if (autoCloseBrackets) {
        const pairs: Record<string, string> = {
          '(': ')',
          '{': '}',
          '[': ']',
          '"': '"',
          "'": "'",
        };

        if (pairs[e.key]) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const closeChar = pairs[e.key];
          const newValue = mentorCode.substring(0, start) + e.key + closeChar + mentorCode.substring(end);

          e.preventDefault();
          setMentorCode(newValue);

          if (isMentor && currentSession?.code) {
            sessionService.broadcastCode(currentSession.code, {
              code: newValue,
              language: fileLang,
              cursorPos: { line: cursorPos.line, col: cursorPos.col + 1 },
              timestamp: Date.now(),
            });
          }

          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            updateCursorPosition(newValue, start + 1);
          }, 0);
          return;
        }
      }
    },
    [mentorCode, setMentorCode, runCode, formatCurrentCode, autoCloseBrackets, isReadOnly, isMentor, currentSession, fileLang, cursorPos]
  );

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;

    const val = e.target.value;
    setMentorCode(val);
    setIsSaved(false);
    updateCursorPosition(val, e.target.selectionStart);

    // Mentor broadcasts code edits in real-time
    if (isMentor && currentSession?.code) {
      sessionService.broadcastCode(currentSession.code, {
        code: val,
        language: fileLang,
        cursorPos: { line: cursorPos.line, col: cursorPos.col },
        timestamp: Date.now(),
      });
    }

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsSaved(true);
    }, 400);
  };

  const lines = mentorCode.split('\n');

  const getThemeBg = () => {
    switch (editorTheme) {
      case 'github-light':
        return 'bg-white border-slate-200';
      case 'dark-plus':
        return 'bg-[#1e1e1e] border-[#333]';
      case 'dracula':
        return 'bg-[#282a36] border-[#44475a]';
      default:
        return 'bg-[#111726] border-slate-800'; // high-contrast dark
    }
  };

  const themeClasses = getThemeBg();
  const effectiveActiveLine = isMentor ? cursorPos.line : mentorCursorPos.line;

  return (
    <div className={cn("flex-1 rounded-2xl shadow-xl flex flex-col overflow-hidden relative border", themeClasses)}>
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
              <span className="font-bold text-white">Live Following Mentor: {currentSession?.mentor?.name || 'Rahul Sharma'}</span>
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

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        {lineNumbers && (
          <div
            ref={gutterRef}
            className={cn(
              "w-11 py-3 text-right pr-3 font-mono text-[12px] leading-[22px] select-none overflow-hidden shrink-0 border-r",
              editorTheme === 'github-light'
                ? 'bg-slate-50 text-slate-400 border-slate-200'
                : 'bg-black/30 text-slate-500 border-white/5'
            )}
          >
            {lines.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-[22px] transition-colors',
                  effectiveActiveLine === i + 1
                    ? (editorTheme === 'github-light' ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold')
                    : ''
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

          {/* Synchronized Code Canvas */}
          <div className="flex-1 relative overflow-hidden bg-transparent">
            {/* Active Line Highlight Gutter */}
            {highlightActiveLine && (
              <div
                className="absolute left-0 right-0 bg-indigo-500/10 border-y border-indigo-500/25 pointer-events-none transition-all duration-75"
                style={{
                  top: `${(effectiveActiveLine - 1) * 22 + 12}px`,
                  height: '22px',
                }}
              />
            )}

            {/* Shiki Pre-wrap Syntax Layer */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className={cn(
                'absolute inset-0 overflow-hidden pointer-events-none select-none',
                editorTheme === 'github-light' ? 'text-slate-800' : 'text-slate-200'
              )}
              style={{
                fontFamily: 'Consolas, "Fira Code", "Courier New", Courier, monospace',
                fontSize: `${editorFontSize}px`,
                lineHeight: '22px',
                letterSpacing: '0px',
                wordSpacing: '0px',
                tabSize: 2,
                fontVariantLigatures: 'none',
                WebkitFontVariantLigatures: 'none',
                fontFeatureSettings: '"liga" 0, "calt" 0',
                padding: '12px',
                margin: 0,
                border: '0px solid transparent',
                boxSizing: 'border-box',
                whiteSpace: useSettingsStore.getState().wordWrap ? 'pre-wrap' : 'pre',
                wordBreak: useSettingsStore.getState().wordWrap ? 'break-all' : 'normal',
                overflowWrap: useSettingsStore.getState().wordWrap ? 'anywhere' : 'normal',
              }}
              dangerouslySetInnerHTML={{
                __html: highlightedHtml || `<code>${mentorCode}</code>`,
              }}
            />

            {/* Interactive Textarea Overlay */}
            <textarea
              ref={textareaRef}
              value={mentorCode}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              readOnly={isReadOnly}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className={cn(
                'absolute inset-0 w-full h-full overflow-auto bg-transparent text-transparent resize-none focus:outline-none focus:ring-0 z-10 selection:bg-indigo-500/35',
                isReadOnly ? 'cursor-default' : 'cursor-text',
                editorTheme === 'github-light' ? 'caret-black' : 'caret-white'
              )}
              style={{
                fontFamily: 'Consolas, "Fira Code", "Courier New", Courier, monospace',
                fontSize: `${editorFontSize}px`,
                lineHeight: '22px',
                letterSpacing: '0px',
                wordSpacing: '0px',
                tabSize: 2,
                fontVariantLigatures: 'none',
                WebkitFontVariantLigatures: 'none',
                fontFeatureSettings: '"liga" 0, "calt" 0',
                padding: '12px',
                margin: 0,
                border: '0px solid transparent',
                boxSizing: 'border-box',
                whiteSpace: useSettingsStore.getState().wordWrap ? 'pre-wrap' : 'pre',
                wordBreak: useSettingsStore.getState().wordWrap ? 'break-all' : 'normal',
                overflowWrap: useSettingsStore.getState().wordWrap ? 'anywhere' : 'normal',
              }}
            />
          </div>
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
