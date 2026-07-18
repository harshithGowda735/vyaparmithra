import React from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import BusinessCore3D from '../../components/BusinessCore3D';
import { 
  Sparkles, 
  Play, 
  HeartPulse, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Cpu, 
  Lock, 
  Mic, 
  SearchCheck, 
  FileCheck, 
  Globe,
  Gauge
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { setActiveTab } = useBusinessStore();

  const workflowSteps = [
    { icon: Mic, title: 'Speak', desc: 'Tell us your goal' },
    { icon: SearchCheck, title: 'Investigates', desc: 'Gemma AI analyzes' },
    { icon: FileCheck, title: 'Diagnose', desc: 'Identify blockers' },
    { icon: Cpu, title: 'Simulate', desc: 'Predict outcomes' },
    { icon: TrendingUp, title: 'Grow', desc: 'Scale your reach', highlight: true }
  ];

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-20 pb-20">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[580px]">
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#cdbdff] text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#cdbdff] animate-pulse" />
            Next-Gen MSME Intelligence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-sans"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fef08a] via-[#fca5a5] to-[#fed7aa]">
              VyaparMitra
            </span>
            <br />
            Your AI Business Operating System for Indian MSMEs
          </motion.h1>

          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Talk. Upload. Grow. Leverage Gemma-powered insights to scale your business with institutional precision.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => setActiveTab('interview')}
              className="px-8 py-4 bg-gradient-to-r from-[#991b1b] to-[#ea580c] hover:brightness-110 text-white rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-950/40 border border-red-500/10"
            >
              <Cpu className="w-5 h-5" />
              Start Diagnosis
            </button>
            <button 
              onClick={() => setActiveTab('simulator')}
              className="px-8 py-4 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-3 transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Futuristic Node Network Core representation */}
        <div className="lg:col-span-5 flex justify-center items-center relative h-[420px] md:h-[480px] overflow-hidden z-10">
          <div className="absolute inset-0 z-0">
            <BusinessCore3D />
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#140d0c]/40 via-transparent to-[#140d0c]/10 z-10" />
        </div>
      </section>

      {/* Command Center Bento Grid */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Command Center</h2>
          <p className="text-gray-400 text-base md:text-lg">
            Integrated tools for every vertical of your business journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Business Health Card */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="glass-card p-6 rounded-[24px] col-span-1 md:col-span-2 flex flex-col justify-between min-h-[300px] cursor-pointer"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="p-3 bg-blue-500/10 rounded-xl">
                  <HeartPulse className="w-6 h-6 text-blue-400" />
                </span>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold tracking-wider">Health Score</p>
                  <p className="text-2xl font-black text-blue-400">84/100</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Business Health</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Real-time analysis of your cash flow, inventory turnover, and market position. Update fields instantly.
              </p>
            </div>
            
            {/* Sparkline visualization */}
            <div className="flex items-end gap-1.5 h-16 w-full pt-4">
              {[40, 60, 45, 75, 55, 90, 80, 100].map((h, i) => (
                <div 
                  key={i} 
                  style={{ height: `${h}%` }} 
                  className={`flex-1 rounded-t bg-gradient-to-t from-blue-600/40 to-blue-400/80 ${i === 5 ? 'progress-shimmer' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Govt Schemes Card */}
          <div 
            onClick={() => setActiveTab('schemes')}
            className="glass-card p-6 rounded-[24px] flex flex-col justify-between min-h-[300px] cursor-pointer"
          >
            <div className="space-y-4">
              <span className="p-3 bg-amber-500/10 rounded-xl inline-block">
                <Award className="w-6 h-6 text-amber-400" />
              </span>
              <h3 className="text-xl font-bold">Government</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automated matching for MSME grants and SIDBI loan eligibility. Apply for schemes in under 5 minutes.
              </p>
            </div>
            <button className="text-amber-400 font-semibold text-sm flex items-center gap-1.5 group-hover:translate-x-2 transition-transform pt-4">
              Check Eligibility <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Growth Insights Card */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="glass-card p-6 rounded-[24px] flex flex-col justify-between min-h-[260px] cursor-pointer"
          >
            <div className="space-y-4">
              <span className="p-3 bg-indigo-500/10 rounded-xl inline-block">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </span>
              <h3 className="text-xl font-bold">Growth</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-driven market expansion strategies tailored for your tier-2/3 city context.
              </p>
            </div>
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden mt-4">
              <div className="bg-amber-500 h-full w-[68%]" />
            </div>
          </div>

          {/* Decision Simulator Card */}
          <div 
            onClick={() => setActiveTab('simulator')}
            className="glass-card p-6 rounded-[24px] col-span-1 md:col-span-2 relative overflow-hidden group min-h-[260px] cursor-pointer"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="p-3 bg-blue-500/10 rounded-xl inline-block mb-4">
                  <Gauge className="w-6 h-6 text-blue-400" />
                </span>
                <h3 className="text-xl font-bold mb-2">Decision Simulator</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  &ldquo;What if I increase inventory by 20%?&rdquo; Simulate financial break-even ROI before you commit capital.
                </p>
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 font-semibold text-xs text-amber-400 flex items-center gap-2 max-w-md">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                Gemma predicted: 12% ROI increase in Q4
              </div>
            </div>
            
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Gauge className="w-48 h-48 text-blue-400" />
            </div>
          </div>

          {/* Vault Card */}
          <div 
            onClick={() => setActiveTab('vault')}
            className="glass-card p-6 rounded-[24px] flex flex-col justify-center items-center text-center cursor-pointer min-h-[260px]"
          >
            <span className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-amber-500/10 rounded-full flex items-center justify-center mb-4 animate-float">
              <Lock className="w-8 h-8 text-blue-400" />
            </span>
            <h3 className="text-xl font-bold mb-1">The Vault</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mb-4">
              Secure, 256-bit encrypted cloud storage for GST and compliance documentation.
            </p>
            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold transition-all">
              Open Vault
            </button>
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section className="glass-card rounded-[32px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cpu className="w-48 h-48 text-blue-500" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black mb-12 text-center">
          The Vyapar Experience
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
          <div className="hidden md:block absolute top-[28px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent -z-10" />

          {workflowSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center gap-2 group max-w-xs">
                <div className={`w-14 h-14 rounded-full border border-white/5 flex items-center justify-center transition-all ${
                  step.highlight 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/20 shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-900 group-hover:border-blue-500/20 group-hover:bg-blue-500/5'
                }`}>
                  <StepIcon className={`w-5.5 h-5.5 ${step.highlight ? 'text-white' : 'text-slate-300'}`} />
                </div>
                <h4 className="font-bold text-sm text-slate-200 mt-1">{step.title}</h4>
                <p className="text-xs text-slate-400 max-w-[130px]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Ready to transform your business?
        </h2>
        <p className="text-slate-400 text-lg">
          Join 50,000+ Indian MSMEs using AI to compete with global enterprises.
        </p>
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => setActiveTab('interview')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/10 hover:scale-[1.01] transition-transform active:scale-95 border border-blue-400/10"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="py-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400 font-semibold">
        <div>© 2026 VyaparMitra AI. Built for Bharat.</div>
        <div className="flex gap-6">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Use</a>
          <a className="hover:text-white transition-colors" href="#">Support Desk</a>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Regional Language / English</span>
        </div>
      </footer>
    </div>
  );
}
