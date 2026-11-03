import React, { useEffect, useState } from 'react';
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
import { PublicQuizQuestion } from '../types';

export const PracticeQuizView: React.FC = () => {
  const { currentUser } = useAuth();
  const { topics, quizQuestions } = useData();
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [questions, setQuestions] = useState<PublicQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<
  { questionId: string; selectedIndex: number }[]
>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [gradedAnswers, setGradedAnswers] = useState<
  {
    questionId: string;
    selectedIndex: number;
    correct: boolean;
    correctIndex: number;
    explanation: string;
  }[]
>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Load safe questions from the authenticated server endpoint.
useEffect(() => {
  if (quizQuestions.length === 0) {
    setQuestions([]);
    return;
  }

  const pool = selectedTopic === 'all'
    ? quizQuestions
    : quizQuestions.filter((q) =>
        q.topic.toLowerCase().includes(selectedTopic.toLowerCase())
      );

  setQuestions(pool);
  restartQuiz(pool);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [quizQuestions]);

  // Filter or initialize questions
  const handleTopicChange = (topicName: string) => {
  setSelectedTopic(topicName);

  const pool =
    topicName === 'all'
      ? quizQuestions
      : quizQuestions.filter((q) =>
          q.topic.toLowerCase().includes(topicName.toLowerCase())
        );

  setQuestions(pool);
  restartQuiz(pool);
  setAiNotice(null);
};

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
  if (selectedOption === null || isAnswerSubmitted) return;

  setIsAnswerSubmitted(true);
};

  const handleNextQuestion = async () => {
  if (selectedOption === null || !currentUser) return;

  const currentAnswer = {
    questionId: questions[currentIndex].id,
    selectedIndex: selectedOption,
  };

  const allAnswers = [...submittedAnswers, currentAnswer];

  if (currentIndex + 1 < questions.length) {
    setSubmittedAnswers(allAnswers);
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    return;
  }

  try {
    const idToken = await currentUser.getIdToken();

    const response = await fetch(
      'http://127.0.0.1:5001/biotutor-tamil/asia-south1/gradeQuizAttempt',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          topic: selectedTopic === 'all'
            ? 'General A/L Biology'
            : selectedTopic,
          answers: allAnswers,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'α««α«ñα«┐α«¬α»ìα«¬α»åα«úα»ì α«òα«úα«òα»ìα«òα«┐α«ƒ α««α»üα«ƒα«┐α«»α«╡α«┐α«▓α»ìα«▓α»ê.');
    }

    setScore(result.score);
    setGradedAnswers(result.gradedAnswers);
    setIsQuizComplete(true);
  } catch (error) {
    console.error('Quiz grading error:', error);
    alert('α««α«ñα«┐α«¬α»ìα«¬α»åα«úα»ì α«òα«úα«òα»ìα«òα«┐α«ƒα»üα«╡α«ñα«┐α«▓α»ì α«¬α«┐α«┤α»ê. α««α»Çα«úα»ìα«ƒα»üα««α»ì α««α»üα«»α«▒α»ìα«Üα«┐α«òα»ìα«òα«╡α»üα««α»ì.');
  }
};

  const restartQuiz = (newQuestions?: PublicQuizQuestion[]) => {
  if (newQuestions) setQuestions(newQuestions);

  setCurrentIndex(0);
  setSelectedOption(null);
  setIsAnswerSubmitted(false);
  setScore(0);
  setSubmittedAnswers([]);
  setIsQuizComplete(false);
  setGradedAnswers([]);
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
          ...(currentUser ? {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          } : {}),
        },
        body: JSON.stringify({ topic: topicForAi, count: 5 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || 'α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ê α«ëα«░α»üα«╡α«╛α«òα»ìα«ò α««α»üα«ƒα«┐α«»α«╡α«┐α«▓α»ìα«▓α»ê.');
      }

      setQuestions(data.questions);
      setAiNotice('AI-α«åα«▓α»ì α«ëα«░α»üα«╡α«╛α«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒ α««α«╛α«ñα«┐α«░α«┐α«¬α»ì α«¬α«»α«┐α«▒α»ìα«Üα«┐α«òα«│α»ì α«Åα«▒α»ìα«▒α«¬α»ìα«¬α«ƒα»ìα«ƒα«⌐ (α«çα«ñα»ü α«àα«ñα«┐α«òα«╛α«░α«¬α»ìα«¬α»éα«░α»ìα«╡ α«òα«ƒα«¿α»ìα«ñα«òα«╛α«▓ α«╡α«┐α«⌐α«╛α«ñα»ìα«ñα«╛α«│α»ì α«àα«▓α»ìα«▓).');
      restartQuiz(data.questions);
    } catch (err: any) {
      alert('α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ì α«ëα«░α»üα«╡α«╛α«òα»ìα«òα»üα«╡α«ñα«┐α«▓α»ì α«¬α«┐α«┤α»ê: ' + (err?.message || 'Server error'));
    } finally {
      setIsAiGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];
  const percentage =
  questions.length > 0
    ? Math.round((score / questions.length) * 100)
    : 0;
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <span>α««α«╛α«ñα«┐α«░α«┐α«¬α»ì α«¬α«»α«┐α«▒α»ìα«Üα«┐α«òα«│α»ì (Practice Questions)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            α«çα«▓α«Öα»ìα«òα»ê α«ëα«»α«░α»ìα«ñα«░ α«ëα«»α«┐α«░α«┐α«»α«▓α»ì 5-α«ñα»åα«░α«┐α«╡α»ü α«¬α«▓α»ìα«ñα»çα«░α»ìα«╡α»ü α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ì (5-Option MCQs)
          </p>
        </div>

        {/* Generate with AI Button */}
        <button
          onClick={handleGenerateAiQuiz}
          disabled={true}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isAiGenerating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-200" />
          )}
          <span>AI α«¬α»üα«ñα«┐α«» α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ê α«ëα«░α»üα«╡α«╛α«òα»ìα«òα»ü</span>
        </button>
      </div>

      {/* Topic Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700">α«àα«▓α«òα»ü α«ñα»åα«░α«┐α«╡α»ü:</span>
          <select
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="flex-1 sm:flex-initial text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-700 font-semibold focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">α«àα«⌐α»êα«ñα»ìα«ñα»ü α«àα«▓α«òα»üα«òα«│α»üα««α»ì (All Topics)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-gray-500">
          α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ì: <span className="font-bold text-gray-900">{questions.length}</span>
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
              α«╡α«┐α«⌐α«╛ <span className="text-gray-900 text-sm font-bold">{currentIndex + 1}</span> / {questions.length}
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

    let optionStyle =
      'border-gray-200 bg-white hover:bg-gray-50 text-gray-800';

    if (isSelected) {
      optionStyle =
        'border-amber-500 bg-amber-50 text-amber-900 font-semibold ring-2 ring-amber-400/40';
    } else if (isAnswerSubmitted) {
      optionStyle = 'border-gray-200 bg-gray-50/50 text-gray-500';
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
      </button>
    );
  })}
</div>

{/* Answer Submission Notice */}
{isAnswerSubmitted && (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-800">
    α«ëα«Öα»ìα«òα«│α»ì α«¬α«ñα«┐α«▓α»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»α«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü. α««α»üα«┤α»ü α««α«ñα«┐α«¬α»ìα«¬α»Çα«ƒα»üα««α»ì α«Üα«░α«┐α«»α«╛α«⌐ α«╡α«┐α«ƒα»êα«òα«│α»üα«òα»ìα«òα«╛α«⌐ α«╡α«┐α«│α«òα»ìα«òα«Öα»ìα«òα«│α»üα««α»ì α«¬α«»α«┐α«▒α»ìα«Üα«┐ α««α»üα«ƒα«┐α«╡α«┐α«▓α»ì α«òα«╛α«ƒα»ìα«ƒα«¬α»ìα«¬α«ƒα»üα««α»ì.
  </div>
)}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">
              α«¬α»üα«│α»ìα«│α«┐α«òα«│α»ì: <strong className="text-gray-800">{score}</strong>
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-40"
              >
                α«╡α«┐α«ƒα»êα«»α»êα«Üα»ì α«Üα««α«░α»ìα«¬α»ìα«¬α«┐ (Submit)
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{currentIndex + 1 < questions.length ? 'α«àα«ƒα»üα«ñα»ìα«ñ α«╡α«┐α«⌐α«╛ (Next)' : 'α««α»üα«ƒα«┐α«╡α»üα«òα«│α»êα«òα»ì α«òα«╛α«úα»ìα«ò (Finish)'}</span>
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
              α«¬α«»α«┐α«▒α»ìα«Üα«┐ α«¿α«┐α«▒α»êα«╡α«ƒα»êα«¿α»ìα«ñα«ñα»ü! ≡ƒÄë
            </h3>
            <p className="text-xs text-gray-500">
              {selectedTopic === 'all' ? 'α«àα«⌐α»êα«ñα»ìα«ñα»ü α«àα«▓α«òα»üα«òα«│α»üα«òα»ìα«òα»üα««α«╛α«⌐' : selectedTopic} α««α«╛α«ñα«┐α«░α«┐α«¬α»ì α«¬α«»α«┐α«▒α»ìα«Üα«┐ α««α»üα«ƒα«┐α«╡α»üα«òα«│α»ì
            </p>
          </div>

          {/* Score Badge */}
          <div className="inline-block p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl shadow-xs">
            <div className="text-4xl font-black text-emerald-700">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-emerald-900 mt-1">
              α«ñα»çα«░α»ìα«Üα»ìα«Üα«┐ α«╡α»Çα«ñα««α»ì: {percentage}%
            </div>
          </div>
          {/* Final Answer Review */}
