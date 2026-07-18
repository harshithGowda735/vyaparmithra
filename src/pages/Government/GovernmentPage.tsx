import React, { useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  Award, 
  Sparkles, 
  ArrowUpRight, 
  HelpCircle, 
  PlayCircle, 
  Utensils, 
  CheckCircle,
  TrendingUp,
  Coins,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function GovernmentPage() {
  const { profile } = useBusinessStore();
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);

  const handleApply = (schemeName: string) => {
    toast.success(`Draft application for ${schemeName} has been initialized! Check your Vault to download files.`);
  };

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Title block */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Direct MSME Match Index
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Recommended Schemes</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
          AI analyzed your business profile and found 3 high-match government schemes that could accelerate your growth by up to 40%.
        </p>
      </section>

      {/* Grid: Scheme Highlight + Coach Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PMEGP Primary Card */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
          
          {/* Match Score Circle */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="#2563eb" strokeWidth="6" strokeDasharray="263.8" strokeDashoffset="13.2" strokeLinecap="round" fill="transparent" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-blue-400">95%</span>
              </div>
            </div>
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-black">AI Match Score</span>
          </div>

          {/* Scheme Details */}
          <div className="flex-grow space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <h3 className="text-2xl font-black text-white">PMEGP</h3>
                <p className="text-slate-400 text-xs font-semibold">Prime Minister's Employment Generation Programme</p>
              </div>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/10">
                TOP MATCH
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Subsidies up to 35% for setting up new micro-enterprises in manufacturing and service sectors. Perfect for your proposed expansion plans.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-0.5">Max Loan Cap</span>
                <span className="text-lg font-extrabold text-amber-400">₹50 Lakhs</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-0.5">Government Subsidy</span>
                <span className="text-lg font-extrabold text-amber-400">15% - 35%</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => handleApply('PMEGP Scheme')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex-1 transition-transform active:scale-95 text-sm"
              >
                Apply Now
              </button>
              <button 
                onClick={() => setActiveDetailsId(activeDetailsId === 'pmegp' ? null : 'pmegp')}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                Details
              </button>
            </div>

            {activeDetailsId === 'pmegp' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 space-y-2 mt-2 leading-relaxed"
              >
                <p><strong>Eligibility:</strong> Any individual above 18 years of age. At least VIII standard pass for projects costing above Rs. 10 lakh in manufacturing and above Rs. 5 lakh in business/service.</p>
                <p><strong>How to proceed:</strong> Upload your Machinery Invoice or Business Draft in the Vault. Our AI will automatically pre-fill the official application document matching this scheme.</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* AI Coach Sidebar */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-blue-400">AI Coach Insight</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              &ldquo;Ramesh, your GST compliance and recent inventory growth make you an ideal candidate for PMEGP. Applying this month increases your approval chance by 12% due to quarterly quota resets.&rdquo;
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Profile Readiness</span>
              <span className="text-blue-400 font-bold">88%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[88%] progress-shimmer animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold">* Complete your &lsquo;Machinery Invoice&rsquo; to reach 100%</p>
          </div>
        </div>
      </div>

      {/* Grid: MUDRA + PMFME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* MUDRA Scheme */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/3 blur-[80px] pointer-events-none" />
          
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="44" stroke="#3b82f6" strokeWidth="6" strokeDasharray="276.4" strokeDashoffset="22.1" strokeLinecap="round" fill="transparent" />
                </svg>
                <div className="absolute">
                  <span className="text-sm font-black text-blue-400">92%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">MUDRA Yojana</h3>
              <p className="text-slate-400 text-xs mt-1">Collateral-free loans for small/micro enterprises.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 py-4">
            <span className="text-[10px] px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-slate-400">Shishu: ₹50k</span>
            <span className="text-[10px] px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-slate-400">Kishore: ₹5L</span>
            <span className="text-[10px] px-2.5 py-1 bg-white/5 rounded-md border border-white/10 font-bold text-blue-400">Tarun: ₹10L</span>
          </div>

          <button 
            onClick={() => handleApply('MUDRA Tarun Loan')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 text-xs"
          >
            Apply for Tarun Loan
          </button>
        </div>

        {/* PMFME Food Processing Scheme */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/3 blur-[80px] pointer-events-none" />
          
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="44" stroke="#d97706" strokeWidth="6" strokeDasharray="276.4" strokeDashoffset="35.9" strokeLinecap="round" fill="transparent" />
                </svg>
                <div className="absolute">
                  <span className="text-sm font-black text-amber-400">87%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">PMFME</h3>
              <p className="text-slate-400 text-xs mt-1">Formalization of Micro Food Processing Enterprises Scheme.</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2.5 py-3 text-xs text-amber-400 font-semibold my-2">
            <Utensils className="w-4 h-4 shrink-0" />
            <span>Eligible for 35% Credit Linked Subsidy ({profile.industry} Sector)</span>
          </div>

          <button 
            onClick={() => handleApply('PMFME Scheme')}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all active:scale-95 text-xs"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Regional Friendly Section */}
      <section className="p-6 md:p-8 bg-slate-900/50 rounded-2xl border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <HelpCircle className="w-8 h-8" />
            </span>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Need help understanding?</h4>
              <p className="text-xs text-slate-400">
                Watch simple explanation videos in Hindi, Bengali, Tamil, Kannada, or Marathi.
              </p>
            </div>
          </div>
          <button 
            onClick={() => toast.info('Playing simple regional guide video in overlay player')}
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 text-xs self-start md:self-auto shrink-0 transition-transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4" /> Explain Schemes
          </button>
        </div>
      </section>
    </div>
  );
}
