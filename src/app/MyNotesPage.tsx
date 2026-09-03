import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Search, Plus, FileText } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { SupportedLanguage } from '../types/session.types';
import { NoteListSidebar, NoteItem } from '../components/notes/NoteListSidebar';
import { NoteContentViewer } from '../components/notes/NoteContentViewer';
import { NoteDetailsSidebar } from '../components/notes/NoteDetailsSidebar';
import { NoteEditorModal } from '../components/notes/NoteEditorModal';

const getSavedNotes = (): NoteItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('codebuddy_saved_notes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const MyNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(getSavedNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | SupportedLanguage>('all');
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editNoteForm, setEditNoteForm] = useState<Partial<NoteItem>>({});

  const { addToast } = useUIStore();

  useEffect(() => {
    try {
      localStorage.setItem('codebuddy_saved_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesLang = languageFilter === 'all' || note.language === languageFilter;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.contentHeading1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.contentBody1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLang && matchesSearch;
    });
  }, [notes, languageFilter, searchQuery]);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;
  }, [notes, selectedNoteId, filteredNotes]);

  const handleOpenNew = () => {
    setEditNoteForm({
      id: `note_${Date.now()}`,
      title: '',
      language: languageFilter === 'all' ? 'html' : languageFilter,
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: '3 min read',
      isPinned: false,
      contentHeading1: 'Key Concepts',
      contentBody1: '',
      codeSnippet: '',
      tags: [],
    });
    setIsEditorModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (activeNote) {
      setEditNoteForm(activeNote);
      setIsEditorModalOpen(true);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNoteForm.title?.trim()) return;

    const savedNote: NoteItem = {
      id: editNoteForm.id || `note_${Date.now()}`,
      title: editNoteForm.title || 'Untitled Note',
      language: editNoteForm.language || 'html',
      date: editNoteForm.date || 'Today',
      readTime: editNoteForm.readTime || '3 min read',
      isPinned: editNoteForm.isPinned || false,
      contentHeading1: editNoteForm.contentHeading1 || 'Summary',
      contentBody1: editNoteForm.contentBody1 || '',
      contentHeading2: editNoteForm.contentHeading2 || 'Key Snippet & Syntax',
      contentBody2: editNoteForm.contentBody2 || '',
      codeSnippet: editNoteForm.codeSnippet || '',
      words: (editNoteForm.contentBody1 || '').split(/\s+/).filter(Boolean).length,
      characters: (editNoteForm.contentBody1 || '').length,
      tags: editNoteForm.tags || [],
    };

    setNotes((prev) => {
      const exists = prev.some((n) => n.id === savedNote.id);
      if (exists) {
        return prev.map((n) => (n.id === savedNote.id ? savedNote : n));
      }
      return [savedNote, ...prev];
    });
    setSelectedNoteId(savedNote.id);
    setIsEditorModalOpen(false);
    addToast({
      type: 'success',
      title: 'Note Saved',
      description: `"${savedNote.title}" has been saved.`,
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedNoteId(remaining[0]?.id || '');
    }
    addToast({
      type: 'info',
      title: 'Note Deleted',
      description: 'The note has been removed.',
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-150 max-w-[1400px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 mb-2">
            <span>Knowledge Base • Markdown Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Notes
          </h1>
          <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">
            Access, edit, and export your classroom code notes and cheat sheets.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full text-xs pl-9.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as any)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer"
          >
            <option value="all">All Languages</option>
            <option value="html">HTML</option>
            <option value="c">C Language</option>
            <option value="javascript">JavaScript</option>
          </select>

          <Button
            onClick={handleOpenNew}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            className="rounded-xl px-4 py-2.5 font-bold shadow-md shadow-indigo-500/20"
          >
            New Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
            <FileText className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Notes Saved Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Take notes during your live sessions or click below to write your first note.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              onClick={handleOpenNew}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="rounded-xl px-4 py-2.5 font-bold"
            >
              Create First Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <NoteListSidebar
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              onViewAllNotes={() => addToast({ type: 'info', title: 'All Notes', description: 'Showing all saved notes.' })}
            />
          </div>

          {activeNote && (
            <div className="lg:col-span-5">
              <NoteContentViewer note={activeNote} onEditNote={handleOpenEdit} />
            </div>
          )}

          {activeNote && (
            <div className="lg:col-span-3">
              <NoteDetailsSidebar
                note={activeNote}
                onExportPDF={() => addToast({ type: 'success', title: 'Exporting PDF', description: `Downloading ${activeNote.title}.pdf` })}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        noteForm={editNoteForm}
        setNoteForm={setEditNoteForm}
        onSave={handleSaveNote}
      />
    </div>
  );
};
