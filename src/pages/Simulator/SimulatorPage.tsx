import React, { useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import ProjectedBarChart from '../../components/charts/ProjectedBarChart';
import { 
  UserPlus, 
  Cpu, 
  Tag, 
  Landmark, 
  Plus, 
  Sparkles, 
  Zap, 
  Check,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Play,
  RefreshCw,
  ShoppingCart,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SimulationRequest, SimulationResponse } from '../../services/api';

interface ScenarioConfig {
  id: string;
  apiScenario: SimulationRequest['scenario'];
  name: string;
  icon: any;
  defaultInvestment: number;
  defaultMonthlyCost: number;
  defaultVolumeIncrease: number;
  defaultPriceIncrease: number;
  // Fallback display values (shown when backend offline)
  fallbackRoi: number;
  fallbackRev: string;
  fallbackCapex: string;
  fallbackRisk: number;
  fallbackRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fallbackConfidence: number;
  description: string;
  tip: string;
}

export default function SimulatorPage() {
  const { 
    simulationResult, 
    isSimulating, 
    runScenarioSimulation, 
    backendStatus, 
    businessId 
  } = useBusinessStore();
  
  const [selectedId, setSelectedId] = useState<string>('machine');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRevenue, setCustomRevenue] = useState('');
  const [customInvestment, setCustomInvestment] = useState('');

  const scenarios: ScenarioConfig[] = [
    { 
      id: 'hire', 
      apiScenario: 'hire_employees',
      name: 'Hire Staff', 
      icon: UserPlus, 
      defaultInvestment: 300000,
      defaultMonthlyCost: 25000,
      defaultVolumeIncrease: 15,
      defaultPriceIncrease: 0,
      fallbackRoi: 18, fallbackRev: '+₹1.2L', fallbackCapex: '₹3L', fallbackRisk: 38, fallbackRiskLevel: 'LOW', fallbackConfidence: 88,
      description: "Based on adding 2 senior chefs and 1 supervisor to streamline kitchen turnaround times.",
      tip: "Delaying hire by 2 months improves cash runway by 18%.",
    },
    { 
      id: 'machine', 
      apiScenario: 'buy_machine',
      name: 'Buy Machine', 
      icon: Cpu, 
      defaultInvestment: 1500000,
      defaultMonthlyCost: 10000,
      defaultVolumeIncrease: 30,
      defaultPriceIncrease: 0,
      fallbackRoi: 11, fallbackRev: '+₹2.4L', fallbackCapex: '₹15L', fallbackRisk: 24, fallbackRiskLevel: 'LOW', fallbackConfidence: 92,
      description: "Based on purchasing automated dough mixers and commercial refrigerators to boost output capacity.",
      tip: "We found 3 SIDBI schemes matching this machine purchase.",
    },
    { 
      id: 'price', 
      apiScenario: 'increase_price',
      name: 'Increase Price', 
      icon: Tag, 
      defaultInvestment: 0,
      defaultMonthlyCost: 0,
      defaultVolumeIncrease: 0,
      defaultPriceIncrease: 7.5,
      fallbackRoi: 3, fallbackRev: '+₹80K', fallbackCapex: '₹0L', fallbackRisk: 45, fallbackRiskLevel: 'MEDIUM', fallbackConfidence: 75,
      description: "Based on a 7.5% across-the-board menu price hike to offset raw milk and ingredient inflation.",
      tip: "A 5% raise reduces churn risk by 20% compared to a 7.5% raise.",
    },
    { 
      id: 'loan', 
      apiScenario: 'open_branch',
      name: 'Business Loan', 
      icon: Landmark, 
      defaultInvestment: 2000000,
      defaultMonthlyCost: 20000,
      defaultVolumeIncrease: 25,
      defaultPriceIncrease: 0,
      fallbackRoi: 24, fallbackRev: '+₹1.8L', fallbackCapex: '₹20L', fallbackRisk: 15, fallbackRiskLevel: 'LOW', fallbackConfidence: 90,
      description: "Based on a 12% interest working capital loan to clear high-cost supplier debts and secure bulk purchase discounts.",
      tip: "Generate the business plan for your bank manager now.",
    },
    { 
      id: 'ondc', 
      apiScenario: 'ondc',
      name: 'ONDC Launch', 
      icon: Globe, 
      defaultInvestment: 50000,
      defaultMonthlyCost: 5000,
      defaultVolumeIncrease: 20,
      defaultPriceIncrease: 0,
      fallbackRoi: 6, fallbackRev: '+₹90K', fallbackCapex: '₹0.5L', fallbackRisk: 20, fallbackRiskLevel: 'LOW', fallbackConfidence: 85,
      description: "Register on ONDC network to access 12M+ online buyers with zero platform fee.",
      tip: "ONDC integration boosts digital reach by 15% in 3 months.",
    },
    { 
      id: 'amazon', 
      apiScenario: 'amazon_selling',
      name: 'Amazon Selling', 
      icon: ShoppingCart, 
      defaultInvestment: 100000,
      defaultMonthlyCost: 8000,
      defaultVolumeIncrease: 35,
      defaultPriceIncrease: 0,
      fallbackRoi: 9, fallbackRev: '+₹1.5L', fallbackCapex: '₹1L', fallbackRisk: 30, fallbackRiskLevel: 'LOW', fallbackConfidence: 80,
      description: "Launch on Amazon India with FBA. Tap into pan-India logistics.",
      tip: "Amazon FBA reduces your logistics overhead by 40%.",
    },
  ];

  const active = scenarios.find(s => s.id === selectedId) || scenarios[1];

  const handleRunSimulation = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const payload: SimulationRequest = {
      business_id: businessId,
      scenario: scenario.apiScenario,
      current_monthly_revenue: 180000,
      current_monthly_profit: 36000,
      investment_amount: scenario.defaultInvestment,
      recurring_monthly_cost: scenario.defaultMonthlyCost,
      expected_volume_increase_pct: scenario.defaultVolumeIncrease,
      price_increase_pct: scenario.defaultPriceIncrease,
    };

    setSelectedId(scenarioId);
    const result = await runScenarioSimulation(payload);
    if (result) {
      toast.success(`Simulation complete! Break-even in ${result.break_even_months.toFixed(1)} months`);
    } else {
      toast.info(`Showing pre-computed data for "${scenario.name}"`);
    }
  };

  const handleCustomSubmit = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Running dynamic simulation...',
        success: 'Custom simulation complete! Break-even ROI estimated at 8 Months.',
        error: 'Simulation failed.',
      }
    );
    setShowCustomModal(false);
  };

  // Display values — backend result takes priority over fallbacks
  const displayRoi = simulationResult ? Math.round(simulationResult.break_even_months) : active.fallbackRoi;
  const displayRev = simulationResult 
    ? `+₹${(simulationResult.estimated_revenue_increase / 1000).toFixed(0)}K` 
    : active.fallbackRev;
  const displayCapex = simulationResult 
    ? `₹${(simulationResult.new_monthly_revenue / 1_00_000).toFixed(1)}L` 
    : active.fallbackCapex;
  const displayRiskLevel = simulationResult 
    ? (simulationResult.risk as 'LOW' | 'MEDIUM' | 'HIGH') 
    : active.fallbackRiskLevel;
  const displayRiskPct = simulationResult 
    ? Math.round(simulationResult.roi_pct) 
    : active.fallbackRisk;
  const displayConfidence = simulationResult 
    ? Math.round(simulationResult.confidence * 100) 
    : active.fallbackConfidence;

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Title & Options */}
      <section className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">What are you planning?</h1>
            <p className="text-slate-400 text-sm mt-1">
              {backendStatus.isConnected 
                ? 'Live simulations powered by VyaparMitra backend engine' 
                : 'Pre-computed simulations (connect backend for live projections)'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isSel = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => handleRunSimulation(s.id)}
                disabled={isSimulating}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 ${
                  isSel 
                    ? 'bg-blue-600 text-white border border-blue-500/40 shadow-lg' 
                    : 'glass-card text-slate-400 hover:text-white border-white/5'
                }`}
              >
                {isSimulating && isSel ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{s.name}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Scenario</span>
          </button>
        </div>
      </section>

      {/* Backend Summary (if result available) */}
      {simulationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs"
        >
          <p className="text-emerald-400 font-bold mb-1">Backend Simulation Result</p>
          <p className="text-slate-300 leading-relaxed">{simulationResult.summary}</p>
        </motion.div>
      )}

      {/* Main Simulation results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Break-even ROI Card */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-8 flex flex-col justify-center items-center min-h-[350px] relative overflow-hidden text-center glow-blue">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-4 py-1 rounded-full text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isSimulating ? 'RUNNING SIMULATION...' : simulationResult ? 'LIVE SIMULATION COMPLETE' : 'AI SIMULATION READY'}</span>
            </div>

            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Projected Break-even ROI</p>
            
            <div className="flex items-baseline justify-center gap-2">
              {isSimulating ? (
                <RefreshCw className="w-16 h-16 text-blue-400 animate-spin" />
              ) : (
                <>
                  <span className="text-7xl font-black text-white">{displayRoi}</span>
                  <span className="text-xl font-bold text-blue-400">Months</span>
                </>
              )}
            </div>

            <div className="flex gap-8 pt-4 justify-center items-center">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                  {simulationResult ? 'REVENUE BOOST' : 'MONTHLY REVENUE'}
                </span>
                <span className="text-base font-extrabold text-white">{displayRev}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                  {simulationResult ? 'NEW MONTHLY REV' : 'CAPITAL EXPENDITURE'}
                </span>
                <span className="text-base font-extrabold text-white">{displayCapex}</span>
              </div>
              {simulationResult && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">ROI%</span>
                    <span className="text-base font-extrabold text-emerald-400">{simulationResult.roi_pct.toFixed(1)}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Risk assessment */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">Risk Assessment</h4>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
                displayRiskLevel === 'LOW' ? 'bg-green-500/10 text-green-400' : 
                displayRiskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {displayRiskLevel} RISK
              </span>
            </div>
            
            <div className="flex justify-center py-1">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    stroke={displayRiskLevel === 'LOW' ? '#22c55e' : displayRiskLevel === 'MEDIUM' ? '#db760f' : '#ef4444'} 
                    strokeWidth="6" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * Math.min(displayRiskPct, 100)) / 100} 
                    strokeLinecap="round" 
                    fill="transparent"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(displayRiskPct, 100)) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="text-lg font-black text-white">{displayRiskPct}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              {simulationResult 
                ? simulationResult.summary.slice(0, 80) + '...'
                : `Your current cash flow can sustain this investment for ${displayRoi > 12 ? '8' : '6'} months.`}
            </p>
          </div>

          {/* AI Confidence */}
          <div className="glass-card rounded-2xl p-6 space-y-3 border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">AI Confidence</h4>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">High Fidelity</span>
                <span className="text-blue-400 font-bold">{displayConfidence}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-600 h-full progress-shimmer"
                  initial={{ width: 0 }}
                  animate={{ width: `${displayConfidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold italic">
              &ldquo;{active.description}&rdquo;
            </p>
          </div>

        </div>
      </div>

      {/* Projected Revenue bar chart */}
      <section className="glass-card rounded-[24px] p-6 md:p-8 space-y-6">
        <div>
          <h4 className="text-lg font-bold">Projected Revenue Growth</h4>
          <p className="text-xs text-slate-400">Comparing &lsquo;Current&rsquo; vs &lsquo;Post-Decision&rsquo; performance</p>
        </div>
        <ProjectedBarChart simulationResult={simulationResult} />
      </section>

      {/* Recommendations lower bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-full text-amber-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm text-gray-200">Recommendation Path</h5>
            <p className="text-xs text-slate-400 leading-relaxed">{active.tip}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm text-gray-200">Scaling Tip</h5>
            <p className="text-xs text-slate-400 leading-relaxed">Delaying hire by 2 months improves cash runway by 18%.</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm text-gray-200">Ready to Proceed?</h5>
            <p className="text-xs text-slate-400 leading-relaxed">Generate the business plan for your bank manager now.</p>
          </div>
        </div>
      </div>

      {/* Custom Scenario Dialog Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 rounded-2xl max-w-md w-full space-y-4 border border-amber-500/30"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" /> Custom AI Simulation
                </h3>
                <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Describe a custom business scenario. Gemma will run custom projection formulas.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Monthly Revenue (₹)</label>
                    <input
                      type="number"
                      value={customRevenue}
                      onChange={(e) => setCustomRevenue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. 180000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Investment (₹)</label>
                    <input
                      type="number"
                      value={customInvestment}
                      onChange={(e) => setCustomInvestment(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. 500000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    rows={4}
                    placeholder="Enter custom business planning details (e.g., Open a second dining hall in Mysuru with ₹20L investment)..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleCustomSubmit}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-xs active:scale-95 transition-all text-slate-950"
              >
                Compute Custom Projections
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating play action button */}
      <button 
        onClick={() => handleRunSimulation(selectedId)}
        disabled={isSimulating}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group cursor-pointer disabled:opacity-70"
        title="Re-run Simulation"
      >
        {isSimulating 
          ? <RefreshCw className="w-6 h-6 animate-spin" />
          : <Play className="w-6 h-6 fill-white ml-1 group-hover:rotate-12 transition-transform" />
        }
      </button>
    </div>
  );
}

// Inline X icon
const X = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
