import React from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  LayoutDashboard, 
  FolderLock, 
  Sparkles, 
  Award, 
  Milestone 
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useBusinessStore();

  const navItems: Array<{ id: 'dashboard' | 'vault' | 'interview' | 'schemes' | 'roadmap'; label: string; icon: any; isCenter?: boolean }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'vault', label: 'Vault', icon: FolderLock },
    { id: 'interview', label: 'AI Coach', icon: Sparkles, isCenter: true },
    { id: 'schemes', label: 'Schemes', icon: Award },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full rounded-t-2xl z-50 bg-[#111827]/85 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] flex justify-around items-center h-18 px-4 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'interview' && activeTab === 'investigation');
        
        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center bg-[#6366f1] text-white rounded-2xl px-5 py-2 scale-110 -translate-y-3 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
            >
              <Icon className="w-5 h-5 animate-pulse" />
              <span className="font-sans text-[10px] font-bold mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-14 py-2 transition-all active:scale-95 ${
              isActive ? 'text-[#adc6ff]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="font-sans text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
