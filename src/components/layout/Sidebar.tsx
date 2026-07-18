import React from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FolderLock, 
  Award, 
  Milestone, 
  Binary, 
  Settings,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useBusinessStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-[#adc6ff]' },
    { id: 'interview', label: 'AI Coach', icon: MessageSquareCode, color: 'text-[#cdbdff]' },
    { id: 'vault', label: 'Business Vault', icon: FolderLock, color: 'text-[#adc6ff]' },
    { id: 'schemes', label: 'Govt Schemes', icon: Award, color: 'text-[#ffb780]' },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone, color: 'text-[#adc6ff]' },
    { id: 'simulator', label: 'Simulator', icon: Binary, color: 'text-[#cdbdff]' },
  ] as const;

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-20 flex-col items-center py-8 justify-between bg-[#0d1226]/40 backdrop-blur-lg border-r border-white/5 z-40">
      <div className="flex flex-col gap-6 items-center w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'interview' && activeTab === 'investigation');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#7C4DFF]/20 text-[#cdbdff] border border-[#7C4DFF]/40 shadow-lg shadow-purple-500/10 scale-110' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-5.5 h-5.5 transition-transform group-hover:scale-105" />
              
              {/* Tooltip */}
              <span className="absolute left-20 bg-[#0d1226] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-xl z-50 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6 items-center w-full">
        <button
          onClick={() => setActiveTab('settings')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group ${
            activeTab === 'settings'
              ? 'bg-[#7C4DFF]/20 text-[#cdbdff] border border-[#7C4DFF]/40 shadow-lg'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
          title="Settings"
        >
          <Settings className="w-5.5 h-5.5 transition-transform group-hover:rotate-45" />
          <span className="absolute left-20 bg-[#0d1226] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-xl z-50 whitespace-nowrap">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
