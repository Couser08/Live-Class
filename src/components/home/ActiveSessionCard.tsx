import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Radio, Plus } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore } from '../../stores/uiStore';
import { isMentorEmail } from '../../stores/authStore';

export const ActiveSessionCard: React.FC = () => {
  const activeSession = useSessionStore((state) => state.activeSessionCardData);
  const currentUser = useSessionStore((state) => state.currentUser);
  const { setActiveNavTab, openNewSessionModal, openJoinModal, addToast } = useUIStore();

  const isMentor = isMentorEmail(currentUser.email);

  if (!activeSession) {
    return (
      <Card className="p-5 flex flex-col justify-between space-y-4 border-dashed border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
            Active Classroom
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Offline</span>
        </div>

        <div className="text-center py-4 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Radio className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active room right now</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isMentor ? 'Launch a live session to teach students.' : 'Join an ongoing live class with your code.'}
          </p>
        </div>

        <Button
          onClick={() => (isMentor ? openNewSessionModal() : openJoinModal())}
          variant={isMentor ? 'primary' : 'soft-purple'}
          size="sm"
          fullWidth
          icon={<Plus className="w-4 h-4" />}
          className="rounded-xl py-2.5 text-xs font-bold"
        >
          {isMentor ? 'Create Classroom' : 'Join Classroom'}
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
    name: 'Learner waiting...',
    isOnline: true,
    statusText: 'Waiting for student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <Card className="p-5 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
          Active Session
        </h3>
        <Badge variant="live" pulse>
          Live
        </Badge>
      </div>

      {/* Language Section */}
      <div>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Language</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 tracking-wide uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
            {activeSession.language}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {activeSession.code}
          </span>
        </div>
      </div>

      {/* Session with Section */}
      <div>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {isMentor ? 'Student' : 'Mentor'}
        </p>
        <div className="flex items-center gap-2.5 mt-1.5">
          <Avatar
            src={isMentor ? learner.avatarUrl : activeSession.mentor?.avatarUrl}
            name={isMentor ? learner.name : activeSession.mentor?.name || 'Mentor'}
            isOnline={true}
            size="sm"
          />
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {isMentor ? learner.name : activeSession.mentor?.name || 'Mentor'}
            </h4>
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Online</p>
          </div>
        </div>
      </div>

      {/* Started at */}
      <div>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Started at</p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
          {activeSession.createdAt || 'Active Now'}
        </p>
      </div>

      {/* Go to Session Button */}
      <div className="pt-2">
        <Button
          onClick={handleGoToSession}
          variant="soft-purple"
          size="md"
          fullWidth
          className="rounded-xl py-2.5 text-xs font-bold"
        >
          Go to Session
        </Button>
      </div>
    </Card>
  );
};
