import React, { useEffect } from 'react';
import { useBusinessStore } from './store/useBusinessStore';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import LandingPage from './pages/Landing/LandingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DiagnosisPage from './pages/Diagnosis/DiagnosisPage';
import InvestigationPage from './pages/Investigation/InvestigationPage';
import GovernmentPage from './pages/Government/GovernmentPage';
import RoadmapPage from './pages/Roadmap/RoadmapPage';
import VaultPage from './pages/Vault/VaultPage';
import SimulatorPage from './pages/Simulator/SimulatorPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';
import { Toaster } from 'sonner';

export default function App() {
  const { activeTab, theme } = useBusinessStore();
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Apply theme class to document body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme-body');
      document.body.classList.remove('light-theme-body');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme-body');
      document.body.classList.add('light-theme-body');
    }
  }, [theme]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-white">Loading...</div>;
  }

  // If not logged in, and not on landing page, show login
  // Actually, we can just show LoginPage if not logged in
  if (!user) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} closeButton richColors />
        <LoginPage />
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'interview':
        return <DiagnosisPage />;
      case 'investigation':
        return <InvestigationPage />;
      case 'schemes':
        return <GovernmentPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'vault':
        return <VaultPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'dark text-white bg-transparent' : 'text-slate-900 bg-gray-50'} selection:bg-[#6366f1] selection:text-white antialiased overflow-x-hidden`}>
      {/* Dynamic Header */}
      <Navbar />

      <div className="flex">
        {/* Core Main Container */}
        <main className="w-full min-h-screen transition-all pt-16">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global High-Fidelity Sonner Toast Notifications */}
      <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} closeButton richColors />
    </div>
  );
}
