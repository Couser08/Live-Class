import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useChallengeStore } from '../../stores/challengeStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { sessionService } from '../../services/sessionService';
import { executeCCode } from '../../lib/cInterpreter';
import { ChallengeSubmission } from '../../types/challenge.types';
import {
  Zap,
  Play,
  Terminal,
  Send,
} from 'lucide-react';

export const StudentChallengeModal: React.FC = () => {
  const {
    activeChallenge,
    isStudentSandboxOpen,
    closeStudentSandbox,
    mySubmission,
    setMySubmission,
  } = useChallengeStore();
  const { currentSession } = useSessionStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [code, setCode] = useState(activeChallenge?.starterCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Sync starter code when challenge changes
  useEffect(() => {
    if (activeChallenge?.starterCode && !code) {
      setCode(activeChallenge.starterCode);
    }
  }, [activeChallenge?.id]);

  if (!activeChallenge) return null;

  const handleRunTest = () => {
    setIsRunning(true);
    try {
      const res = executeCCode(code);
      if (res.hasErrors) {
        setOutput((res.errors && res.errors[0]) || 'Runtime or compilation error');
      } else {
        setOutput(res.stdout || '[Program executed successfully with no output]');
      }
    } catch (err: any) {
      setOutput('Execution exception: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = () => {
    if (!currentSession?.code || !user) return;

    // Run to capture latest stdout
    let currentOut = output;
    try {
      const res = executeCCode(code);
      currentOut = res.hasErrors ? (res.errors?.[0] || 'Error') : (res.stdout || 'OK');
      setOutput(currentOut);
    } catch {}

    const submission: ChallengeSubmission = {
      id: `sub_${user.id}_${Date.now()}`,
      challengeId: activeChallenge.id,
      roomCode: currentSession.code,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatarUrl,
      code,
      stdout: currentOut,
      status: 'submitted',
      submittedAt: Date.now(),
    };

    setMySubmission(submission);

    // Broadcast submission to mentor
    sessionService.broadcastSubmission(currentSession.code, submission);

    addToast({
      type: 'success',
      title: 'Solution Submitted! 🎉',
      description: 'Your solution is now waiting for Mentor Rahul to review.',
    });
  };

  return (
    <Modal
      isOpen={isStudentSandboxOpen}
      onClose={closeStudentSandbox}
      title={`Live Challenge: ${activeChallenge.title}`}
      description={`Launched by ${activeChallenge.mentorName || 'Rahul (Mentor)'} • Total Marks: ${activeChallenge.totalMarks}`}
      maxWidth="xl"
    >
      <div className="space-y-4 py-2">
        {/* Mentor Grading Feedback Banner (if graded!) */}
        {mySubmission?.status === 'graded' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-emerald-500/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  ✓
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Mentor Review Received</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      Graded
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Evaluated by {mySubmission.gradedByName || 'Mentor'}
                  </p>
                </div>
              </div>

              {/* Awarded Marks */}
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score Awarded</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {mySubmission.marks ?? 0} / {activeChallenge.totalMarks}
                </div>
              </div>
            </div>

            {mySubmission.feedback && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mentor Remarks & Corrections:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
                  {mySubmission.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Problem Description Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Problem Statement
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                {activeChallenge.totalMarks} Marks
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeChallenge.description}
            </p>
          </div>
        </div>

        {/* Challenge Code Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Your Solution Sandbox:</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Isolated from mentor follow mode)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRunTest}
                disabled={isRunning}
                icon={<Play className="w-3.5 h-3.5 text-emerald-500" />}
                className="text-xs py-1"
              >
                {isRunning ? 'Compiling...' : 'Run & Test'}
              </Button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="w-full text-xs font-mono p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#0D1117] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
        </div>

        {/* Execution Output Box */}
        {output && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-sky-500" />
              <span>Execution Output / Diagnostics</span>
            </div>
            <pre className="p-3 bg-[#0D1117] text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-32">
              {output}
            </pre>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {mySubmission?.status === 'submitted' ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>⏱ Submitted! Waiting for Rahul to grade...</span>
              </span>
            ) : mySubmission?.status === 'graded' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>✓ Graded: {mySubmission.marks} / {activeChallenge.totalMarks}</span>
              </span>
            ) : (
              <span>Test your code first, then click submit to send to mentor.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeStudentSandbox}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitSolution}
              icon={<Send className="w-3.5 h-3.5" />}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold"
            >
              {mySubmission ? 'Resubmit Solution' : 'Submit to Mentor'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
