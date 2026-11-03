
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface HomeDashboardProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openSetupGuide: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentTab,
  openAuthModal,
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'ta';

  const { currentUser, userProfile } = useAuth();
  const { topics, notes, pdfs, userQuizResults } = useData();

  const totalQuizzesTaken = userQuizResults.length;

  const averageScore =
    totalQuizzesTaken > 0
      ? Math.round(
          userQuizResults.reduce(
            (acc, result) => acc + result.percentage,
            0
          ) / totalQuizzesTaken
        )
      : 0;

  const recentNotes = notes.slice(0, 3);
  const recentPdfs = pdfs.slice(0, 2);

  return (
    <div className="space-y-8 pb-12">

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">

        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('heroTag')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {currentUser ? (
              <span>
                {t('welcome')},{' '}
                <span className="text-emerald-300">
                  {userProfile?.displayName || t('student')}
                </span>!
              </span>
            ) : (
              <span>
                BioTutor Tamil —{' '}
                <span className="text-emerald-300">
                  {t('guestTitle')}
                </span>
              </span>
            )}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            {t('heroDescription')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">

            <button
              onClick={() => setCurrentTab('tutor')}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-sm font-bold shadow-md transition-all flex items-center gap-2 group"
            >
              <Bot className="w-4 h-4 text-emerald-700" />
              <span>{t('askTutor')}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentTab('quiz')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-sm font-semibold border border-emerald-500/50 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('practiceQuestions')}</span>
            </button>

            {!currentUser && (
              <button
                onClick={openAuthModal}
                className="px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-emerald-100 text-xs font-medium border border-white/10 transition-colors"
              >
                {t('studentLogin')}
              </button>
            )}

          </div>
        </div>
      </section>

      {/* Student Progress */}
      {currentUser && (
        <section className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{t('learningProgress')}</span>
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                {t('progressDescription')}
              </p>
            </div>

            <div className="flex items-center gap-6">

              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t('completedQuizzes')}
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {totalQuizzesTaken}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t('averageScore')}
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {totalQuizzesTaken > 0
                      ? `${averageScore}%`
                      : '—'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Feature Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* AI Tutor */}
        <div
          onClick={() => setCurrentTab('tutor')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{t('aiTutorTitle')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>

          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {t('aiTutorDescription')}
          </p>

          <div className="mt-3 text-[11px] font-semibold text-purple-600">
            {t('askQuestion')} →
          </div>
        </div>

        {/* Notes */}
        <div
          onClick={() => setCurrentTab('notes')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{t('notesTitle')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>

          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {t('notesDescription')}
          </p>

          <div className="mt-3 text-[11px] font-semibold text-emerald-600">
            {t('notesCount', { count: notes.length })} →
          </div>
        </div>

        {/* PDF Library */}
        <div
          onClick={() => setCurrentTab('pdfs')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{t('pdfTitle')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>

          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {t('pdfDescription')}
          </p>

          <div className="mt-3 text-[11px] font-semibold text-blue-600">
            {t('pdfCount', { count: pdfs.length })} →
          </div>
        </div>

        {/* Quizzes */}
        <div
          onClick={() => setCurrentTab('quiz')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{t('quizTitle')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>

          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {t('quizDescription')}
          </p>

          <div className="mt-3 text-[11px] font-semibold text-amber-600">
            {t('practiceNow')} →
          </div>
        </div>

      </section>

      {/* Biology Topics */}
      <section className="space-y-4">

        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>{t('biologyUnits')}</span>
          </h2>

          <p className="text-xs text-gray-500">
            {t('unitsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {topics.map((topic) => {
            const count = notes.filter(
              (note) =>
                note.topic.toLowerCase().includes(topic.name.toLowerCase()) ||
                note.topic.toLowerCase().includes(topic.nameEn.toLowerCase())
            ).length;

            return (
              <div
                key={topic.id}
                onClick={() => setCurrentTab('notes')}
                className="bg-white p-4 rounded-xl border border-gray-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1">
                  <span>{t('unit')} {topic.order}</span>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                    {t('unitNoteCount', { count })}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                  {language === 'ta' ? topic.name : topic.nameEn}
                </h4>

                {language === 'ta' && (
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {topic.nameEn}
                  </p>
                )}
              </div>
            );
          })}

        </div>
      </section>

      {/* Recent Notes and PDFs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{t('recentNotes')}</span>
            </h3>

            <button
              onClick={() => setCurrentTab('notes')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {t('viewAll')}
            </button>
          </div>

          <div className="space-y-3">

            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setCurrentTab('notes')}
                className="p-3 rounded-xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-semibold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  {note.topic}
                </span>

                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">
                  {note.title}
                </h4>

                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {note.content.replace(/[#*`|]/g, '').slice(0, 120)}...
                </p>
              </div>
            ))}

            {recentNotes.length === 0 && (
              <p className="text-xs text-gray-500">
                {t('notesDescription')}
              </p>
            )}

          </div>
        </div>

        {/* Recent PDFs */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>{t('recentPdfs')}</span>
            </h3>

            <button
              onClick={() => setCurrentTab('pdfs')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              {t('goToLibrary')}
            </button>
          </div>

          <div className="space-y-3">

            {recentPdfs.map((pdf) => (
              <div
                key={pdf.id}
                onClick={() => setCurrentTab('pdfs')}
                className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">

                  <span className="text-[10px] font-semibold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                    {pdf.topic}
                  </span>

                  <h4 className="text-xs font-bold text-gray-900 mt-1 truncate">
                    {pdf.title}
                  </h4>

                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    {pdf.description || pdf.fileName}
                  </p>

                  {pdf.extractedText && (
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 font-medium">
                      ✓ {t('textSearchable')}
                    </span>
                  )}

                </div>
              </div>
            ))}

            {recentPdfs.length === 0 && (
              <p className="text-xs text-gray-500">
                {t('pdfDescription')}
              </p>
            )}

          </div>
        </div>

      </section>
    </div>
  );
};
