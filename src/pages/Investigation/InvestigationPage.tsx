import React, { useEffect } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  Database, 
  Warehouse, 
  PercentCircle,
  Sparkles,
  Terminal
} from 'lucide-react';
import { motion } from 'motion/react';

export default function InvestigationPage() {
  const { thinkingProgress, investigationLogs } = useBusinessStore();

  const orbitalCards = [
    { text: 'Reading Sales', icon: TrendingUp, x: -140, y: -120, delay: 0 },
    { text: 'Checking GST', icon: PercentCircle, x: 160, y: -80, delay: 1 },
    { text: 'Comparing Benchmarks', icon: Database, x: -160, y: 110, delay: 2 },
    { text: 'Finding Profit Leak', icon: TrendingDown, x: 150, y: 130, delay: 3 },
    { text: 'Analyzing Inventory', icon: Warehouse, x: 0, y: -170, delay: 4 },
  ];

  return (
    <main className="relative w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center pt-16 pb-32 px-6">
      
      {/* Ambient background glowing circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/3 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Central Gemma Brain Core */}
      <div className="relative flex items-center justify-center w-full max-w-4xl h-[420px] md:h-[500px]">
        
        {/* Pulsing Core */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="relative w-56 h-56 rounded-full bg-gradient-to-tr from-blue-600/5 to-indigo-600/5 flex items-center justify-center border border-white/5"
        >
          <div className="absolute inset-2 border border-dashed border-blue-500/20 rounded-full animate-spin" />
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center glow-blue">
            <Cpu className="w-12 h-12 text-blue-400 animate-bounce" />
          </div>
        </motion.div>

        {/* Orbiting Investigation Cards */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {orbitalCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0.9, 1.03, 1.03, 0.9],
                  x: [0, card.x, card.x, 0],
                  y: [0, card.y, card.y, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: card.delay,
                  ease: "easeInOut"
                }}
                className="absolute glass-card px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl pointer-events-auto border-l-4 border-l-blue-500"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">{card.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Investigation Logs (from backend SSE stream) */}
      {investigationLogs.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-slate-400 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-white/5 pb-1.5 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Investigation Stream</span>
              <span className="ml-auto text-[9px] text-green-400">LIVE</span>
            </div>
            {investigationLogs.map((log, i) => (
              <div key={i} className={`leading-relaxed ${
                log.startsWith('[SYSTEM]') ? 'text-blue-400 font-bold' :
                log.startsWith('[ERROR]') ? 'text-red-400' :
                log.startsWith('[COMPLETE]') ? 'text-green-400 font-bold' : 'text-slate-400'
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Progress & Status Area */}
      <div className="fixed bottom-24 md:bottom-28 left-0 w-full px-6 z-40">
        <div className="max-w-xl mx-auto space-y-4 text-center">
          
          {/* Think Header */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <h2 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-1">
                Gemma is Thinking <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </h2>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div 
              style={{ width: `${thinkingProgress}%` }} 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-full progress-shimmer transition-all duration-300 ease-out" 
            />
          </div>

          {/* Percentage text */}
          <div className="flex justify-between px-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deep Investigation Active</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{thinkingProgress}% Complete</span>
          </div>
        </div>
      </div>
    </main>
  );
}
