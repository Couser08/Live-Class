import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useChallengeStore } from '../../stores/challengeStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { sessionService } from '../../services/sessionService';
import { ChallengeSubmission } from '../../types/challenge.types';
import {
  Award,
  Clock,
  Terminal,
  MessageSquare,
  Send,
  StopCircle,
  FileCode,
} from 'lucide-react';

const COMMON_FEEDBACK_PRESETS = [
  '🌟 Excellent solution! In-place pointer manipulation is clean and optimal.',
  '⚠️ Watch out for off-by-one boundary conditions on line 12.',
  '💡 Great logic, but remember to free dynamically allocated memory before returning.',
  '🔧 Syntax error on condition check. Use comparison == instead of assignment =.',
];

export const MentorGradingModal: React.FC = () => {
  const {
    activeChallenge,
    submissions,
    isGradingModalOpen,
    closeGradingModal,
    selectedSubmissionId,
    openGradingModal,
    gradeSubmissionLocal,
    endChallengeLocal,
  } = useChallengeStore();
  const { currentSession } = useSessionStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const selectedSub =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0] || null;

  const [marksInput, setMarksInput] = useState<number>(() => selectedSub?.marks ?? (activeChallenge?.totalMarks || 10));
  const [feedbackInput, setFeedbackInput] = useState<string>(() => selectedSub?.feedback ?? '');

  // Update form inputs when selected student changes
  React.useEffect(() => {
    if (selectedSub) {
      setMarksInput(selectedSub.marks ?? (activeChallenge?.totalMarks || 10));
      setFeedbackInput(selectedSub.feedback ?? '');
    }
  }, [selectedSub?.id]);

  if (!activeChallenge) return null;

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !currentSession?.code) return;

    const mentorName = user?.name || 'Rahul Sharma (Mentor)';
    const updatedSub: ChallengeSubmission = {
      ...selectedSub,
      status: 'graded',
      marks: Number(marksInput),
      feedback: feedbackInput.trim(),
      gradedAt: Date.now(),
      gradedByName: mentorName,
    };

    gradeSubmissionLocal(selectedSub.id, Number(marksInput), feedbackInput.trim(), mentorName);

    // Broadcast grade directly to classroom and student
    sessionService.broadcastGrade(currentSession.code, updatedSub);

    addToast({
      type: 'success',
      title: `Grade Sent to ${selectedSub.studentName}! 🎓`,
      description: `Awarded ${marksInput}/${activeChallenge.totalMarks} marks with feedback.`,
    });
  };

  const handleEndChallenge = () => {
    if (!currentSession?.code) return;
    if (window.confirm('Are you sure you want to end this challenge for all students?')) {
      sessionService.broadcastEndChallenge(currentSession.code);
      endChallengeLocal();
      addToast({
        type: 'info',
        title: 'Challenge Ended',
        description: 'The live challenge has concluded.',
      });
      closeGradingModal();
    }
  };

  return (
    <Modal
      isOpen={isGradingModalOpen}
      onClose={closeGradingModal}
      title={`Mentor Grading Desk: ${activeChallenge.title}`}
      description={`Review student submissions, inspect code & output, award marks, and provide written corrections.`}
      maxWidth="xl"
    >
      <div className="space-y-4 py-2">
        {/* Top Header Summary & End Challenge Button */}
        <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Total Submissions: {submissions.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Graded:{' '}
                {submissions.filter((s) => s.status === 'graded').length} / {submissions.length}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEndChallenge}
            icon={<StopCircle className="w-4 h-4 text-rose-500" />}
            className="text-xs border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            End Challenge for All
          </Button>
        </div>

        {submissions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Waiting for Student Submissions...
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Students are currently working inside their sandboxes. As soon as they submit, their code will appear here for grading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Left: Students List */}
            <div className="md:col-span-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 space-y-1.5 max-h-[460px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                Submissions ({submissions.length})
              </div>
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => openGradingModal(sub.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={sub.studentAvatar} name={sub.studentName} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {sub.studentName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div>
                      {sub.status === 'graded' ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                          {sub.marks}/{activeChallenge.totalMarks}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                          Needs Grade
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Code Review & Grading Form */}
            {selectedSub && (
              <div className="md:col-span-8 space-y-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/40">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Avatar src={selectedSub.studentAvatar} name={selectedSub.studentName} size="sm" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {selectedSub.studentName}'s Code
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Submitted at {new Date(selectedSub.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {selectedSub.status === 'graded' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      ✓ Awarded {selectedSub.marks}/{activeChallenge.totalMarks}
                    </span>
                  )}
                </div>

                {/* Submitted Code Viewer */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Submitted Code:</span>
                  </div>
                  <pre className="p-3 bg-[#0D1117] text-slate-100 font-mono text-xs rounded-xl overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedSub.code}
                  </pre>
                </div>

                {/* Stdout Box */}
                {selectedSub.stdout && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-sky-500" />
                      <span>Program Output:</span>
                    </div>
                    <pre className="p-2.5 bg-[#0D1117] text-slate-300 font-mono text-xs rounded-xl overflow-x-auto max-h-24 whitespace-pre-wrap border border-slate-800">
                      {selectedSub.stdout}
                    </pre>
                  </div>
                )}

                {/* Grading Form */}
                <form onSubmit={handleGradeSubmit} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-40">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Award Marks</span>
                      </label>
                      <div className="flex items-center gap-1.5 font-mono">
                        <input
                          type="number"
                          min={0}
                          max={activeChallenge.totalMarks}
                          value={marksInput}
                          onChange={(e) => setMarksInput(Number(e.target.value))}
                          required
                          className="w-20 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <span className="text-xs text-slate-400 font-semibold">/ {activeChallenge.totalMarks}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Quick Remarks:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_FEEDBACK_PRESETS.slice(0, 2).map((p, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setFeedbackInput((prev) => (prev ? prev + '\n' + p : p))}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            + Preset {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Mentor Error Feedback & Corrections</span>
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="e.g. Great solution! Line 8 had an off-by-one error..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<Send className="w-3.5 h-3.5" />}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold"
                    >
                      {selectedSub.status === 'graded' ? 'Update & Resend Grade' : 'Publish Grade & Send Feedback'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
