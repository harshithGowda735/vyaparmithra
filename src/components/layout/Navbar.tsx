import React from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, Menu, Shield, Bell, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';

export default function Navbar() {
  const { profile, activeTab, setActiveTab } = useBusinessStore();

  const profileImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuA4Yhs9XgJXs8zsQlzE2z-nwKJSvT1i6LQLaXwqh-lAx7C7Vwd1vEMVp6VhNNDuniEDO7-jXteM8gvNJlWGNpPRA_ZJwbW-t8Yr0xRPXBjnOdBo_SndcSEeXXbyLTCb2YgAoRVSPTjV6NLepHNdfBnjoCnCUUUcZ-ADO839uagDBEp8LLcgChI39Bx5DWRqlHdSfM3LqM52fPtOW7swBi3MlO4VmuCkCYofpBuRtuPFofLlxs5vhwA";

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0b0f17]/80 backdrop-blur-xl border-b border-white/[0.04] shadow-md flex items-center justify-between px-6 py-3 h-16 md:px-10">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setActiveTab('landing')}
      >
        <Sparkles className="text-amber-500 w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
        <span className="font-sans text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
          VyaparMitra AI
        </span>
      </div>

      <nav className="hidden md:flex gap-8">
        <button 
          onClick={() => setActiveTab('landing')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'landing' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Home
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('interview')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'interview' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          AI Coach
        </button>
        <button 
          onClick={() => setActiveTab('schemes')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'schemes' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Schemes
        </button>
        <button 
          onClick={() => setActiveTab('roadmap')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'roadmap' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Roadmap
        </button>
        <button 
          onClick={() => setActiveTab('vault')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'vault' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vault
        </button>
        <button 
          onClick={() => setActiveTab('simulator')}
          className={`font-sans text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'simulator' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Simulator
        </button>
      </nav>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          onClick={() => {
            // For now just mark read or show toast
            useBusinessStore.getState().markNotificationsRead();
            toast.info('Notifications panel coming soon!');
          }}
          className="relative text-gray-500 hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          {useBusinessStore.getState().notifications.some(n => !n.isRead) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0b0f17]" />
          )}
        </button>

        <span className="text-slate-500 font-mono text-xs hidden sm:inline border-l border-white/10 pl-4">Session: #4209</span>
        
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full border border-white/5 p-0.5 overflow-hidden ring-4 ring-amber-500/5 cursor-pointer hover:border-amber-400 transition-all"
          title="Open Settings"
        >
          <img 
            className="w-full h-full object-cover rounded-full" 
            src={profileImg} 
            alt={profile.name}
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Logout Button */}
        <button 
          onClick={() => {
            // Log out user from firebase and clear local state (for demo bypass)
            auth.signOut();
            useAuthStore.getState().setUser(null);
          }}
          className="hidden md:flex items-center justify-center p-2 text-gray-500 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <button 
          className="text-gray-400 hover:text-white md:hidden"
          onClick={() => setActiveTab('settings')}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
