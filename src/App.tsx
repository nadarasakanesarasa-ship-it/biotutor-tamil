import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HomeDashboard } from './HomeDashboard';
import { AITutorView } from './AITutorView';
import { NotesView } from './NotesView';
import { PdfLibraryView } from './PdfLibraryView';
import { PracticeQuizView } from './PracticeQuizView';
import { ProfileView } from './ProfileView';
import { AuthModal } from './AuthModal';
import { SetupGuideModal } from './SetupGuideModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HomeDashboard
            setCurrentTab={setCurrentTab}
            openAuthModal={() => setIsAuthModalOpen(true)}
            openSetupGuide={() => setIsSetupGuideOpen(true)}
          />
        )}

        {currentTab === 'tutor' && <AITutorView />}

        {currentTab === 'notes' && <NotesView />}

        {currentTab === 'pdfs' && <PdfLibraryView />}

        {currentTab === 'quiz' && <PracticeQuizView />}

        {currentTab === 'profile' && (
          <ProfileView
            openAuthModal={() => setIsAuthModalOpen(true)}
            openSetupGuide={() => setIsSetupGuideOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        openSetupGuide={() => setIsSetupGuideOpen(true)}
        openPrivacyNotice={() => setCurrentTab('profile')}
      />

      {/* Auth Modal (Sign In / Register / Reset) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Setup Guide Modal */}
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
