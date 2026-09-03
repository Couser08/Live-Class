import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NoteItem } from './NoteListSidebar';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteForm: Partial<NoteItem>;
  setNoteForm: React.Dispatch<React.SetStateAction<Partial<NoteItem>>>;
  onSave: (e: React.FormEvent) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  noteForm,
  setNoteForm,
  onSave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={noteForm.title ? 'Edit Note' : 'Create New Note'}
      description="Write explanations and bookmark code snippets"
    >
      <form onSubmit={onSave} className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input
            type="text"
            value={noteForm.title || ''}
            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
            placeholder="e.g. CSS Grid & Flexbox"
            required
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Language</label>
            <select
              value={noteForm.language || 'html'}
              onChange={(e) => setNoteForm({ ...noteForm, language: e.target.value as any })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              <option value="html">HTML</option>
              <option value="c">C Language</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Heading</label>
            <input
              type="text"
              value={noteForm.contentHeading1 || ''}
              onChange={(e) => setNoteForm({ ...noteForm, contentHeading1: e.target.value })}
              placeholder="Overview"
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Explanation</label>
          <textarea
            value={noteForm.contentBody1 || ''}
            onChange={(e) => setNoteForm({ ...noteForm, contentBody1: e.target.value })}
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Code Snippet</label>
          <textarea
            value={noteForm.codeSnippet || ''}
            onChange={(e) => setNoteForm({ ...noteForm, codeSnippet: e.target.value })}
            rows={3}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-slate-900 text-slate-100"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};
