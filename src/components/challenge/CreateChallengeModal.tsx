import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useChallengeStore } from '../../stores/challengeStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { sessionService } from '../../services/sessionService';
import { LiveChallenge, PresetChallengeTemplate } from '../../types/challenge.types';
import { Zap, Clock, Award, Code2, Sparkles } from 'lucide-react';

const PRESET_TEMPLATES: PresetChallengeTemplate[] = [
  {
    id: 'c_rev_array',
    title: 'Reverse an Array Using Pointers',
    language: 'c',
    description:
      'Write a function that reverses an integer array in-place using two pointer variables (left & right). Print the reversed elements separated by spaces.',
    starterCode: `#include <stdio.h>

void reverseArray(int *arr, int size) {
    // TODO: Use two pointers (start and end) to reverse in-place
    int *start = arr;
    int *end = arr + size - 1;
    
    while (start < end) {
        int temp = *start;
        *start = *end;
        *end = temp;
        start++;
        end--;
    }
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    int n = 5;
    
    reverseArray(data, n);
    
    for (int i = 0; i < n; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");
    return 0;
}
`,
    expectedOutput: '50 40 30 20 10',
    totalMarks: 10,
    timeLimitMinutes: 5,
  },
  {
    id: 'c_fibonacci',
    title: 'Fibonacci Sequence Generator',
    language: 'c',
    description:
      'Compute and print the first N numbers of the Fibonacci sequence starting with 0 and 1.',
    starterCode: `#include <stdio.h>

int main() {
    int n = 7;
    int t1 = 0, t2 = 1, nextTerm;
    
    printf("%d %d ", t1, t2);
    for (int i = 3; i <= n; ++i) {
        nextTerm = t1 + t2;
        printf("%d ", nextTerm);
        t1 = t2;
        t2 = nextTerm;
    }
    printf("\\n");
    return 0;
}
`,
    expectedOutput: '0 1 1 2 3 5 8',
    totalMarks: 10,
    timeLimitMinutes: 4,
  },
  {
    id: 'html_badge',
    title: 'Interactive User Profile Badge',
    language: 'html',
    description:
      'Create a stylish CSS card with a rounded avatar, username, verified badge, and a gradient follow button.',
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; display: flex; justify-content: center; align-items: center; min-height: 90vh; background: #0f172a; }
    .card { background: #1e293b; color: white; padding: 24px; border-radius: 20px; text-align: center; width: 260px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .avatar { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #6366f1; margin: 0 auto 12px; }
    .name { font-weight: 800; font-size: 16px; margin: 0; }
    .btn { background: linear-gradient(135deg, #6366f1, #a855f7); border: none; color: white; padding: 8px 20px; border-radius: 12px; font-weight: bold; margin-top: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" class="avatar" />
    <h3 class="name">Rahul Sharma ✨</h3>
    <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">Senior Peer Mentor</p>
    <button class="btn">Connect</button>
  </div>
</body>
</html>`,
    totalMarks: 10,
    timeLimitMinutes: 6,
  },
];

export const CreateChallengeModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, setActiveChallenge } = useChallengeStore();
  const { currentSession } = useSessionStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState(PRESET_TEMPLATES[0].title);
  const [description, setDescription] = useState(PRESET_TEMPLATES[0].description);
  const [starterCode, setStarterCode] = useState(PRESET_TEMPLATES[0].starterCode);
  const [expectedOutput, setExpectedOutput] = useState(PRESET_TEMPLATES[0].expectedOutput || '');
  const [totalMarks, setTotalMarks] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(5);

  const handleSelectPreset = (preset: PresetChallengeTemplate) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setStarterCode(preset.starterCode);
    setExpectedOutput(preset.expectedOutput || '');
    setTotalMarks(preset.totalMarks);
    setTimeLimitMinutes(preset.timeLimitMinutes || 5);
  };

  const handleLaunchChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?.code) return;

    const challenge: LiveChallenge = {
      id: `chal_${Date.now()}`,
      sessionId: currentSession.id,
      roomCode: currentSession.code,
      title,
      description,
      starterCode,
      expectedOutput: expectedOutput.trim() || undefined,
      totalMarks,
      timeLimitMinutes,
      createdAt: Date.now(),
      isActive: true,
      mentorName: user?.name || 'Rahul Sharma (Mentor)',
    };

    // Set local state
    setActiveChallenge(challenge);

    // Broadcast challenge across room
    sessionService.broadcastChallenge(currentSession.code, challenge);

    addToast({
      type: 'success',
      title: 'Challenge Launched Live! 🚀',
      description: `"${title}" has been pushed to all connected students.`,
    });

    closeCreateModal();
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Push Live Challenge to Classroom"
      description="Launch an in-class coding challenge directly to students' screens for live evaluation."
      maxWidth="lg"
    >
      <form onSubmit={handleLaunchChallenge} className="space-y-4 py-2">
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quick Challenge Presets:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_TEMPLATES.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  title === p.title
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {p.language}
                </span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                  {p.title}
                </h5>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Challenge Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Reverse an Array with Pointers"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Description / Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Problem Description & Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>

        {/* Marks & Time Limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Total Marks</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Time Limit (Minutes)</span>
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Starter Code */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Starter Code (Loaded into Student Sandboxes)</span>
          </label>
          <textarea
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            rows={6}
            required
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#0D1117] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Zap className="w-4 h-4 text-amber-300" />}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold"
          >
            Launch Challenge to Classroom
          </Button>
        </div>
      </form>
    </Modal>
  );
};
