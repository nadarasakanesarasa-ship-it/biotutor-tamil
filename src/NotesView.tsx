import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Copy,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { BiologyNote } from '../types';

export const NotesView: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { topics, notes, addNote, updateNote, deleteNote, notesLoading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeNote, setActiveNote] = useState<BiologyNote | null>(null);

  // Modal states for Admin editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [content, setContent] = useState('');
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);

  // Delete confirmation
  const [deletingNote, setDeletingNote] = useState<BiologyNote | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copy notice
  const [copied, setCopied] = useState(false);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesTopic =
      selectedTopic === 'all' ||
      n.topic.toLowerCase().includes(selectedTopic.toLowerCase());
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.subtopic && n.subtopic.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const openAddModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setTopic(topics[0]?.name ? `${topics[0].name} (${topics[0].nameEn})` : 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)');
    setSubtopic('');
    setContent('');
    setEditorError(null);
    setEditorSuccess(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (note: BiologyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setTitle(note.title);
    setTopic(note.topic);
    setSubtopic(note.subtopic || '');
    setContent(note.content);
    setEditorError(null);
    setEditorSuccess(null);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setEditorError('தலைப்பு மற்றும் உள்ளடக்கத்தை உள்ளிடவும்.');
      return;
    }

    setEditorLoading(true);
    setEditorError(null);
    setEditorSuccess(null);

    try {
      if (editingNoteId) {
        const ok = await updateNote(editingNoteId, {
          title: title.trim(),
          topic,
          subtopic: subtopic.trim() || undefined,
          content: content.trim(),
        });
        if (ok) {
          setEditorSuccess('குறிப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது (Note updated)!');
          setTimeout(() => {
            setIsEditorOpen(false);
            if (activeNote?.id === editingNoteId) {
              setActiveNote({
                ...activeNote,
                title: title.trim(),
                topic,
                subtopic: subtopic.trim() || undefined,
                content: content.trim(),
                updatedAt: new Date().toISOString(),
              });
            }
          }, 1000);
        }
      } else {
        const ok = await addNote({
          title: title.trim(),
          topic,
          subtopic: subtopic.trim() || undefined,
          content: content.trim(),
          authorName: currentUser?.displayName || 'ஆசிரியர்',
        });
        if (ok) {
          setEditorSuccess('புதிய குறிப்பு வெற்றிகரமாக சேமிக்கப்பட்டது (Note saved)!');
          setTimeout(() => setIsEditorOpen(false), 1000);
        }
      }
    } catch (err: any) {
      setEditorError(err?.message || 'குறிப்பை சேமிப்பதில் பிழை ஏற்பட்டது.');
    } finally {
      setEditorLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    setDeleteLoading(true);
    try {
      const ok = await deleteNote(deletingNote.id);
      if (ok) {
        if (activeNote?.id === deletingNote.id) {
          setActiveNote(null);
        }
        setDeletingNote(null);
      }
    } catch (err: any) {
      alert('நீக்குவதில் பிழை: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detailed Note View
  if (activeNote) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveNote(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>குறிப்புகள் பட்டியலுக்குத் திரும்பு</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyContent(activeNote.content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">பிரதியெடுக்கப்பட்டது</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>பிரதியெடு</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={(e) => openEditModal(activeNote, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>திருத்து</span>
              </button>
            )}
          </div>
        </div>

        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
          <div className="space-y-3 pb-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {activeNote.topic}
              </span>
              {activeNote.subtopic && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {activeNote.subtopic}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
              {activeNote.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {activeNote.authorName || 'ஆசிரியர்'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {new Date(activeNote.createdAt).toLocaleDateString('ta-LK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {activeNote.updatedAt && activeNote.updatedAt !== activeNote.createdAt && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    புதுப்பிக்கப்பட்டது: {new Date(activeNote.updatedAt).toLocaleDateString('ta-LK')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Note Body with Markdown style formatting */}
          <div className="prose max-w-none text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {activeNote.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>உயிரியல் பாடக் குறிப்புகள் (Biology Notes)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            இலங்கை உயர்தர உயிரியல் அலகுகளுக்குரிய விளக்கக் குறிப்புகள் மற்றும் சுருக்கங்கள்
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>புதிய குறிப்பு சேர்க்க (+ Add Note)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="குறிப்பின் தலைப்பு அல்லது உள்ளடக்கத்தைத் தேடுக..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full md:w-auto text-xs bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-700 font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
        >
          <option value="all">அனைத்து அலகுகளும் (All Topics)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name} ({t.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {notesLoading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">குறிப்புகள் ஏற்றப்படுகின்றன...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200/80 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">குறிப்புகள் எதுவும் கிடைக்கவில்லை</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            தேடல் சொல்லை மாற்றி அல்லது வேறு அலகைத் தெரிவு செய்து தேடவும்.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full line-clamp-1">
                    {note.topic}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => openEditModal(note, e)}
                        title="திருத்து (Edit)"
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingNote(note);
                        }}
                        title="நீக்கு (Delete)"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {note.title}
                </h3>

                {note.subtopic && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>{note.subtopic}</span>
                  </p>
                )}

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {note.content.replace(/[#*`|]/g, '').slice(0, 180)}...
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>{new Date(note.createdAt).toLocaleDateString('ta-LK')}</span>
                <span className="font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  முழுமையாக வாசிக்க →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Note Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span>
                  {editingNoteId ? 'குறிப்பைத் திருத்து (Edit Note)' : 'புதிய குறிப்பைச் சேர் (Add New Note)'}
                </span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 overflow-y-auto space-y-4 flex-1">
              {editorError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{editorError}</span>
                </div>
              )}

              {editorSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editorSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  குறிப்பின் தலைப்பு (Note Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="எ.கா: கல மென்சவ்வின் திரவ மொசைக் மாதிரி (Fluid Mosaic Model)"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    உயிரியல் அலகு (Biology Unit / Topic) *
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={`${t.name} (${t.nameEn})`}>
                        {t.name} ({t.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    துணைத் தலைப்பு (Subtopic - விருப்பத்தேர்வு)
                  </label>
                  <input
                    type="text"
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    placeholder="எ.கா: கலக் கட்டமைப்பு (Cell Structure)"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  குறிப்பு விளக்கம் (Note Content - Markdown ஆதரிக்கப்படும்) *
                </label>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="உயிரியல் குறிப்பு உள்ளடக்கத்தை தமிழில் தட்டச்சு செய்க. ஆங்கில கலைச்சொற்களை அடைப்புக்குறிக்குள் சேர்க்கவும்..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  இரத்து செய்க
                </button>

                <button
                  type="submit"
                  disabled={editorLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {editorLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>சேமி (Save Note)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                குறிப்பை நீக்க வேண்டுமா?
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                "{deletingNote.title}" என்ற குறிப்பு நிரந்தரமாக நீக்கப்படும். இந்த செயலை மீளமைக்க முடியாது.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingNote(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                இரத்து செய்க
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {deleteLoading ? 'நீக்கப்படுகிறது...' : 'ஆம், நீக்குக'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
