import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Info,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ChatMessage } from '../types';

export const AITutorView: React.FC = () => {
  const { currentUser } = useAuth();
  const { topics, retrieveRelevantContext } = useData();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `வணக்கம்! நான் உங்கள் **BioTutor Tamil** உயிரியல் ஆசிரியர்.

இலங்கை க.பொ.த. உயர்தர (GCE A/L) உயிரியல் பாடத்திட்டத்தின் கீழ் எந்தவொரு அலகிலும் (Units 1 - 10) உங்களுக்கு ஏற்படும் சந்தேகங்களை தமிழில் கேட்கலாம்.
முக்கிய விஞ்ஞான கலைச்சொற்கள் ஆங்கிலத்திலும் அடைப்புக்குறிக்குள் (in parentheses) வழங்கப்படும்.

**உதாரண கேள்விகள்:**
- *கல மென்சவ்வின் திரவ மொசைக் மாதிரியை விளக்குக (Fluid mosaic model).*
- *C3 மற்றும் C4 தாவரங்களுக்கு இடையிலான வேறுபாடுகள் யாவை?*
- *மெண்டலின் சமவல்லுருக்களின் பிரிவின் விதியை விளக்குக.*
- *மனித இரைப்பையில் புரதச் சமிபாடு எவ்வாறு நிகழ்கிறது?*`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [useUploadedNotes, setUseUploadedNotes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sampleQuestions = [
    'கல மென்சவ்வின் திரவ மொசைக் மாதிரி (Fluid Mosaic Model)',
    'C3 vs C4 ஒளிச்சேர்க்கை வேறுபாடு (Photosynthesis)',
    'மெண்டலின் இருபண்புக் கலப்பு 9:3:3:1 விகிதம் (Genetics)',
    'மனித சிறுநீரகத்தில் நெப்ரோனின் தொழிற்பாடு (Nephron)',
    'காற்றுள்ள மற்றும் காற்றற்ற சுவாசம் (Aerobic vs Anaerobic)',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
      topic: selectedTopic !== 'all' ? selectedTopic : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      // Step 1: Smart Grounding Retrieval from uploaded notes & PDF text
      let retrievedContext = '';
      if (useUploadedNotes) {
        retrievedContext = retrieveRelevantContext(textToSend, selectedTopic);
      }

      // Step 2: Build conversational history context
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Step 3: Call Server API
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.uid || 'anonymous',
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
          currentTopic: selectedTopic !== 'all' ? selectedTopic : undefined,
          notesContext: retrievedContext,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'பதில் பெறுவதில் பிழை ஏற்பட்டது.');
      }

      if (typeof data.remainingQuestions === 'number') {
        setRemainingQuestions(data.remainingQuestions);
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        text: data.answer,
        timestamp: Date.now(),
        isGrounded: Boolean(retrievedContext && retrievedContext.length > 0),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'AI ஆசிரியரைத் தொடர்புகொள்வதில் சிக்கல் ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        text: 'உரையாடல் அழிக்கப்பட்டது. உங்கள் புதிய உயிரியல் சந்தேகத்தை கேட்கலாம்!',
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      {/* Header with Title and Topic Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                AI உயிரியல் ஆசிரியர் (BioTutor AI)
              </h2>
              <p className="text-xs text-gray-500">
                A/L Biology பாடத்திட்டத்தின் அடிப்படையில் பதிலளிக்கும் நுண்ணறிவு வழிகாட்டி
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Topic Selector & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="all">அனைத்து அலகுகளும் (All Units)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.nameEn})
              </option>
            ))}
          </select>

          <button
            onClick={clearChat}
            title="உரையாடலை மீட்டமை (Clear Chat)"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grounding Context Indicator & Rate limit pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-500">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useUploadedNotes}
            onChange={(e) => setUseUploadedNotes(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
          <span className="font-medium text-gray-700">
            பதிவேற்றப்பட்ட குறிப்புகள் & PDF உரையை ஆதாரமாகக் கொள் (Ground with uploaded notes)
          </span>
        </label>

        {remainingQuestions !== null && (
          <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            மீதமுள்ள வினாக்கள்: {remainingQuestions}
          </span>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs min-h-[460px] flex flex-col overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 max-h-[560px]">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant response badges */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200/60 text-[11px]">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        BioTutor AI ஆசிரியர்
                      </span>

                      <div className="flex items-center gap-2">
                        {m.isGrounded && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px] flex items-center gap-1">
                            <BookOpen className="w-2.5 h-2.5" /> குறிப்புகள் இணைக்கப்பட்டது
                          </span>
                        )}

                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          title="பிரதியெடு (Copy)"
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content rendered with paragraphs & markdown support */}
                  <div className="whitespace-pre-wrap break-words space-y-1.5 font-sans">
                    {m.text}
                  </div>

                  {!isUser && (
                    <div className="mt-3 pt-2 text-[10px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
                      <span>கற்றல் துணைக்கருவி மட்டுமே • பாடநூலுடன் ஒப்பிட்டு படிக்கவும்</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 border border-gray-200/60 rounded-2xl rounded-bl-xs p-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  உயிரியல் ஆசிரியர் பதிலைத் தயாரிக்கிறார் (Generating response in Tamil)...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-red-500 mt-0.5">
                  தயவுசெய்து சில விநாடிகள் கழித்து மீண்டும் கேட்கவும்.
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Suggested Questions */}
        <div className="p-3 bg-gray-50/70 border-t border-gray-100 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-gray-500 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            பரிந்துரைகள்:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs bg-white hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="உயிரியல் கேள்வியை தமிழில் அல்லது ஆங்கிலத்தில் கேட்கவும்... (e.g. C3 மற்றும் C4 வேறுபாடு)"
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden disabled:bg-gray-50"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>கேட்க</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
