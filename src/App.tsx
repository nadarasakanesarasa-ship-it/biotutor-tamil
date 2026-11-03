
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeDashboard } from './components/HomeDashboard';
import { AITutorView } from './components/AITutorView';
import { NotesView } from './components/NotesView';
import { PdfLibraryView } from './components/PdfLibraryView';
import { PracticeQuizView } from './components/PracticeQuizView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { AdminPanel } from './components/AdminPanel';
import SuperAdminSetup from './components/SuperAdminSetup';

import PremiumPlans from './components/PremiumPlans';
import PDFStore from './components/PDFStore';

function MainApp() {
  const { currentUser, isAdmin, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'admin') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
        return;
      }

      if (!isAdmin) {
        setCurrentTab('home');
        return;
      }
    }

    if (
      ['notes', 'pdfs', 'quiz'].includes(tab) &&
      !currentUser
    ) {
      setIsAuthModalOpen(true);
      return;
    }

    setCurrentTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-emerald-700">
          ஏற்றப்படுகிறது...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">

      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Temporary Super Admin Setup */}
        {currentUser && !isAdmin && (
          <SuperAdminSetup />
        )}

        {currentTab === 'home' && (
          <HomeDashboard
            setCurrentTab={handleTabChange}
            openAuthModal={() => setIsAuthModalOpen(true)}
            openSetupGuide={() => setIsSetupGuideOpen(true)}
          />
        )}

        {/* Public AI Tutor */}
        {currentTab === 'tutor' && <AITutorView />}

        {/* Protected student pages */}
        {currentUser && currentTab === 'notes' && <NotesView />}

        {currentUser && currentTab === 'pdfs' && <PdfLibraryView />}

        {currentUser && currentTab === 'quiz' && <PracticeQuizView />}

        {/* Super Admin only */}
        {currentUser && isAdmin && currentTab === 'admin' && (
          <AdminPanel />
        )}

        {/* Premium and PDF Store */}
        {currentTab === 'premium' && <PremiumPlans />}

        {currentTab === 'store' && <PDFStore />}

        {currentTab === 'profile' && (
          <ProfileView
            openAuthModal={() => setIsAuthModalOpen(true)}
            openSetupGuide={() => setIsSetupGuideOpen(true)}
          />
        )}

      </main>

      <Footer
        openSetupGuide={() => setIsSetupGuideOpen(true)}
        openPrivacyNotice={() => setCurrentTab('profile')}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
