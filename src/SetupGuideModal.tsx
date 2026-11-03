import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Server,
  Key,
  Layers,
} from 'lucide-react';
import { BOOTSTRAP_ADMIN_EMAIL } from '../lib/firebase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'admin' | 'costs' | 'checklist'>('firebase');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <span>BioTutor Tamil — ஆரம்ப வழிகாட்டி & அமைவு (Setup Guide)</span>
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Firebase அமைவு, நிர்வாகி அணுகல் மற்றும் செலவுக் கட்டுப்பாட்டு வழிகாட்டல்
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-5 text-center transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            1. Firebase & Auth அமைவு
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-5 text-center transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'admin'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            2. நிர்வாகி (Admin) அனுமதி
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`py-3 px-5 text-center transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'costs'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            3. பட்ஜெட் & செலவுக் கட்டுப்பாடு (LKR 500)
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-5 text-center transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            4. சரிபார்ப்புப் பட்டியல் (Checklist)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-gray-700 leading-relaxed font-sans">
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  தானியங்கி முறையில் இணைக்கப்பட்ட திட்டம் (Automated Setup)
                </h4>
                <p>
                  இச்செயலிக்குரிய Firebase திட்டம் (<code className="bg-white px-1.5 py-0.5 rounded text-emerald-800 font-mono">peppy-cat-c61jg</code>) மற்றும் Firestore தரவுத்தளம் வெற்றிகரமாக உருவாக்கப்பட்டு விதிகளும் பயன்படுத்தப்பட்டுள்ளன.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">Firebase Console இல் செய்ய வேண்டிய அமைவுகள்:</h4>

                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900">படி 1: Authentication வழங்குநர்களை செயல்படுத்துதல் (Enable Providers)</strong>
                    <p className="mt-1">
                      1. <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Firebase Console</a> இற்குச் செல்லவும்.<br />
                      2. உங்கள் திட்டம் &gt; <strong>Build &gt; Authentication &gt; Sign-in method</strong> என்பதைத் தெரிவு செய்க.<br />
                      3. <strong>Email/Password</strong> என்பதை கிளிக் செய்து Enable செய்க.<br />
                      4. <strong>Google</strong> வழங்குநரையும் இயலுமைப்படுத்துங்கள் (Enable Google).
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900">படி 2: Authorized Domains சேர்த்தல்</strong>
                    <p className="mt-1">
                      Authentication &gt; Settings &gt; <strong>Authorized domains</strong> பகுதியில் தற்போதைய செயலி டொமைன் சேர்க்கப்பட்டுள்ளதை உறுதிப்படுத்தவும்:
                      <code className="block bg-white p-1 rounded font-mono text-[11px] mt-1 border">
                        ais-dev-jlaqb2l7o5vdxrp7fkrasw-988960633180.asia-east1.run.app
                      </code>
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900">படி 3: Gemini API Key</strong>
                    <p className="mt-1">
                      Google AI Studio Build இன் <strong>Settings &gt; Secrets</strong> பகுதியில் <code className="bg-white px-1 py-0.5 font-mono">GEMINI_API_KEY</code> சேர்க்கப்பட்டுள்ளது. சேவையகத்தில் (server.ts) மட்டுமே பயன்படுத்தப்படுவதால் பாதுகாப்பானது.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  முன்னியக்க நிர்வாகி மின்னஞ்சல் (Bootstrap Admin)
                </h4>
                <p>
                  நிர்வாகி அனுமதிகள் எக்காரணம் கொண்டும் பயனர் பக்கத்தில் (client-side) தன்னிச்சையாக மாற்றப்பட முடியாது.
                  உங்கள் மின்னஞ்சல் முகவரி:
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-amber-950 text-xs">
                  {BOOTSTRAP_ADMIN_EMAIL}
                </div>
                <p className="text-[11px] text-amber-800">
                  நீங்கள் இந்த மின்னஞ்சல் மூலம் உள்நுழையும்போது, தானாகவே நிர்வாகி அதிகாரம் (Admin Role) வழங்கப்பட்டு புதிய குறிப்புகள் மற்றும் PDF ஆவணங்களை சேர்க்கும் வசதி கிடைக்கும்.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-sm">நிர்வாகி சிறப்புரிமைகள் (Admin Privileges):</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>புதிய உயிரியல் குறிப்புகளை சேர்த்தல், திருத்துதல் மற்றும் நீக்குதல்.</li>
                  <li>PDF ஆவணங்களை பதிவேற்றுதல் மற்றும் தானியங்கி உரை பிரித்தெடுத்தலை நிர்வகித்தல்.</li>
                  <li>பயிற்சி வினாக்கள் மற்றும் அலகுகளின் உள்ளடக்கத்தை புதுப்பித்தல்.</li>
                  <li>சாதாரண மாணவர்களுக்கு பார்வை அனுமதி மட்டுமே உண்டு; திருத்தவோ நீக்கவோ முடியாது.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  இலக்கு பட்ஜெட்: மாதம் LKR 500 அல்லது அதற்கும் குறைவாக
                </h4>
                <p className="text-emerald-900">
                  இலங்கை ஆசிரியர்கள் மற்றும் மாணவர்கள் எவ்வித கட்டணச் சுமையுமின்றி பயன்படுத்தக்கூடிய வகையில் இலவச அடுக்குகளை (Free Tiers) முதன்மையாகக் கொண்டு கட்டமைக்கப்பட்டுள்ளது.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <strong className="text-gray-900 block text-xs">Gemini 3.8 Flash (AI Tutor)</strong>
                  <p className="text-[11px] text-gray-600">
                    இலவச அடுக்கில் நிமிடத்திற்கு 15 வினாக்கள் வரை அனுமதிக்கப்படுகிறது. இது மாணவர்களின் அன்றாட சந்தேகங்களுக்கு தாராளமானது.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <strong className="text-gray-900 block text-xs">Cloud Firestore (Database)</strong>
                  <p className="text-[11px] text-gray-600">
                    நாளொன்றுக்கு 50,000 ஆவண வாசிப்புகளும், 20,000 ஆவண பதிவுகளும் இலவசம்.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <strong className="text-gray-900 block text-xs">Firebase Storage (PDFs)</strong>
                  <p className="text-[11px] text-gray-600">
                    Spark Plan இல் 5GB இலவச சேமிப்பகம் வழங்கப்படுகிறது (நூற்றுக்கணக்கான A/L PDF ஆவணங்களுக்கு போதுமானது).
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <strong className="text-gray-900 block text-xs">வீண்விரயக் கட்டுப்பாடு (Rate Limiting)</strong>
                  <p className="text-[11px] text-gray-600">
                    சேவையகத்தில் (server.ts) IP/User வாரியாக 10 நிமிடங்களுக்கு 30 கேள்விகள் என்ற வரம்பு நிர்ணயிக்கப்பட்டு திடீர் செலவுகள் தடுக்கப்பட்டுள்ளன.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <strong>கவனத்திற்கு:</strong> மாணவர்களின் எண்ணிக்கை ஆயிரக்கணக்கில் உயரும் சந்தர்ப்பத்தில் மட்டுமே இலவச வரம்பு தாண்டப்படலாம். அதுவரை பூச்சிய செலவிலேயே (Zero Cost) இயக்கலாம்.
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">செயலி சரிபார்ப்புப் பட்டியல் (Verification Checklist):</h4>
              <div className="space-y-2">
                {[
                  'மாணவர் பதிவு மற்றும் கடவுச்சொல் உறுதிப்படுத்தல் (Student Registration & Confirm Password)',
                  'மின்னஞ்சல் மற்றும் கடவுச்சொல் உள்நுழைவு & வெளியேற்றம் (Login & Logout)',
                  'Google Sign-In பாப்-அப் அங்கீகாரம் (Google Authentication)',
                  'கடவுச்சொல் மீட்டெடுப்பு மின்னஞ்சல் (Password Reset via Email)',
                  'உயிரியல் குறிப்புகளை வாசித்தல் மற்றும் தேடல் (Search & Filter Notes)',
                  'நிர்வாகியாக புதிய குறிப்பைச் சேமித்தல் மற்றும் நீக்குதல் (Add/Edit/Delete Notes as Admin)',
                  'PDF ஆவணங்களைப் பார்வையிடல் & பதிவிறக்கம் (PDF Viewer & Download)',
                  'PDF இலிருந்து உரை பிரித்தெடுத்தல் & AI-ஆல் தேடுதல் (PDF Text Extraction & Grounding)',
                  'தமிழ் வழியில் AI ஆசிரியரிடம் உயிரியல் சந்தேகம் கேட்டல் (Tamil AI Tutor Q&A)',
                  'ஆங்கில கலைச்சொற்கள் அடைப்புக்குறிக்குள் கிடைத்தல் (English Terms in Parentheses)',
                  '5-தெரிவு மாதிரி வினாடி வினா & உடனடி தமிழ் விளக்கம் (5-Option Practice Quiz)',
                  'AI மூலம் புதிய பயிற்சிக் கேள்விகளை உருவாக்குதல் (AI Practice Question Generator)',
                  'மாணவர் சுயவிவரத்தில் தேர்வு முடிவுகள் தானாக சேமிக்கப்படல் (Persistent Quiz Tracking)',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            BioTutor Tamil • A/L Biology தமிழில் கற்போம்
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            சரி, புரிந்தது (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
