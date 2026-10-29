import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { INITIAL_QUIZ_QUESTIONS } from '../data/seedData';
import { QuizQuestion } from '../types';

export const PracticeQuizView: React.FC = () => {
  const { currentUser } = useAuth();
  const { topics, recordQuizResult } = useData();

  const [selectedTopic, setSelectedTopic] = useState('all');
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Filter or initialize questions
  const handleTopicChange = (topicName: string) => {
    setSelectedTopic(topicName);
    const pool =
      topicName === 'all'
        ? INITIAL_QUIZ_QUESTIONS
        : INITIAL_QUIZ_QUESTIONS.filter((q) =>
            q.topic.toLowerCase().includes(topicName.toLowerCase())
          );
    setQuestions(pool.length > 0 ? pool : INITIAL_QUIZ_QUESTIONS);
    restartQuiz(pool.length > 0 ? pool : INITIAL_QUIZ_QUESTIONS);
    setAiNotice(null);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
      // Persist results if logged in
      const topicLabel = selectedTopic === 'all' ? 'General A/L Biology' : selectedTopic;
      await recordQuizResult(topicLabel, score + (selectedOption === questions[currentIndex].correctIndex ? 1 : 0), questions.length);
    }
  };

  const restartQuiz = (newQuestions?: QuizQuestion[]) => {
    if (newQuestions) setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  // Generate Fresh AI Practice Questions via Server API
  const handleGenerateAiQuiz = async () => {
    setIsAiGenerating(true);
    setAiNotice(null);
    try {
      const topicForAi = selectedTopic === 'all' ? 'General A/L Biology' : selectedTopic;
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.uid || 'anonymous',
        },
        body: JSON.stringify({ topic: topicForAi, count: 5 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || 'வினாக்களை உருவாக்க முடியவில்லை.');
      }

      setQuestions(data.questions);
      setAiNotice('AI-ஆல் உருவாக்கப்பட்ட மாதிரிப் பயிற்சிகள் ஏற்றப்பட்டன (இது அதிகாரப்பூர்வ கடந்தகால வினாத்தாள் அல்ல).');
      restartQuiz(data.questions);
    } catch (err: any) {
      alert('வினாக்கள் உருவாக்குவதில் பிழை: ' + (err?.message || 'Server error'));
    } finally {
      setIsAiGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <span>மாதிரிப் பயிற்சிகள் (Practice Questions)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            இலங்கை உயர்தர உயிரியல் 5-தெரிவு பல்தேர்வு வினாக்கள் (5-Option MCQs)
          </p>
        </div>

        {/* Generate with AI Button */}
        <button
          onClick={handleGenerateAiQuiz}
          disabled={isAiGenerating}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isAiGenerating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-200" />
          )}
          <span>AI புதிய வினாக்களை உருவாக்கு</span>
        </button>
      </div>

      {/* Topic Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700">அலகு தெரிவு:</span>
          <select
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="flex-1 sm:flex-initial text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-700 font-semibold focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">அனைத்து அலகுகளும் (All Topics)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-gray-500">
          வினாக்கள்: <span className="font-bold text-gray-900">{questions.length}</span>
        </div>
      </div>

      {/* AI Practice Notice Disclaimer */}
      {aiNotice && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Quiz Card */}
      {!isQuizComplete && currentQ ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-4">
            <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {currentQ.topic}
            </span>
            <div className="font-semibold">
              வினா <span className="text-gray-900 text-sm font-bold">{currentIndex + 1}</span> / {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed font-sans">
            {currentQ.question}
          </h3>

          {/* 5 Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-red-400 bg-red-50 text-red-900 font-medium';
                } else {
                  optionStyle = 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-70';
                }
              } else if (isSelected) {
                optionStyle = 'border-amber-500 bg-amber-50 text-amber-900 font-semibold ring-2 ring-amber-400/40';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner (Shows after submit) */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-700 space-y-1.5 animate-in fade-in duration-200">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>சரியான விடைக்கான விளக்கம் (Explanation):</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">
              புள்ளிகள்: <strong className="text-gray-800">{score}</strong>
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-40"
              >
                விடையைச் சமர்ப்பி (Submit)
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{currentIndex + 1 < questions.length ? 'அடுத்த வினா (Next)' : 'முடிவுகளைக் காண்க (Finish)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Completed Score Card */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-md text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-gray-900">
              பயிற்சி நிறைவடைந்தது! 🎉
            </h3>
            <p className="text-xs text-gray-500">
              {selectedTopic === 'all' ? 'அனைத்து அலகுகளுக்குமான' : selectedTopic} மாதிரிப் பயிற்சி முடிவுகள்
            </p>
          </div>

          {/* Score Badge */}
          <div className="inline-block p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl shadow-xs">
            <div className="text-4xl font-black text-emerald-700">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-emerald-900 mt-1">
              தேர்ச்சி வீதம்: {percentage}%
            </div>
          </div>

          <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
            {percentage >= 80
              ? 'மிகச்சிறந்த பெறுபேறு! உயிரியல் எண்ணக்கருக்களில் நீங்கள் சிறந்து விளங்குகிறீர்கள்.'
              : percentage >= 50
              ? 'நல்ல முயற்சி! தவறான விடைகளுக்கான விளக்கங்களை மீண்டும் வாசித்து திருத்திக் கொள்ளவும்.'
              : 'தொடர்ந்து பயிற்சிகளை மேற்கொள்ளவும். குறிப்புகளையும் AI ஆசிரியரின் விளக்கங்களையும் பயன்படுத்தவும்.'}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => restartQuiz()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>மீண்டும் பயிற்சி செய் (Retry)</span>
            </button>

            <button
              onClick={handleGenerateAiQuiz}
              disabled={isAiGenerating}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>புதிய AI வினாக்கள்</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
