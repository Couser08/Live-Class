import React, { useState } from 'react';
import {
  ArrowLeft,
  UserPlus,
  Link2,
  StopCircle,
  Check,
  LogOut,
  ShieldCheck,
  GraduationCap,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useUIStore } from '../../stores/uiStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { useChallengeStore } from '../../stores/challengeStore';
import { useClipboard } from '../../hooks/useClipboard';
import { sessionService } from '../../services/sessionService';
import { CreateChallengeModal } from '../challenge/CreateChallengeModal';
import { StudentChallengeModal } from '../challenge/StudentChallengeModal';
import { MentorGradingModal } from '../challenge/MentorGradingModal';
import { cn } from '../../lib/utils';

export const SessionHeader: React.FC = () => {
  const { addToast, openNewSessionModal } = useUIStore();
  const { user: authUser } = useAuthStore();
  const {
    currentSession,
    currentUser,
    endSession,
    leaveSession,
    userRoleInSession,
    activeSessionsList,
    selectSession,
    connectedStudents,
    addConnectedStudent,
    setConnectedStudents,
  } = useSessionStore();
  const { copy, hasCopied } = useClipboard();

  const isMentor = isMentorEmail(authUser?.email || currentUser?.email) || userRoleInSession === 'mentor';
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const {
    activeChallenge,
    submissions,
    mySubmission,
    setActiveChallenge,
    setSubmissions,
    addOrUpdateSubmission,
    setMySubmission,
    openCreateModal,
    openGradingModal,
    openStudentSandbox,
    endChallengeLocal,
  } = useChallengeStore();

  const activeUser = authUser || currentUser;

  // Sync and listen for students reaching the room and challenges in real time
  React.useEffect(() => {
    if (!currentSession?.code) return;

    // Load initially reached students from local cache
    const initialList = sessionService.getConnectedStudents(currentSession.code);
    if (initialList.length > 0) {
      setConnectedStudents(initialList);
    }

    // Load active challenge and submissions
    const existingChallenge = sessionService.getActiveChallenge(currentSession.code);
    if (existingChallenge) {
      setActiveChallenge(existingChallenge);
    }
    const existingSubs = sessionService.getChallengeSubmissions(currentSession.code);
    if (existingSubs.length > 0) {
      setSubmissions(existingSubs);
      const mySub = existingSubs.find((s) => s.studentId === activeUser?.id);
      if (mySub) setMySubmission(mySub);
    }

    // If current user is a student, announce reach to mentor
    if (!isMentor && activeUser) {
      sessionService.broadcastStudentReached(currentSession.code, activeUser);
    }

    const unsubscribe = sessionService.subscribeToRoom(currentSession.code, {
      onStudentReached: (student) => {
        addConnectedStudent(student);
        if (isMentor) {
          addToast({
            type: 'success',
            title: 'Student Reached Live!',
            description: `${student.name} is now connected live to this classroom.`,
          });
        }
      },
      onPresenceSync: (students) => {
        setConnectedStudents(students);
      },
      onChallengeLaunched: (challenge) => {
        setActiveChallenge(challenge);
        if (!isMentor) {
          addToast({
            type: 'info',
            title: 'Live Challenge Launched! ⚡',
            description: `Mentor pushed "${challenge.title}". Click Solve Live Challenge!`,
          });
        }
      },
      onChallengeSubmitted: (sub) => {
        addOrUpdateSubmission(sub);
        if (isMentor) {
          addToast({
            type: 'success',
            title: 'Challenge Solution Received! 📥',
            description: `${sub.studentName} submitted their code. Ready to grade.`,
          });
        }
      },
      onGradeReceived: (gradedSub) => {
        addOrUpdateSubmission(gradedSub);
        if (!isMentor && (gradedSub.studentId === activeUser?.id || gradedSub.studentName === activeUser?.name)) {
          setMySubmission(gradedSub);
          addToast({
            type: 'success',
            title: 'Your Solution Was Graded! 🌟',
            description: `Awarded ${gradedSub.marks} marks. Click to view feedback!`,
          });
        }
      },
      onChallengeEnded: () => {
        endChallengeLocal();
        addToast({
          type: 'info',
          title: 'Challenge Concluded',
          description: 'The live challenge has ended.',
        });
      },
    });

    return unsubscribe;
  }, [currentSession?.code, isMentor, activeUser?.id]);

  // Synchronized Timer Logic based on real session start time
  const getElapsedSeconds = () => {
    if (!currentSession?.startedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - currentSession.startedAt) / 1000));
  };

  const [seconds, setSeconds] = useState(getElapsedSeconds);

  React.useEffect(() => {
    setSeconds(getElapsedSeconds());
    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSession?.startedAt]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Direct 1-click share URL with PIN included for seamless student joining
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${currentSession?.code || 'CB-8821'}?pin=${currentSession?.pin || '5540'}`
      : `https://codebuddy.live/join/${currentSession?.code || 'CB-8821'}?pin=${currentSession?.pin || '5540'}`;

  const handleEndSession = () => {
    endSession();
    setIsEndModalOpen(false);
    addToast({
      type: 'info',
      title: 'Session Ended',
      description: 'Your classroom session has been closed.',
    });
  };

  const handleLeaveSession = () => {
    leaveSession();
    setIsLeaveModalOpen(false);
    addToast({
      type: 'info',
      title: 'Left Classroom',
      description: 'You disconnected from the mentor live session.',
    });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
        {/* Left: Back Arrow + Title + Room Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => leaveSession()}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
            title="Back to Classrooms Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentSession?.title || 'Live Coding Classroom'}
              </h1>
              <Badge variant="live" pulse>
                Live
              </Badge>
              {isMentor ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mentor (Broadcasting)</span>
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <GraduationCap className="w-3 h-3" />
                  <span>Student (Following)</span>
                </span>
              )}

              {/* Student Reached Live Indication for Mentor */}
              {isMentor && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all',
                    connectedStudents.length > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  )}
                  title={
                    connectedStudents.length > 0
                      ? `Active connected learners: ${connectedStudents.map((s) => s.name).join(', ')}`
                      : 'Waiting for student to join with room code & PIN'
                  }
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      connectedStudents.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    )}
                  />
                  <span>
                    {connectedStudents.length > 0
                      ? `Reached: ${connectedStudents[0].name}${
                          connectedStudents.length > 1 ? ` (+${connectedStudents.length - 1})` : ''
                        } (Live)`
                      : 'Waiting for student to reach...'}
                  </span>
                </span>
              )}

              {/* Connected to Mentor Indication for Student */}
              {!isMentor && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Reached Mentor: {currentSession?.mentor?.name || 'Rahul Sharma'} (Live)</span>
                </span>
              )}

              {(authUser?.isPro || currentUser?.isPro) && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 text-white shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>PRO</span>
                </span>
              )}

              {/* Multi-Room Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shadow-2xs"
                  title="Switch between active classrooms"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Rooms ({activeSessionsList.length})</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isSwitcherOpen && (
                  <div className="absolute top-[115%] left-0 w-64 bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                      Active Classrooms
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {activeSessionsList.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => {
                            selectSession(room);
                            setIsSwitcherOpen(false);
                            addToast({
                              type: 'info',
                              title: 'Switched Classroom',
                              description: `Now viewing ${room.title}`,
                            });
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors ${
                            currentSession?.code === room.code
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate">{room.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {room.language}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsSwitcherOpen(false);
                          leaveSession();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1.5"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Open Classrooms Hub</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal Session Info */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium mt-1">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="uppercase font-bold">{currentSession?.language || 'HTML'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-2 py-0.5 rounded-lg font-mono">
                ⏱ {formatTimer(seconds)}
              </div>

              <div className="text-slate-500 dark:text-slate-400 text-xs">
                Room: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentSession?.code}</span>
                <span className="mx-1">•</span>
                PIN: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentSession?.pin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
          {isMentor && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (activeChallenge ? openGradingModal() : openCreateModal())}
                icon={<Zap className="w-4 h-4 text-amber-300" />}
                className="rounded-xl font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20"
              >
                {activeChallenge
                  ? `Challenge Desk (${submissions.filter((s) => s.status === 'submitted').length} to grade)`
                  : '⚡ Push Challenge'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openNewSessionModal()}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                + New Room
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                icon={<UserPlus className="w-4 h-4" />}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                Invite
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(shareUrl, '1-Click Invite Link Copied!')}
                icon={hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                {hasCopied ? 'Copied Link' : 'Share Link'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEndModalOpen(true)}
                icon={<StopCircle className="w-4 h-4 text-rose-500" />}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                End Session
              </Button>
            </>
          )}

          {!isMentor && (
            <>
              {activeChallenge && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openStudentSandbox}
                  icon={<Zap className="w-4 h-4 text-amber-300 animate-pulse" />}
                  className="rounded-xl font-bold bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md shadow-amber-500/20"
                >
                  {mySubmission?.status === 'graded'
                    ? `Challenge Graded (${mySubmission.marks}/${activeChallenge.totalMarks})`
                    : mySubmission?.status === 'submitted'
                    ? 'Challenge Submitted (Review)'
                    : '⚡ Solve Live Challenge'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(shareUrl, 'Classroom link copied!')}
                icon={hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                {hasCopied ? 'Copied Link' : 'Share'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                icon={<LogOut className="w-4 h-4 text-amber-500" />}
                className="rounded-xl font-semibold bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                Leave Room
              </Button>
            </>
          )}
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Live Classroom?"
        description="This will terminate broadcasting for all students in this room."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Students currently connected will be notified that the session has ended. All notes and code progress will be saved.
          </p>

          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEndModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEndSession}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              End Classroom
            </Button>
          </div>
        </div>
      </Modal>

      {/* Leave Room Modal (Students) */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Classroom?"
        description="Return to the Classrooms Hub without ending the mentor's broadcast."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You can rejoin anytime using the room code and PIN.
          </p>

          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLeaveSession}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Leave Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Students to Classroom"
        description="Share room credentials or send a 1-click entry link"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Room Code</span>
              <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {currentSession?.code}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">4-Digit PIN</span>
              <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {currentSession?.pin}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Direct 1-Click Join Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              />
              <Button
                size="sm"
                onClick={() => copy(shareUrl, 'Link copied!')}
                className="shrink-0"
              >
                {hasCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Live Challenge & Sandbox Modals */}
      <CreateChallengeModal />
      <StudentChallengeModal />
      <MentorGradingModal />
    </>
  );
};
