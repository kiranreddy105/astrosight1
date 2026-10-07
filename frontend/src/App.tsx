import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreePlanetGlobe } from './components/ThreePlanetGlobe';
import { AnalysisRecord } from './types';
import { Globe2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedAnalysisForView, setSelectedAnalysisForView] = useState<AnalysisRecord | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [tourModalOpen, setTourModalOpen] = useState<boolean>(false);

  // When user logs in, automatically enter Mission Control
  useEffect(() => {
    if (user && activeTab === 'landing') {
      setActiveTab('portal');
    }
  }, [user]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleEnterMission = () => {
    if (user) {
      setActiveTab('portal');
    } else {
      handleOpenAuth('login');
    }
  };

  const handleNavigateTab = (tab: string, analysis?: AnalysisRecord) => {
    if (!user && tab !== 'landing') {
      handleOpenAuth('login');
      return;
    }
    if (analysis) {
      setSelectedAnalysisForView(analysis);
    }
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#06090e',
          color: '#00e5ff',
          fontFamily: 'var(--font-mono)',
        }}
      >
        INITIALIZING ASTROSIGHT TELEMETRY RUNTIME...
      </div>
    );
  }

  // Show Landing Page when on landing tab or not logged in
  if (activeTab === 'landing' || !user) {
    return (
      <div className="space-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onOpenAuth={handleOpenAuth}
          onOpenTour={() => setTourModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
        />

        <main style={{ flex: 1 }}>
          <LandingPage onEnterMission={handleEnterMission} onOpenAuth={handleOpenAuth} />
        </main>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />

        <OnboardingModal
          isOpen={tourModalOpen}
          onClose={() => setTourModalOpen(false)}
        />
      </div>
    );
  }

  // Authenticated Mission Control Layout
  return (
    <div className="space-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenTour={() => setTourModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} />

        <main style={{ flex: 1, overflowY: 'auto', minHeight: 'calc(100vh - 65px)' }}>
          {activeTab === 'portal' && (
            <MissionControlPage onNavigateTab={handleNavigateTab} />
          )}

          {(activeTab === 'analyze' || activeTab === 'detect' || activeTab === 'spatial') && (
            <AnalysisPage
              initialAnalysis={selectedAnalysisForView}
              onAnalysisSaved={() => setSelectedAnalysisForView(null)}
            />
          )}

          {activeTab === 'globe' && (
            <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="telemetry-badge">
                    <Globe2 size={12} /> SPHERICAL PROJECTION
                  </span>
                </div>
                <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Interactive 3D Planetary Globe
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                  Rotate, zoom, and explore procedural lunar regolith and Martian terrains in full WebGL 3D.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <ThreePlanetGlobe planet="Moon" height="620px" />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryPage
              onViewAnalysis={(analysis) => {
                setSelectedAnalysisForView(analysis);
                setActiveTab('analyze');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <HistoryPage
              onViewAnalysis={(analysis) => {
                setSelectedAnalysisForView(analysis);
                setActiveTab('analyze');
              }}
            />
          )}

          {activeTab === 'model' && <ModelPerformancePage />}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <OnboardingModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
