import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useQuestionStore } from '../../stores/questionStore';
import { useUIStore } from '../../stores/uiStore';
import { LiveQuestion } from '../../types/question.types';
import { sessionService, ChatMessageItem } from '../../services/sessionService';
import { Send, HelpCircle } from 'lucide-react';

export const RecentQuestionsCard: React.FC = () => {
  const { questions, answerQuestion } = useQuestionStore();
  const { addToast } = useUIStore();
  const [selectedQuestion, setSelectedQuestion] = useState<LiveQuestion | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleOpenQuestion = (q: LiveQuestion) => {
    setSelectedQuestion(q);
    setReplyText(q.answer || '');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !replyText.trim()) return;

    answerQuestion(selectedQuestion.id, replyText);

    // Broadcast answer directly back to classroom chat if linked to a session
    if (selectedQuestion.sessionId) {
      const replyMsg: ChatMessageItem = {
        id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId: selectedQuestion.sessionId,
        senderId: 'mentor_rahul',
        senderName: 'Rahul Tungariya (Mentor)',
        senderRole: 'mentor',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: `💡 **Mentor Answer to @${selectedQuestion.author.name}**: ${replyText.trim()}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHighlighted: true,
      };
      sessionService.broadcastMessage(selectedQuestion.sessionId, replyMsg);
      sessionService.sendMessage(replyMsg, selectedQuestion.sessionId);
    }

    addToast({
      type: 'success',
      title: `Reply Sent to ${selectedQuestion.author.name}`,
      description: 'Your answer is now visible in the live session.',
    });
    setSelectedQuestion(null);
    setReplyText('');
  };

  return (
    <>
      <Card className="p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Questions
          </h3>
          <button
            onClick={() => questions.length > 0 && handleOpenQuestion(questions[0])}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Questions list or empty state */}
        {questions.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No questions yet</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px] mx-auto">
              Live questions asked by learners will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
            {questions.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenQuestion(item)}
                className="pt-2.5 first:pt-0 flex items-start gap-3 cursor-pointer group hover:bg-slate-50/70 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-colors"
              >
                <Avatar
                  src={item.author.avatarUrl}
                  name={item.author.name}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.author.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                    {item.question}
                  </p>

                  {item.answered ? (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <span>✓ Answered</span>
                    </p>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 inline-block font-semibold">
                      Pending answer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Answer Modal */}
      {selectedQuestion && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuestion(null)}
          title="Answer Live Question"
          description={`Asked by ${selectedQuestion.author.name} at ${selectedQuestion.createdAt}`}
        >
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                "{selectedQuestion.question}"
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Answer
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your explanation or tip for the student..."
                  className="w-full text-xs rounded-xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestion(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyText.trim()}
                  icon={<Send className="w-3.5 h-3.5" />}
                  className="text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                >
                  Submit Answer
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};
