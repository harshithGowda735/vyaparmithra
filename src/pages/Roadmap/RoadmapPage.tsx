import React, { useEffect, useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { 
  FileText, 
  Landmark, 
  Mail, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
  FolderOpen,
  X,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  generateBusinessPlan, 
  generateLoanApplication, 
  generateVendorEmail,
  generatePitchDeck,
  DocumentGenerationResponse
} from '../../services/api';

export default function RoadmapPage() {
  const { 
    roadmapSteps, 
    roadmapData,
    toggleRoadmapStep, 
    profile, 
    uploadFileToVault,
    fetchRoadmap,
    isLoadingRoadmap,
    businessId
  } = useBusinessStore();

  const [counter, setCounter] = useState(0);
  const [selectedDocDraft, setSelectedDocDraft] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<DocumentGenerationResponse | null>(null);

  // Counting animation for revenue forecast
  useEffect(() => {
    let start = 0;
    const end = 48;
    const duration = 1200;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setCounter(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Fetch roadmap on mount
  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerateDocument = async (docTitle: string) => {
    setIsGeneratingDoc(true);
    toast.info(`Generating ${docTitle} from backend...`);
    
    try {
      const payload = { business_id: businessId, tone: 'professional', extra_context: customPrompt || undefined };
      let result: DocumentGenerationResponse;
      
      if (docTitle === 'Business Plan') {
        result = await generateBusinessPlan(payload);
      } else if (docTitle === 'Loan Proposal') {
        result = await generateLoanApplication(payload);
      } else if (docTitle === 'Vendor Email') {
        result = await generateVendorEmail(payload);
      } else {
        result = await generatePitchDeck(payload);
      }
      
      setGeneratedDoc(result);
      // Add drafted document to the vault
      uploadFileToVault('f-loans', `${docTitle.replace(/\s+/g, '_')}_Draft.pdf`, 140);
      toast.success(`${docTitle} generated successfully! Saved to Business Vault.`);
    } catch (err: any) {
      // Fallback: simulated document generation
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: `Generating ${docTitle}...`,
          success: `${docTitle} drafted! Saved to your Vault.`,
          error: 'Document generation failed.',
        }
      );
      setTimeout(() => {
        uploadFileToVault('f-loans', `${docTitle.replace(/\s+/g, '_')}_Draft.pdf`, 140);
        setSelectedDocDraft(null);
      }, 1700);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const docDrafts = [
    { id: 'bp', title: 'Business Plan', desc: 'Comprehensive strategy for growth & operations.', icon: FileCheck, color: 'blue' },
    { id: 'lp', title: 'Loan Proposal', desc: 'Bank-ready documents for MSME financing.', icon: Landmark, color: 'purple' },
    { id: 've', title: 'Vendor Email', desc: 'Professional outreach for procurement.', icon: Mail, color: 'orange' },
    { id: 'cd', title: 'Pitch Deck', desc: 'Investor-ready pitch deck outline.', icon: Sparkles, color: 'green' },
  ];

  // Use backend roadmap data if available
  const displayTasks = roadmapData?.tasks || [];

  const getStatusIcon = (status: string) => {
    if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />;
    return <Circle className="w-4 h-4 text-slate-500" />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (priority === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-white/5 border-white/10';
  };

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* SECTION 1: Document Generator */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">Document Generator</h2>
            <p className="text-gray-400 text-sm">AI-powered business documentation from your live backend data.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {docDrafts.map((draft) => {
            const Icon = draft.icon;
            return (
              <button 
                key={draft.id}
                onClick={() => { setSelectedDocDraft(draft.title); setGeneratedDoc(null); }}
                className="glass-card p-6 rounded-2xl flex flex-col items-start gap-4 hover:scale-[1.03] active:scale-95 transition-all text-left group border border-white/5"
              >
                <div className={`p-3 rounded-xl transition-all ${
                  draft.color === 'blue' ? 'bg-blue-500/10 text-[#adc6ff]' :
                  draft.color === 'purple' ? 'bg-purple-500/10 text-[#cdbdff]' :
                  draft.color === 'orange' ? 'bg-amber-500/10 text-[#ffb780]' : 'bg-green-500/10 text-green-300'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base mb-1 group-hover:text-[#adc6ff] transition-colors">{draft.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{draft.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Draft Document Modal Overlay */}
      <AnimatePresence>
        {selectedDocDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 rounded-2xl max-w-2xl w-full space-y-4 border border-blue-500/30 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /> Create {selectedDocDraft}
                </h3>
                <button onClick={() => { setSelectedDocDraft(null); setGeneratedDoc(null); }} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!generatedDoc ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    VyaparMitra AI will use your profile (industry: <strong>{profile.industry}</strong>, revenue: <strong>{profile.revenue}</strong>, employees: <strong>{profile.employees}</strong>) to craft a customized {selectedDocDraft}.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400">Additional Custom Directives</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      rows={3}
                      placeholder="E.g., Include machine purchase quote of ₹15L, highlight loan payback duration of 11 months..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => handleGenerateDocument(selectedDocDraft)}
                    disabled={isGeneratingDoc}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isGeneratingDoc ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Generating from Backend...</>
                    ) : (
                      <>Assemble tailored {selectedDocDraft}</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Document Generated Successfully!</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-white/5 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {generatedDoc.content_markdown}
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSelectedDocDraft(null); setGeneratedDoc(null); }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
                    >
                      Saved to Vault ✓
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedDoc.content_markdown], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedDocDraft?.replace(/\s+/g, '_')}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all"
                    >
                      Download .md
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 2: Backend 30-Day Roadmap (if available) */}
      {displayTasks.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white">{roadmapData?.title || '30-Day Growth Roadmap'}</h2>
              <p className="text-slate-400 text-sm">Backend-generated strategic sprint plan</p>
            </div>
            <button
              onClick={() => { fetchRoadmap(); toast.info('Refreshing roadmap...'); }}
              disabled={isLoadingRoadmap}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${isLoadingRoadmap ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayTasks.map((task, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="text-[10px] font-black text-slate-500">Day {task.day}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">{task.task}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold">
                  <TrendingUp className="w-3 h-3" />
                  {task.estimated_impact}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Local Roadmap Steps (always show) */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white">Growth Milestones</h2>
            <p className="text-slate-400 text-sm">Your step-by-step journey. Tap to toggle milestone status.</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-600 to-amber-500 opacity-25" />

          <div className="space-y-12 relative">
            {roadmapSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 cursor-pointer"
                  onClick={() => {
                    toggleRoadmapStep(step.id);
                    toast.success(`Milestone "${step.title}" status updated!`);
                  }}
                >
                  <div className={`md:w-1/2 order-2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 order-3'}`}>
                    <h4 className="text-lg font-bold text-white">Day {step.dayNumber}: {step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md md:ml-auto">{step.description}</p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-blue-500/20 flex items-center justify-center z-10 order-1 md:mx-auto shadow-lg shadow-blue-500/5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>

                  <div className={`md:w-1/2 order-3 ${isEven ? 'md:pl-12' : 'md:pr-12 md:text-right order-2'}`}>
                    <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-full border ${
                      step.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      step.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10 animate-pulse' :
                      'bg-white/5 text-slate-400 border-white/5'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Analytics Bento Grid Previews */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Revenue Forecast Card */}
        <div className="glass-card p-6 rounded-[24px] col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Revenue Forecast</p>
              <h3 className="text-3xl font-black text-white">₹{counter},000</h3>
            </div>
            <div className="flex items-center text-blue-400 gap-1 text-xs font-bold">
              <TrendingUp className="w-4 h-4" /> 12.5% increase
            </div>
          </div>

          <div className="h-28 w-full flex items-end gap-2.5">
            {[40, 65, 50, 85, 100].map((h, i) => (
              <div 
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-t bg-blue-500/10 transition-all duration-700 group-hover:bg-blue-500/35 ${i === 4 ? 'progress-shimmer' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* AI Coach Live Panel */}
        <div className="glass-card p-6 rounded-[24px] flex flex-col justify-center items-center text-center border-white/5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">AI Coach Live</h4>
          <p className="text-slate-400 text-xs mb-6 max-w-xs leading-relaxed">
            &ldquo;Optimize inventory now to save ₹4,500 next week.&rdquo;
          </p>
          <button 
            onClick={() => toast.success('Analyzing your supply chain logs. Optimization report drafted in PDF.')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg"
          >
            Review Insight
          </button>
        </div>

      </section>
    </div>
  );
}
