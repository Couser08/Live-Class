import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useQuestionStore } from '../../stores/questionStore';
import { useUIStore } from '../../stores/uiStore';
import { LiveQuestion } from '../../types/question.types';
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
      <Card className="p-5 flex flex-col justify-between space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
            Recent Questions
          </h3>
          {questions.length > 0 && (
            <button
              onClick={() => handleOpenQuestion(questions[0])}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {/* Questions list or empty state */}
        {questions.length === 0 ? (
          <div className="py-6 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No questions yet</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Live questions asked by learners will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
            {questions.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenQuestion(item)}
                className="pt-2.5 first:pt-0 flex items-start gap-3 cursor-pointer group hover:bg-slate-50/70 dark:hover:bg-slate-800/60 p-1.5 rounded-xl transition-colors"
              >
                <Avatar
                  src={item.author.avatarUrl}
                  name={item.author.name}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.author.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {item.createdAt}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5551FF]" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 font-medium leading-snug">
                    {item.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Answer / View Question Modal */}
      <Modal
        isOpen={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        title={`Live Question from ${selectedQuestion?.author.name || 'Student'}`}
        description="Respond in real-time to your learner"
      >
        {selectedQuestion && (
          <form onSubmit={handleSendReply} className="space-y-4 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start gap-3">
              <Avatar
                src={selectedQuestion.author.avatarUrl}
                name={selectedQuestion.author.name}
                size="sm"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedQuestion.author.name}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-1">
                  {selectedQuestion.question}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Answer (Mentor)
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Explain the concept clearly..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuestion(null)}
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send Answer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
