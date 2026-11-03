import React from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Award,
  DollarSign,
  Lock,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface ProfileViewProps {
  openAuthModal: () => void;
  openSetupGuide: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ openAuthModal, openSetupGuide }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { userQuizResults } = useData();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">உள்நுழையவும்</h2>
          <p className="text-xs text-gray-500">
            உங்கள் சுயவிவரம் மற்றும் கற்றல் முன்னேற்றத்தைக் காண கணக்கில் உள்நுழைய வேண்டும்.
          </p>
        </div>
        <button
          onClick={openAuthModal}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          உள்நுழைக / புதிய கணக்கை உருவாக்கு
        </button>
      </div>
    );
  }

  const totalQuizzes = userQuizResults.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(userQuizResults.reduce((acc, r) => acc + r.percentage, 0) / totalQuizzes)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-emerald-500/20">
            {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {userProfile?.displayName || 'மாணவர்'}
              </h2>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  நிர்வாகி (Admin)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  மாணவர் (Student)
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentUser.email}</span>
            </p>

            <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3 h-3" />
              <span>பதிவுசெய்த தேதி: {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('ta-LK')}</span>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs border border-red-200 transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>வெளியேறு (Logout)</span>
        </button>
      </div>

      {/* Learning Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">முடித்த மாதிரித் தேர்வுகள்</div>
            <div className="text-xl font-extrabold text-gray-900">{totalQuizzes} தேர்வுகள்</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">சராசரிப் புள்ளி வீதம்</div>
            <div className="text-xl font-extrabold text-gray-900">
              {totalQuizzes > 0 ? `${averageScore}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quiz Attempts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>பயிற்சி வினாக்களின் வரலாறு (Quiz History)</span>
        </h3>

        {userQuizResults.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            நீங்கள் இன்னும் மாதிரிப் பயிற்சிகளை மேற்கொள்ளவில்லை. "பயிற்சிகள்" பகுதிக்குச் சென்று வினாக்களுக்கு விடையளிக்கவும்.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">அலகு / தலைப்பு</th>
                  <th className="py-2.5 px-3 font-semibold">புள்ளிகள்</th>
                  <th className="py-2.5 px-3 font-semibold">சதவீதம்</th>
                  <th className="py-2.5 px-3 font-semibold">தேதி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userQuizResults.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-800">{r.topic}</td>
                    <td className="py-2.5 px-3 text-gray-600">{r.score} / {r.total}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{r.percentage}%</td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {new Date(r.completedAt).toLocaleDateString('ta-LK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cost Control & Budgeting Transparency (Target: LKR 500/month or less) */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span>செலவுக் கட்டுப்பாடு & பட்ஜெட் (Cost Control - LKR 500 / Month Target)</span>
          </h3>
          <button
            onClick={openSetupGuide}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>வழிகாட்டி காண்க</span>
          </button>
        </div>

        <p className="text-xs text-emerald-900 leading-relaxed">
          BioTutor Tamil தளம் இலங்கை மாணவர்களுக்காக மிகக்குறைந்த செலவில் (மாதம் LKR 500 அல்லது இலவச அடுக்குக்குள்) இயங்கும் வகையில் வடிவமைக்கப்பட்டுள்ளது:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div className="font-bold text-emerald-900">Gemini 3.8 Flash</div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              இலவச அடுக்கில் (Free Tier) நிமிடத்திற்கு 15 வினாக்கள் வரை கட்டணமின்றி பயன்படுத்தலாம்.
            </div>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div className="font-bold text-emerald-900">Cloud Firestore</div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              Spark Plan மூலம் நாளொன்றுக்கு 50,000 வாசிப்புகளும் 20,000 பதிவுகளும் முற்றிலும் இலவசம்.
            </div>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div className="font-bold text-emerald-900">வீண்விரயத் தடுப்பு</div>
            <div className="text-[11px] text-gray-600 mt-0.5">
              கேள்வி வரம்புகள் (Rate limits) மற்றும் உள்ளக தற்காலிக சேமிப்பு (caching) மூலம் எதிர்பாராத கட்டணங்கள் தடுக்கப்படுகின்றன.
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-600" />
          <span>தனியுரிமை மற்றும் பொறுப்பான பயன்பாடு (Privacy Notice)</span>
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          கற்றல் சேவைக்கு அவசியமான மின்னஞ்சல், பெயர் மற்றும் மாதிரித் தேர்வு புள்ளிகள் மட்டுமே சேமிக்கப்படுகின்றன.
          மாணவர்களின் தனிப்பட்ட தகவல்கள் எக்காரணம் கொண்டும் மூன்றாம் நபர்களுக்கு பகிரப்பட மாட்டாது. விளம்பரங்களோ அல்லது மறைமுக கண்காணிப்புகளோ இத்தளத்தில் இல்லை.
        </p>
      </div>
    </div>
  );
};
