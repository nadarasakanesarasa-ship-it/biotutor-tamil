import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { useAuth } from "./authcontext";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openSetupGuide,
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'முகப்பு', labelEn: 'Home', icon: Home },
    { id: 'tutor', label: 'AI ஆசிரியர்', labelEn: 'AI Tutor', icon: Bot },
    { id: 'notes', label: 'குறிப்புகள்', labelEn: 'Notes', icon: BookOpen },
    { id: 'pdfs', label: 'PDF நூலகம்', labelEn: 'PDF Library', icon: FileSpreadsheet },
    { id: 'quiz', label: 'பயிற்சிகள்', labelEn: 'Practice Quiz', icon: HelpCircle },
    { id: 'profile', label: 'சுயவிவரம்', labelEn: 'Profile', icon: UserIcon },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold font-mono">B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  BioTutor <span className="text-emerald-600">Tamil</span>
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    நிர்வாகி (Admin)
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-emerald-700 hidden sm:block">
                A/L Biology — தமிழில் கற்போம்
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs font-semibold border border-emerald-200/60'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={openSetupGuide}
              title="அமைவு மற்றும் வழிகாட்டி (Setup Guide)"
              className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Info className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">வழிகாட்டி</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'S'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[110px]">
                      {userProfile?.displayName || 'மாணவர்'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[110px]">
                      {isAdmin ? 'நிர்வாகி (Admin)' : 'மாணவர்'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="வெளியேறு (Logout)"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>உள்நுழைக</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openSetupGuide}
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg"
              title="வழிகாட்டி"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {currentUser && (
            <div className="p-3 mb-2 bg-emerald-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  {userProfile?.displayName || 'மாணவர்'}
                </p>
                <p className="text-xs text-emerald-700">
                  {currentUser.email} • {isAdmin ? 'நிர்வாகி (Admin)' : 'மாணவர்'}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-red-600 font-semibold px-2 py-1 rounded bg-white shadow-xs"
              >
                வெளியேறு
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <span className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {item.labelEn}
                </span>
              </button>
            );
          })}

          {!currentUser && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-center text-sm shadow-xs"
              >
                உள்நுழைக / பதிவுசெய்க (Sign In)
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
