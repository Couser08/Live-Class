import React, { useState } from 'react';
import { LogIn, KeyRound, Hash, GraduationCap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const JoinSessionModal: React.FC = () => {
  const { isJoinModalOpen, closeJoinModal, setActiveNavTab, addToast, joinModalPrefillCode } = useUIStore();
  const { joinSession } = useSessionStore();
  const { user } = useAuthStore();

  const [roomCode, setRoomCode] = useState(joinModalPrefillCode || '');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (joinModalPrefillCode) {
      setRoomCode(joinModalPrefillCode);
    }
  }, [joinModalPrefillCode, isJoinModalOpen]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !pin.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        description: 'Please enter both Room Code and 4-digit PIN.',
      });
      return;
    }

    setIsSubmitting(true);
    const res = await joinSession(roomCode, pin, user || undefined);
    setIsSubmitting(false);

    if (res.success) {
      const isMentor = res.role === 'mentor';
      addToast({
        type: 'success',
        title: isMentor ? 'Joined as Mentor!' : 'Joined Live Classroom as Student!',
        description: isMentor
          ? `Broadcasting controls active for ${roomCode.toUpperCase()}`
          : `Live following mentor stream in ${roomCode.toUpperCase()}`,
      });
      closeJoinModal();
      setActiveNavTab('sessions');
    } else {
      addToast({
        type: 'error',
        title: 'Cannot Join Classroom',
        description: res.error || 'Please verify the room code and 4-digit PIN.',
      });
    }
  };

  return (
    <Modal
      isOpen={isJoinModalOpen}
      onClose={closeJoinModal}
      title="Join a Live Classroom"
      description="Enter the 6-character Room Code and 4-digit PIN provided by your mentor."
    >
      <form onSubmit={handleJoin} className="space-y-4 pt-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
          <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Joining as: <strong className="text-slate-900 dark:text-white">{user?.name || 'Student'}</strong> ({user?.role === 'mentor' ? 'Mentor' : 'Student Mode'})</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Room Code
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. CB-8821"
              maxLength={7}
              className="w-full text-xs font-mono pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            4-Digit PIN
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={4}
              className="w-full text-xs font-mono pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeJoinModal}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            icon={<LogIn className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Verifying...' : 'Connect to Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
