import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Copy, Check, Sparkles, KeyRound, Hash, Link2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SupportedLanguage } from '../../types/session.types';
import { useSessionStore } from '../../stores/sessionStore';
import { useCodeStore } from '../../stores/codeStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useClipboard } from '../../hooks/useClipboard';

export const NewSessionModal: React.FC = () => {
  const { isNewSessionModalOpen, closeNewSessionModal, modalDefaultLanguage, addToast, setActiveNavTab } = useUIStore();
  const createSession = useSessionStore((state) => state.createSession);
  const { user, openAuthModal } = useAuthStore();
  const isMentor = user?.role === 'mentor';

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(modalDefaultLanguage);
  const [title, setTitle] = useState('');
  const [generatedSession, setGeneratedSession] = useState<{
    code: string;
    pin: string;
    url: string;
  } | null>(null);

  React.useEffect(() => {
    setSelectedLanguage(modalDefaultLanguage);
  }, [modalDefaultLanguage, isNewSessionModalOpen]);

  const { copy, hasCopied } = useClipboard();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const session = createSession(
      title || `${selectedLanguage.toUpperCase()} Mastery Live Classroom`,
      selectedLanguage,
      user || undefined
    );

    // Isolate workspace to the chosen language
    useCodeStore.getState().setLanguage(selectedLanguage);

    setGeneratedSession({
      code: session.code,
      pin: session.pin,
      url: session.shareableUrl,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    addToast({
      type: 'success',
      title: 'Live Classroom Ready!',
      description: `Room: ${session.code} | PIN: ${session.pin}`,
    });
  };

  const handleStartTeaching = () => {
    handleResetAndClose();
    setActiveNavTab('sessions');
  };

  const handleResetAndClose = () => {
    setGeneratedSession(null);
    setTitle('');
    closeNewSessionModal();
  };

  return (
    <Modal
      isOpen={isNewSessionModalOpen}
      onClose={handleResetAndClose}
      title={generatedSession ? 'Your Live Classroom is Ready! 🎉' : 'Start a New Live Session'}
      description={
        generatedSession
          ? 'Share these credentials with your students to connect instantly.'
          : 'Configure language and room security to begin live peer teaching.'
      }
    >
      {!generatedSession ? (
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {!isMentor && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>You are creating this room as <strong>{user?.name || 'Guest'}</strong>.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-900 cursor-pointer text-[11px]"
              >
                Sign in as Mentor
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master HTML5 & Semantic Elements"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Language
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'html', label: 'HTML', color: 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' },
                { id: 'c', label: 'C Language', color: 'border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400' },
                { id: 'javascript', label: 'JavaScript', color: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id as SupportedLanguage)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedLanguage === lang.id
                      ? `${lang.color} ring-2 ring-indigo-500 shadow-xs`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Real-time code broadcasting & line-by-line follower synchronization</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Protected with 4-digit PIN & unique 6-character Room Code</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAndClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Generate Classroom
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 pt-2">
          {/* Credentials Display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFD] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <Hash className="w-3.5 h-3.5" />
                <span>Room Code</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                {generatedSession.code}
              </div>
            </div>

            <div className="bg-[#F8FAFD] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Secret PIN</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-widest">
                {generatedSession.pin}
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                {generatedSession.url}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(generatedSession.url, '1-Click Invite Link Copied!')}
              icon={hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {hasCopied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>

          <Button fullWidth onClick={handleStartTeaching} size="md">
            Start Live Teaching Now
          </Button>
        </div>
      )}
    </Modal>
  );
};
