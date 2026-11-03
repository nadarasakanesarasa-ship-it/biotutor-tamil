
import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  FileText,
  BarChart3,
  Upload,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50';

type Section = 'overview' | 'lessons' | 'topics' | 'mcqs' | 'pdfs';

export function AdminPanel() {
  const {
    isAdmin,
    loading: authLoading,
    currentUser,
  } = useAuth();

  const {
    topics,
    notes,
    pdfs,
    adminQuizQuestions,
    userQuizResults,
    addNote,
    updateNote,
    deleteNote,
    addTopic,
    addQuizQuestion,
    deleteQuizQuestion,
    addPdfDoc,
    deletePdfDoc,
  } = useData();

  const [section, setSection] = useState<Section>('overview');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonSubtopic, setLessonSubtopic] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  // Topic form
  const [topicTa, setTopicTa] = useState('');
  const [topicEn, setTopicEn] = useState('');
  const [topicDescription, setTopicDescription] = useState('');

  // MCQ form
  const [question, setQuestion] = useState('');
  const [questionTopic, setQuestionTopic] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // PDF form
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfTopic, setPdfTopic] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        `${note.title} ${note.topic}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [notes, search]
  );

  const filteredQuestions = useMemo(
    () =>
      adminQuizQuestions.filter((item) =>
        `${item.question} ${item.topic}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [adminQuizQuestions, search]
  );

  if (authLoading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        நிர்வாக அனுமதி சரிபார்க்கப்படுகிறது...
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <ShieldCheck
          className="mx-auto mb-3 text-red-600"
          size={40}
        />
        <h1 className="text-xl font-bold text-red-900">
          நிர்வாக அனுமதி தேவை
        </h1>
        <p className="mt-2 text-sm text-red-800">
          இந்தப் பகுதி அங்கீகரிக்கப்பட்ட BioTutor Tamil
          நிர்வாகிகளுக்கு மட்டுமே.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Lesson Form
  // --------------------------------------------------

  const resetLessonForm = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonTopic(topics[0]?.name || '');
    setLessonSubtopic('');
    setLessonContent('');
  };

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');

    if (
      !lessonTitle.trim() ||
      !lessonTopic ||
      !lessonContent.trim()
    ) {
      setNotice(
        'பாடத் தலைப்பு, அலகு, உள்ளடக்கம் ஆகியவற்றை நிரப்பவும்.'
      );
      return;
    }

    setBusy(true);

    try {
      const ok = editingLesson
        ? await updateNote(editingLesson, {
            title: lessonTitle.trim(),
            topic: lessonTopic,
            subtopic: lessonSubtopic.trim(),
            content: lessonContent.trim(),
          })
        : await addNote({
            title: lessonTitle.trim(),
            topic: lessonTopic,
            subtopic: lessonSubtopic.trim(),
            content: lessonContent.trim(),
            accessType: 'free',
          });

      setNotice(
        ok
          ? editingLesson
            ? 'பாடம் புதுப்பிக்கப்பட்டது.'
            : 'புதிய பாடம் சேர்க்கப்பட்டது.'
          : 'சேமிக்க முடியவில்லை. Firebase rules/config-ஐச் சரிபார்க்கவும்.'
      );

      if (ok) {
        resetLessonForm();
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'பிழை ஏற்பட்டது.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeLesson(id: string) {
    if (
      !window.confirm(
        'இந்தப் பாடக்குறிப்பை நிரந்தரமாக நீக்கவா?'
      )
    ) {
      return;
    }

    try {
      const ok = await deleteNote(id);

      setNotice(
        ok ? 'பாடம் நீக்கப்பட்டது.' : 'பாடத்தை நீக்க முடியவில்லை.'
      );
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : 'நீக்கும்போது பிழை ஏற்பட்டது.'
      );
    }
  }

  // --------------------------------------------------
  // Topic Form
  // --------------------------------------------------

  async function saveTopic(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');

    if (!topicTa.trim() || !topicEn.trim()) {
      setNotice('தமிழ் மற்றும் ஆங்கிலப் பெயர்களை நிரப்பவும்.');
      return;
    }

    setBusy(true);

    try {
      const ok = await addTopic({
        name: topicTa.trim(),
        nameEn: topicEn.trim(),
        description: topicDescription.trim(),
        order: topics.length + 1,
      });

      setNotice(
        ok ? 'புதிய அலகு சேர்க்கப்பட்டது.' : 'அலகைச் சேர்க்க முடியவில்லை.'
      );

      if (ok) {
        setTopicTa('');
        setTopicEn('');
        setTopicDescription('');
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'பிழை ஏற்பட்டது.'
      );
    } finally {
      setBusy(false);
    }
  }

  // --------------------------------------------------
  // MCQ Form
  // --------------------------------------------------

  async function saveQuestion(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');

    const validOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    const selectedCorrectOption = options[correctIndex]?.trim();

    if (
      !question.trim() ||
      !questionTopic ||
      validOptions.length < 2 ||
      !selectedCorrectOption ||
      !explanation.trim()
    ) {
      setNotice(
        'வினா, அலகு, குறைந்தது 2 தெரிவுகள், சரியான விடை, விளக்கம் ஆகியவற்றை நிரப்பவும்.'
      );
      return;
    }

    setBusy(true);

    try {
      const ok = await addQuizQuestion({
        question: question.trim(),
        topic: questionTopic,
        options: validOptions,
        correctIndex: validOptions.indexOf(selectedCorrectOption),
        explanation: explanation.trim(),
      });

      setNotice(
        ok
          ? 'MCQ வினா சேர்க்கப்பட்டது.'
          : 'வினாவைச் சேமிக்க முடியவில்லை.'
      );

      if (ok) {
        setQuestion('');
        setQuestionTopic('');
        setOptions(['', '', '', '', '']);
        setCorrectIndex(0);
        setExplanation('');
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'பிழை ஏற்பட்டது.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeQuestion(id: string) {
    if (
      !window.confirm(
        'இந்த MCQ வினாவை நிரந்தரமாக நீக்கவா?'
      )
    ) {
      return;
    }

    try {
      const ok = await deleteQuizQuestion(id);

      setNotice(
        ok ? 'MCQ வினா நீக்கப்பட்டது.' : 'வினாவை நீக்க முடியவில்லை.'
      );
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : 'நீக்கும்போது பிழை ஏற்பட்டது.'
      );
    }
  }

  // --------------------------------------------------
  // PDF Form
  // --------------------------------------------------

  async function savePdf(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');

    const safeFileName = pdfFileName.trim();

    if (
      !pdfTitle.trim() ||
      !pdfTopic ||
      !safeFileName
    ) {
      setNotice(
        'PDF தலைப்பு, அலகு, கோப்புப் பெயர் ஆகியவற்றை நிரப்பவும்.'
      );
      return;
    }

    if (!/^[a-zA-Z0-9_-]+\.pdf$/i.test(safeFileName)) {
      setNotice(
        'PDF பெயர் சரியாக இல்லை. உதாரணம்: cell-biology.pdf'
      );
      return;
    }

    setBusy(true);

    try {
      const downloadUrl =
        `https://biotutor-tamil.web.app/pdfs/biology/${encodeURIComponent(safeFileName)}`;

      const ok = await addPdfDoc({
        title: pdfTitle.trim(),
        topic: pdfTopic,
        description: pdfDescription.trim(),
        downloadUrl,
        fileName: safeFileName,
      });

      setNotice(
        ok
          ? 'PDF விவரங்கள் சேமிக்கப்பட்டன.'
          : 'PDF விவரங்களைச் சேமிக்க முடியவில்லை.'
      );

      if (ok) {
        setPdfTitle('');
        setPdfTopic('');
        setPdfFileName('');
        setPdfDescription('');
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'பிழை ஏற்பட்டது.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function removePdf(id: string) {
    if (
      !window.confirm(
        'இந்த PDF பதிவை நீக்கவா? Hosting-ல் உள்ள உண்மையான PDF கோப்பு நீக்கப்படாது.'
      )
    ) {
      return;
    }

    try {
      const ok = await deletePdfDoc(id);

      setNotice(
        ok
          ? 'PDF பதிவு நீக்கப்பட்டது.'
          : 'PDF பதிவை நீக்க முடியவில்லை.'
      );
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : 'PDF நீக்கும்போது பிழை ஏற்பட்டது.'
      );
    }
  }

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const nav: {
    id: Section;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'overview', label: 'சுருக்கம்', icon: BarChart3 },
    { id: 'lessons', label: 'பாடங்கள்', icon: BookOpen },
    { id: 'topics', label: 'அலகுகள்', icon: FileText },
    { id: 'mcqs', label: 'MCQ வினாக்கள்', icon: Brain },
    { id: 'pdfs', label: 'PDF நிர்வாகம்', icon: Upload },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
              <ShieldCheck size={14} />
              Admin access verified
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              BioTutor நிர்வாக மையம்
            </h1>

            <p className="mt-2 text-sm text-emerald-100">
              பாடங்கள், பாட அலகுகள் மற்றும் பல்தேர்வு
              வினாக்களை நிர்வகிக்கவும்.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
            <p className="text-emerald-100">
              உள்நுழைந்த நிர்வாகி
            </p>
            <p className="mt-1 font-semibold">
              {currentUser.email}
            </p>
          </div>
        </div>
      </header>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'பாட அலகுகள்',
            value: topics.length,
            icon: BookOpen,
          },
          {
            label: 'பாடக்குறிப்புகள்',
            value: notes.length,
            icon: FileText,
          },
          {
            label: 'MCQ வினாக்கள்',
            value: adminQuizQuestions.length,
            icon: Brain,
          },
          {
            label: 'PDF வளங்கள்',
            value: pdfs.length,
            icon: Users,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {stat.label}
                </span>
                <Icon size={18} className="text-emerald-700" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {nav.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setNotice('');
                setSearch('');
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                section === item.id
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Notice */}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}

      {/* Overview */}
      {section === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => setSection('lessons')}
            className="rounded-2xl border bg-white p-6 text-left transition hover:border-emerald-300 hover:shadow-sm"
          >
            <BookOpen
              className="mb-3 text-emerald-700"
              size={26}
            />
            <h2 className="font-bold">பாடங்களை நிர்வகி</h2>
            <p className="mt-1 text-sm text-slate-500">
              புதிய தமிழ் பாடக்குறிப்புகளைச் சேர்,
              திருத்து அல்லது நீக்கு.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSection('mcqs')}
            className="rounded-2xl border bg-white p-6 text-left transition hover:border-emerald-300 hover:shadow-sm"
          >
            <Brain
              className="mb-3 text-emerald-700"
              size={26}
            />
            <h2 className="font-bold">MCQ வினா வங்கி</h2>
            <p className="mt-1 text-sm text-slate-500">
              வினாக்கள், தெரிவுகள், சரியான விடை
              மற்றும் விளக்கத்தைச் சேர்.
            </p>
          </button>

          <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
            <h2 className="font-bold">மாணவர் செயல்பாடு</h2>
            <p className="mt-1 text-sm text-slate-500">
              இந்த session-ல் DataContext-க்கு கிடைத்த
              quiz முடிவுகள்: {userQuizResults.length}.
              எல்லா மாணவர்களின் முடிவுகளுக்கான தனி
              அறிக்கை இன்னும் இணைக்கப்படவில்லை.
            </p>
          </div>
        </div>
      )}

      {/* Lessons */}
      {section === 'lessons' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            onSubmit={saveLesson}
            className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6"
          >
            <div>
              <h2 className="text-lg font-bold">
                {editingLesson
                  ? 'பாடத்தைத் திருத்து'
                  : 'புதிய பாடத்தைச் சேர்'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                உள்ளடக்கம் Firestore-ல் சேமிக்கப்படும்.
              </p>
            </div>

            <input
              className={fieldClass}
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="பாடத் தலைப்பு"
              maxLength={200}
            />

            <select
              className={fieldClass}
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
            >
              <option value="">பாட அலகைத் தேர்ந்தெடு</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name} ({topic.nameEn})
                </option>
              ))}
            </select>

            <input
              className={fieldClass}
              value={lessonSubtopic}
              onChange={(e) => setLessonSubtopic(e.target.value)}
              placeholder="உபதலைப்பு (விருப்பம்)"
              maxLength={150}
            />

            <textarea
              className={fieldClass}
              rows={10}
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="தமிழில் பாட விளக்கம்..."
              maxLength={50000}
            />

            <div className="flex flex-wrap gap-2">
              <button
                className={buttonClass}
                disabled={busy}
                type="submit"
              >
                <Plus size={16} />
                {busy
                  ? 'சேமிக்கிறது...'
                  : editingLesson
                    ? 'மாற்றங்களைச் சேமி'
                    : 'பாடத்தைச் சேர்'}
              </button>

              {editingLesson && (
                <button
                  className="rounded-xl border px-4 py-2.5 text-sm"
                  type="button"
                  onClick={resetLessonForm}
                >
                  ரத்து செய்
                </button>
              )}
            </div>
          </form>

          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">
                பாடக்குறிப்புகள் ({notes.length})
              </h2>

              <input
                className={`${fieldClass} sm:max-w-56`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="தேடு..."
              />
            </div>

            <div className="max-h-[650px] space-y-3 overflow-y-auto">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {note.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {note.topic}
                      </p>

                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="திருத்து"
                        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                        onClick={() => {
                          setEditingLesson(note.id);
                          setLessonTitle(note.title);
                          setLessonTopic(note.topic);
                          setLessonSubtopic(note.subtopic || '');
                          setLessonContent(note.content);
                          window.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                          });
                        }}
                      >
                        திருத்து
                      </button>

                      <button
                        type="button"
                        title="நீக்கு"
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        onClick={() => void removeLesson(note.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {filteredNotes.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  பாடங்கள் கிடைக்கவில்லை.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topics */}
      {section === 'topics' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <form
            onSubmit={saveTopic}
            className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold">
              புதிய பாட அலகு
            </h2>

            <input
              className={fieldClass}
              value={topicTa}
              onChange={(e) => setTopicTa(e.target.value)}
              placeholder="தமிழ் பெயர்"
              maxLength={100}
            />

            <input
              className={fieldClass}
              value={topicEn}
              onChange={(e) => setTopicEn(e.target.value)}
              placeholder="English name"
              maxLength={100}
            />

            <textarea
              className={fieldClass}
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              placeholder="சுருக்கமான விளக்கம் (விருப்பம்)"
              rows={4}
              maxLength={500}
            />

            <button
              className={buttonClass}
              disabled={busy}
              type="submit"
            >
              <Plus size={16} />
              {busy ? 'சேர்க்கிறது...' : 'அலகைச் சேர்'}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              இங்கு சேர்க்கப்படும் அலகு Notes மற்றும்
              MCQ dropdown-களில் தோன்றும்.
            </p>
          </form>

          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">
              பாட அலகுகள் ({topics.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border p-4"
                >
                  <p className="font-semibold">
                    {topic.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {topic.nameEn}
                  </p>

                  {topic.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {topic.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MCQs */}
      {section === 'mcqs' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            onSubmit={saveQuestion}
            className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6"
          >
            <div>
              <h2 className="text-lg font-bold">
                புதிய MCQ வினா
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                2–5 தெரிவுகள் வரை சேர்க்கலாம்.
              </p>
            </div>

            <textarea
              className={fieldClass}
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="வினாவை உள்ளிடு..."
              maxLength={2000}
            />

            <select
              className={fieldClass}
              value={questionTopic}
              onChange={(e) => setQuestionTopic(e.target.value)}
            >
              <option value="">பாட அலகைத் தேர்ந்தெடு</option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name} ({topic.nameEn})
                </option>
              ))}
            </select>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    name="correct-option"
                    aria-label={`தெரிவு ${index + 1} சரியான விடை`}
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                    className="accent-emerald-700"
                  />

                  <input
                    className={fieldClass}
                    value={option}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((item, i) =>
                          i === index ? e.target.value : item
                        )
                      )
                    }
                    placeholder={`தெரிவு ${index + 1}`}
                    maxLength={500}
                  />
                </div>
              ))}
            </div>

            <textarea
              className={fieldClass}
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="சரியான விடைக்கான விளக்கம்..."
              maxLength={3000}
            />

            <button
              className={buttonClass}
              disabled={busy}
              type="submit"
            >
              <Plus size={16} />
              {busy ? 'சேமிக்கிறது...' : 'MCQ வினாவைச் சேர்'}
            </button>
          </form>

          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">
                Admin வினா வங்கி ({adminQuizQuestions.length})
              </h2>

              <input
                className={`${fieldClass} sm:max-w-56`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="வினாவைத் தேடு..."
              />
            </div>

            <div className="max-h-[750px] space-y-3 overflow-y-auto">
              {filteredQuestions.map((q) => (
                <article
                  key={q.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {q.question}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {q.topic}
                      </p>

                      <ol className="mt-3 list-inside list-[upper-alpha] space-y-1 text-sm text-slate-600">
                        {q.options.map((option, index) => (
                          <li
                            key={`${q.id}-${index}`}
                            className={
                              index === q.correctIndex
                                ? 'font-semibold text-emerald-700'
                                : ''
                            }
                          >
                            {option}
                            {index === q.correctIndex ? ' ✓' : ''}
                          </li>
                        ))}
                      </ol>

                      <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-800">
                          சரியான விடை
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-900">
                          {q.options[q.correctIndex] ?? 'கிடைக்கவில்லை'}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-emerald-800">
                          விளக்கம்
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">
                          {q.explanation}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="வினாவை நீக்கு"
                      onClick={() => void removeQuestion(q.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}

              {filteredQuestions.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Admin MCQ வினாக்கள் கிடைக்கவில்லை.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDFs */}
      {section === 'pdfs' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <form
            onSubmit={savePdf}
            className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold">
              புதிய PDF சேர்க்கவும்
            </h2>

            <input
              className={fieldClass}
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder="PDF தலைப்பு"
            />

            <select
              className={fieldClass}
              value={pdfTopic}
              onChange={(e) => setPdfTopic(e.target.value)}
            >
              <option value="">பாட அலகைத் தேர்ந்தெடு</option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name} ({topic.nameEn})
                </option>
              ))}
            </select>

            <input
              className={fieldClass}
              value={pdfFileName}
              onChange={(e) => setPdfFileName(e.target.value)}
              placeholder="உதாரணம்: cell-biology.pdf"
            />

            <textarea
              className={fieldClass}
              value={pdfDescription}
              onChange={(e) => setPdfDescription(e.target.value)}
              placeholder="PDF விளக்கம் (விருப்பம்)"
              rows={4}
            />

            <button
              className={buttonClass}
              disabled={busy}
              type="submit"
            >
              <Plus size={16} />
              {busy ? 'சேமிக்கிறது...' : 'PDF விவரங்களைச் சேர்'}
            </button>

            <p className="text-xs text-slate-500">
              PDF கோப்பை முதலில் Hosting folder-ல் சேர்த்து
              Deploy செய்திருக்க வேண்டும்.
            </p>
          </form>

          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">
              PDF பட்டியல் ({pdfs.length})
            </h2>

            <div className="space-y-3">
              {pdfs.map((pdf) => (
                <article
                  key={pdf.id}
                  className="rounded-xl border p-4"
                >
                  <h3 className="font-semibold">
                    {pdf.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {pdf.topic}
                  </p>

                  <a
                    href={pdf.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-emerald-700 underline"
                  >
                    PDF திறக்கவும்
                  </a>

                  <button
                    type="button"
                    onClick={() => void removePdf(pdf.id)}
                    className="ml-4 text-sm text-red-600"
                  >
                    நீக்கு
                  </button>
                </article>
              ))}

              {pdfs.length === 0 && (
                <p className="text-center text-sm text-slate-500">
                  PDF பதிவுகள் இல்லை.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
