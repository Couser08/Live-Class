import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Radio, Plus, KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { SupportedLanguage, RoomSession } from '../../types/session.types';

export const SessionHub: React.FC = () => {
  const { activeSessionsList, currentUser, selectSession } = useSessionStore();
  const { user: authUser } = useAuthStore();
  const { openNewSessionModal, openJoinModal, addToast } = useUIStore();
  const [langFilter, setLangFilter] = useState<'all' | SupportedLanguage>('all');

  const isMentor = isMentorEmail(authUser?.email || currentUser?.email);

  const filteredSessions = activeSessionsList.filter(
    (s) => langFilter === 'all' || s.language === langFilter
  );

  const handleSelectRoom = (session: RoomSession) => {
    selectSession(session);
    addToast({
      type: 'success',
      title: `Connected to ${session.title}`,
      description: `Room Code: ${session.code} | Language: ${session.language.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-150 max-w-[1400px] mx-auto">
      {/* Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Classrooms Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Interactive Coding Classrooms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Select any active classroom below to resume live broadcasting or enter as a student. You can create multiple sessions and switch between them anytime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isMentor && (
              <Button
                onClick={() => openNewSessionModal()}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                className="rounded-xl px-5 py-3 font-bold"
              >
                Create Classroom
              </Button>
            )}
            <Button
              onClick={() => openJoinModal()}
              variant="outline"
              size="md"
              icon={<KeyRound className="w-4 h-4" />}
              className="rounded-xl px-5 py-3 font-bold"
            >
              Join with PIN
            </Button>
          </div>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setLangFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              langFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Classrooms ({activeSessionsList.length})
          </button>
          <button
            onClick={() => setLangFilter('html')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              langFilter === 'html'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setLangFilter('c')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              langFilter === 'c'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            C Language
          </button>
          <button
            onClick={() => setLangFilter('javascript')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              langFilter === 'javascript'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            JavaScript
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredSessions.length} active session{filteredSessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Classrooms Grid or Empty State */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <Radio className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Classrooms Running
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {isMentor
                ? 'You do not have any active live classrooms right now. Click below to start teaching.'
                : 'No live classrooms currently active. Ask your mentor for a room code or PIN.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {isMentor ? (
              <Button
                onClick={() => openNewSessionModal()}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                className="rounded-xl px-5 py-2.5 font-bold"
              >
                Create Classroom
              </Button>
            ) : (
              <Button
                onClick={() => openJoinModal()}
                variant="primary"
                size="sm"
                icon={<KeyRound className="w-4 h-4" />}
                className="rounded-xl px-5 py-2.5 font-bold"
              >
                Join Classroom
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.08)] transition-all duration-200 group"
            >
              <div className="space-y-3.5">
                {/* Header: Language & Live status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-[#4F46E5] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                    {session.language}
                  </span>
                  <Badge variant="live" pulse>
                    Live
                  </Badge>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal leading-relaxed">
                    {session.description || `Interactive ${session.language.toUpperCase()} classroom broadcast`}
                  </p>
                </div>

                {/* Room Credentials Pills */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Room Code</span>
                    <span className="font-mono font-bold text-[#4F46E5] dark:text-indigo-400">{session.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">PIN</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{session.pin}</span>
                  </div>
                </div>

                {/* Mentor / Author */}
                <div className="flex items-center gap-2.5 pt-1">
                  <Avatar
                    src={session.mentor?.avatarUrl}
                    name={session.mentor?.name || 'Mentor'}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {session.mentor?.name || 'Rahul Sharma'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Mentor</span>
                  </div>
                </div>
              </div>

              {/* Enter Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Button
                  onClick={() => handleSelectRoom(session)}
                  variant="primary"
                  size="md"
                  fullWidth
                  className="rounded-xl py-2.5 text-xs font-bold"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Classroom
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
