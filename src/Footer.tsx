import React from 'react';
import { Heart, Shield, BookOpen, Sparkles } from 'lucide-react';

interface FooterProps {
  openSetupGuide: () => void;
  openPrivacyNotice: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openSetupGuide, openPrivacyNotice }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold font-mono">
                B
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                BioTutor <span className="text-emerald-400">Tamil</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              இலங்கை க.பொ.த. உயர்தர (GCE A/L) மாணவர்களுக்கான தமிழ்வழி உயிரியல் கற்றல் தளம்.
              தமிழ் மொழியில் தெளிவான விளக்கங்கள் மற்றும் ஆங்கில கலைச்சொற்களுடன் (Scientific Terms) உயிரியலைக் கற்போம்.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> தேசிய கல்வி நிறுவக பாடத்திட்டம் (NIE Syllabus)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI வழிகாட்டல்
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">வழிகாட்டி & உதவி</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <button onClick={openSetupGuide} className="hover:text-emerald-400 transition-colors">
                  அமைவு வழிகாட்டி (Setup Guide)
                </button>
              </li>
              <li>
                <button onClick={openPrivacyNotice} className="hover:text-emerald-400 transition-colors">
                  தனியுரிமைக் கொள்கை (Privacy Policy)
                </button>
              </li>
              <li>
                <span className="text-gray-500">இலக்கு பட்ஜெட்: LKR 500 / மாதம்</span>
              </li>
              <li>
                <span className="text-gray-500">Firebase & Gemini Powered</span>
              </li>
            </ul>
          </div>

          {/* Responsibility & Safety Notice */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> பொறுப்புத் துறப்பு
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              இத்தளத்தில் வழங்கப்படும் AI பதில்கள் கற்றல் உதவிக்காக மட்டுமே. அதிகாரப்பூர்வ பரீட்சை விடைத்தாள்கள் அல்லது பாடநூல் குறிப்புகளுடன் ஒப்பிட்டு சரிபார்த்து படிக்கவும்.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} BioTutor Tamil. இலங்கை மாணவர்களின் கல்வி வளர்ச்சிக்காக உருவாக்கப்பட்டது.</p>
          <p className="flex items-center gap-1">
            மாணவர் நலன் கருதி <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" /> அன்புடன் பகிரப்படுகிறது.
          </p>
        </div>
      </div>
    </footer>
  );
};
