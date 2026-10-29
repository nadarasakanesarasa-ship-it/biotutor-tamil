import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGooglePopup,
    sendPasswordReset,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTabChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    clearError();
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const ok = await signInWithEmail(email, password);
        if (ok) {
          onClose();
        }
      } else if (mode === 'signup') {
        const ok = await signUpWithEmail(email, password, confirmPassword, displayName);
        if (ok) {
          onClose();
        }
      } else if (mode === 'reset') {
        const ok = await sendPasswordReset(email);
        if (ok) {
          setSuccessMsg('கடவுச்சொல் மீட்டெடுக்கும் இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது (Password reset link sent).');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setSuccessMsg(null);
    setLoading(true);
    try {
      const ok = await signInWithGooglePopup();
      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'signin' && 'உள்நுழைக (Sign In)'}
              {mode === 'signup' && 'மாணவர் பதிவு (Registration)'}
              {mode === 'reset' && 'கடவுச்சொல் மீட்பு (Reset Password)'}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              BioTutor Tamil — A/L Biology தமிழில் கற்போம்
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            உள்நுழைக
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            பதிவு செய்க
          </button>
          <button
            onClick={() => handleTabChange('reset')}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'reset'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            மீட்டெடுப்பு
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Error Message Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In Quick Button */}
          {mode !== 'reset' && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-2xs transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google மூலம் தொடர்க</span>
            </button>
          )}

          {mode !== 'reset' && (
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-gray-400 uppercase font-medium">அல்லது</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  மாணவரின் பெயர் (Display Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="கவிதா நவரத்தினம்"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                மின்னஞ்சல் (Email Address)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    கடவுச்சொல் (Password)
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('reset')}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      கடவுச்சொல் மறந்ததா?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="குறைந்தது 6 எழுத்துக்கள்"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  கடவுச்சொல்லை உறுதிப்படுத்தவும் (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="மீண்டும் கடவுச்சொல்லை உள்ளிடவும்"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'உள்நுழைக'}
                    {mode === 'signup' && 'கணக்கை உருவாக்கு'}
                    {mode === 'reset' && 'மீட்டெடுப்பு இணைப்பை அனுப்பு'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            பாதுகாப்பான Firebase அங்கீகாரம். உங்கள் கடவுச்சொல் என்க்ரிப்ட் செய்யப்பட்டு பாதுகாக்கப்படுகிறது.
          </p>
        </div>
      </div>
    </div>
  );
};
