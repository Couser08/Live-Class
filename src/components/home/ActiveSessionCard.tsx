import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore } from '../../stores/uiStore';
import { isMentorEmail } from '../../stores/authStore';

export const ActiveSessionCard: React.FC = () => {
  const activeSession = useSessionStore((state) => state.activeSessionCardData);
  const currentUser = useSessionStore((state) => state.currentUser);
  const { setActiveNavTab, openNewSessionModal, openJoinModal, addToast } = useUIStore();

  const isMentor = isMentorEmail(currentUser.email) || currentUser.role === 'mentor';

  if (!activeSession) {
    return (
      <Card className="p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Active Classroom
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Idle
          </span>
        </div>

        <div className="text-center py-4 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No live room currently attached
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px] mx-auto">
            {isMentor ? 'Launch a live session to broadcast code to your learners.' : 'Enter a room code & PIN to follow your mentor.'}
          </p>
        </div>

        <Button
          onClick={() => (isMentor ? openNewSessionModal() : openJoinModal())}
          variant="primary"
          size="md"
          fullWidth
          icon={<Plus className="w-4 h-4" />}
          className="rounded-xl py-2.5 text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs border-0 cursor-pointer"
        >
          {isMentor ? 'Create Live Classroom' : 'Join a Classroom'}
        </Button>
      </Card>
    );
  }

  const handleGoToSession = () => {
    setActiveNavTab('sessions');
    addToast({
      type: 'success',
      title: `Connected to ${activeSession.language.toUpperCase()} Session`,
      description: `Room Code: ${activeSession.code} | PIN: ${activeSession.pin}`,
    });
  };

  const learner = activeSession.activeLearners?.[0] || {
    name: 'Student Learner',
    isOnline: true,
    statusText: 'Connected to live stream',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <Card className="p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Active Classroom
        </h3>
        <Badge variant="live" pulse>
          Live
        </Badge>
      </div>

      {/* Language & Code */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Language</span>
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono mt-0.5">
            {activeSession.language}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Room Code</span>
          <div className="text-xs font-mono font-bold text-[#4F46E5] dark:text-indigo-400 mt-0.5">
            {activeSession.code}
          </div>
        </div>
      </div>

      {/* Peer Info */}
      <div className="flex items-center gap-2.5">
        <Avatar
          src={isMentor ? learner.avatarUrl : activeSession.mentor?.avatarUrl}
          name={isMentor ? learner.name : activeSession.mentor?.name || 'Mentor'}
          isOnline={true}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {isMentor ? learner.name : activeSession.mentor?.name || 'Mentor'}
            </h4>
            {isMentor ? (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Student
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Mentor
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {activeSession.title || 'Live Coding Session'}
          </p>
        </div>
      </div>

      {/* Button */}
      <div className="pt-1">
        <Button
          onClick={handleGoToSession}
          variant="primary"
          size="md"
          fullWidth
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          className="rounded-xl py-2.5 text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs border-0 cursor-pointer"
        >
          Open Classroom
        </Button>
      </div>
    </Card>
  );
};
