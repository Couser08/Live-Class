import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  FileText,
  HelpCircle,
  Smile,
  Copy,
  Download,
  Eye,
  Edit3,
  Check,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { sessionService, ChatMessageItem } from '../../services/sessionService';
import { Avatar } from '../common/Avatar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cn } from '../../lib/utils';
import { useClipboard } from '../../hooks/useClipboard';

export const SessionChatPanel: React.FC = () => {
  const { currentSession, currentUser, userRoleInSession, mentorCursorPos } = useSessionStore();
  const { user: authUser } = useAuthStore();
  const { addToast } = useUIStore();
  const { copy, hasCopied } = useClipboard();

  const activeUser = authUser || currentUser;
  const isMentor = isMentorEmail(activeUser?.email) || userRoleInSession === 'mentor';

  const [bottomPanelTab, setBottomPanelTab] = useState<'chat' | 'notes'>('chat');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Markdown Notes State
  const defaultInitialNotes = `# ${currentSession?.title || 'Live Coding Class'} Notes
## Core Concepts
- Real-time synchronized learning
- Interactive compiler & live execution

1. Understand the problem statement
2. Plan the algorithm & edge cases
3. Write clean, modular code

> Pro Tip: Test with edge cases before concluding!
`;

  const [notesContent, setNotesContent] = useState<string>(() => {
    if (typeof window !== 'undefined' && currentSession?.code) {
      return localStorage.getItem(`cb_notes_${currentSession.code}`) || defaultInitialNotes;
    }
    return defaultInitialNotes;
  });
  const [isNotesPreview, setIsNotesPreview] = useState(false);

  const sessionId = currentSession?.id || 'active_session';

  // Load chat messages and listen to broadcast
  useEffect(() => {
    sessionService.getMessages(sessionId).then((data) => setMessages(data));

    if (currentSession?.code) {
      const unsubscribe = sessionService.subscribeToRoom(currentSession.code, {
        onChatMessage: (newMsg) => {
          // Check for notes sync broadcast
          if (newMsg.content?.startsWith('__NOTES_SYNC__:')) {
            const rawNotes = newMsg.content.replace('__NOTES_SYNC__:', '');
            setNotesContent(rawNotes);
            return;
          }

          // Deduplicate messages so user never sees duplicate bubbles!
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      });
      return unsubscribe;
    }
  }, [sessionId, currentSession?.code]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: ChatMessageItem = {
      id: msgId,
      sessionId,
      senderName: `${activeUser.name}${isMentor ? ' (Mentor)' : ' (Student)'}`,
      senderRole: isMentor ? 'mentor' : 'student',
      senderAvatar: activeUser.avatarUrl,
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHighlighted: isMentor,
    };

    // Add locally
    setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));

    // Persist to Supabase and local storage
    sessionService.sendMessage(newMsg);

    // Broadcast message cross-tab / supabase realtime
    if (currentSession?.code) {
      sessionService.broadcastMessage(currentSession.code, newMsg);
    }
  };

  const handleAskOnLine = () => {
    const line = mentorCursorPos?.line || 1;
    setInputValue(`[Line ${line}]: `);
    setBottomPanelTab('chat');
  };

  const addEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Markdown Notes Format Helpers
  const insertMarkdown = (snippet: string) => {
    setNotesContent((prev) => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
  };

  const handleNotesChange = (text: string) => {
    setNotesContent(text);
    if (currentSession?.code) {
      localStorage.setItem(`cb_notes_${currentSession.code}`, text);

      // Broadcast notes update in real-time to student screens!
      sessionService.broadcastMessage(currentSession.code, {
        id: `notes_${Date.now()}`,
        sessionId,
        senderName: 'System',
        senderRole: 'mentor',
        content: `__NOTES_SYNC__:${text}`,
        createdAt: 'Now',
      });
    }
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notesContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession?.title || 'Classroom'}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Notes Downloaded',
      description: 'Saved as markdown (.md) file.',
    });
  };

  return (
    <div className="bg-white dark:bg-[#111726] h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111726]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setBottomPanelTab('chat')}
            className={cn(
              'flex items-center gap-1.5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer',
              bottomPanelTab === 'chat'
                ? 'border-[#5551FF] text-[#5551FF] dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>

          <button
            onClick={() => setBottomPanelTab('notes')}
            className={cn(
              'flex items-center gap-1.5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer',
              bottomPanelTab === 'notes'
                ? 'border-[#5551FF] text-[#5551FF] dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Notes</span>
          </button>
        </div>

        {/* Ask Question on Line button for Students */}
        {!isMentor && (
          <button
            type="button"
            onClick={handleAskOnLine}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
            title="Ask on mentor line"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Line {mentorCursorPos?.line || 1}</span>
          </button>
        )}
      </div>

      {bottomPanelTab === 'chat' ? (
        <>
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Classroom Chat</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
                  Say hello or ask questions anytime during the broadcast.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.createdAt}</span>
                    </div>
                    <div
                      className={cn(
                        'mt-1 p-2.5 rounded-2xl text-xs inline-block leading-relaxed max-w-full break-words border',
                        msg.isHighlighted
                          ? 'bg-[#F4F5FF] dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100 font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-[#111726]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question or send a message..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Choose emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {isEmojiPickerOpen && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex gap-1 z-20">
                  {['👍', '🚀', '🔥', '💡', '🙌', '🎉'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        </>
      ) : (
        /* Notes Tab Content */
        <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-3">
          {/* Notes Toolbar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {isMentor && (
                <button
                  type="button"
                  onClick={() => setIsNotesPreview(!isNotesPreview)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {isNotesPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{isNotesPreview ? 'Edit Raw .md' : 'Preview Design'}</span>
                </button>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isMentor ? (isNotesPreview ? 'Formatted Preview' : 'Markdown Editor') : 'Live Notes'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => copy(notesContent, 'Notes copied to clipboard!')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                title="Copy markdown content"
              >
                {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadNotes}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Download as .md file"
              >
                <Download className="w-3 h-3" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          {/* Quick Syntax Insertion Buttons (Mentor Only in Edit Mode) */}
          {isMentor && !isNotesPreview && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => insertMarkdown('# Heading 1\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                # H1
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('## Section Title\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                ## H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- Bullet point\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                - List
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('1. Numbered step\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```c\n// Code snippet\n```\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                ``` Code
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('> Important note or takeaway\n')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                &gt; Quote
              </button>
            </div>
          )}

          {/* Notes Body: Editor for Mentor, or Rendered View */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isMentor && !isNotesPreview ? (
              <textarea
                value={notesContent}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write classroom notes in Markdown format..."
                className="w-full h-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />
            ) : (
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <MarkdownRenderer content={notesContent} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