<div className="text-left space-y-4">
  <h4 className="text-lg font-bold text-gray-900">
    α«╡α«┐α«ƒα»êα«òα«│α«┐α«⌐α»ì α«╡α«┐α«│α«òα»ìα«òα««α»ì (Answer Review)
  </h4>

  {gradedAnswers.map((answer, index) => {
    const question = questions.find(
      (q) => q.id === answer.questionId
    );

    if (!question) return null;

    return (
      <div
        key={answer.questionId}
        className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2"
      >
        <p className="font-semibold text-gray-900">
          {index + 1}. {question.question}
        </p>

        <p className={answer.correct ? 'text-emerald-700' : 'text-red-700'}>
          α«ëα«Öα»ìα«òα«│α»ì α«¬α«ñα«┐α«▓α»ì: {question.options[answer.selectedIndex]}
        </p>

        <p className="text-emerald-700 font-semibold">
          α«Üα«░α«┐α«»α«╛α«⌐ α«╡α«┐α«ƒα»ê: {question.options[answer.correctIndex]}
        </p>

        <p className="text-sm text-gray-700 leading-relaxed">
          α«╡α«┐α«│α«òα»ìα«òα««α»ì: {answer.explanation}
        </p>
      </div>
    );
  })}
</div>

          <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
            {percentage >= 80
              ? 'α««α«┐α«òα«Üα»ìα«Üα«┐α«▒α«¿α»ìα«ñ α«¬α»åα«▒α»üα«¬α»çα«▒α»ü! α«ëα«»α«┐α«░α«┐α«»α«▓α»ì α«Äα«úα»ìα«úα«òα»ìα«òα«░α»üα«òα»ìα«òα«│α«┐α«▓α»ì α«¿α»Çα«Öα»ìα«òα«│α»ì α«Üα«┐α«▒α«¿α»ìα«ñα»ü α«╡α«┐α«│α«Öα»ìα«òα»üα«òα«┐α«▒α»Çα«░α»ìα«òα«│α»ì.'
              : percentage >= 50
              ? 'α«¿α«▓α»ìα«▓ α««α»üα«»α«▒α»ìα«Üα«┐! α«ñα«╡α«▒α«╛α«⌐ α«╡α«┐α«ƒα»êα«òα«│α»üα«òα»ìα«òα«╛α«⌐ α«╡α«┐α«│α«òα»ìα«òα«Öα»ìα«òα«│α»ê α««α»Çα«úα»ìα«ƒα»üα««α»ì α«╡α«╛α«Üα«┐α«ñα»ìα«ñα»ü α«ñα«┐α«░α»üα«ñα»ìα«ñα«┐α«òα»ì α«òα»èα«│α»ìα«│α«╡α»üα««α»ì.'
              : 'α«ñα»èα«ƒα«░α»ìα«¿α»ìα«ñα»ü α«¬α«»α«┐α«▒α»ìα«Üα«┐α«òα«│α»ê α««α»çα«▒α»ìα«òα»èα«│α»ìα«│α«╡α»üα««α»ì. α«òα»üα«▒α«┐α«¬α»ìα«¬α»üα«òα«│α»êα«»α»üα««α»ì AI α«åα«Üα«┐α«░α«┐α«»α«░α«┐α«⌐α»ì α«╡α«┐α«│α«òα»ìα«òα«Öα»ìα«òα«│α»êα«»α»üα««α»ì α«¬α«»α«⌐α»ìα«¬α«ƒα»üα«ñα»ìα«ñα«╡α»üα««α»ì.'}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => restartQuiz()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>α««α»Çα«úα»ìα«ƒα»üα««α»ì α«¬α«»α«┐α«▒α»ìα«Üα«┐ α«Üα»åα«»α»ì (Retry)</span>
            </button>

            <button
              onClick={handleGenerateAiQuiz}
              disabled={isAiGenerating}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>α«¬α»üα«ñα«┐α«» AI α«╡α«┐α«⌐α«╛α«òα»ìα«òα«│α»ì</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
