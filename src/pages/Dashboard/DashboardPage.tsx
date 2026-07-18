import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import OperationalRadar from '../../components/charts/OperationalRadar';
import RevenueProfitChart from '../../components/charts/RevenueProfitChart';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Package, 
  Users, 
  Rocket, 
  Plus, 
  Check, 
  Heart,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { 
    profile, 
    updateProfile, 
    fetchDashboard, 
    dashboardData, 
    isLoadingDashboard, 
    backendStatus,
    checkBackendHealth
  } = useBusinessStore();
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  
  const [revenueInput, setRevenueInput] = useState(profile.revenue);
  const [empInput, setEmpInput] = useState(profile.employees);
  const [scoreInput, setScoreInput] = useState(profile.healthScore);

  // Fetch dashboard data from backend on mount
  useEffect(() => {
    const init = async () => {
      const connected = await checkBackendHealth();
      if (connected) {
        await fetchDashboard();
        toast.success('Connected to VyaparMitra Backend ✓');
      } else {
        toast.warning('Backend offline – showing cached data');
      }
    };
    init();
  }, []);

  const handleSaveMetrics = () => {
    updateProfile({
      revenue: revenueInput,
      employees: Number(empInput),
      healthScore: Number(scoreInput)
    });
    setIsEditingMetrics(false);
  };

  // Build KPIs from backend data if available, else fallback to local
  const buildKpis = () => {
    if (dashboardData) {
      const fmt = (n: number) => n >= 1_00_000 
        ? `₹${(n / 1_00_000).toFixed(1)}L` 
        : n >= 1000 
          ? `₹${(n / 1000).toFixed(0)}K`
          : `₹${n.toFixed(0)}`;
      return [
        { title: 'Revenue', value: fmt(dashboardData.revenue), change: `+${dashboardData.growth_pct.toFixed(1)}%`, isPositive: true, icon: DollarSign, color: 'blue' },
        { title: 'Profit', value: fmt(dashboardData.profit), change: dashboardData.profit > 0 ? '+' : '', isPositive: dashboardData.profit > 0, icon: TrendingUp, color: 'purple' },
        { title: 'Expenses', value: fmt(dashboardData.expenses), change: '-2%', isPositive: true, icon: CreditCard, color: 'orange' },
        { title: 'Cash Flow', value: fmt(dashboardData.cash_flow), change: dashboardData.cash_flow > 0 ? 'Positive' : 'Negative', isPositive: dashboardData.cash_flow > 0, icon: Package, color: 'green' },
        { title: 'Employees', value: String(profile.employees), change: '+2 New', isPositive: true, icon: Users, color: 'blue' },
        { title: 'Growth', value: `${dashboardData.growth_pct.toFixed(1)}%`, change: 'Trending', isPositive: dashboardData.growth_pct > 0, icon: Rocket, color: 'purple' },
      ];
    }
    return [
      { title: 'Revenue', value: '₹4.2M', change: '+12%', isPositive: true, icon: DollarSign, color: 'blue' },
      { title: 'Profit', value: '₹1.1M', change: '+8.4%', isPositive: true, icon: TrendingUp, color: 'purple' },
      { title: 'Expenses', value: '₹2.8M', change: '-2%', isPositive: true, icon: CreditCard, color: 'orange' },
      { title: 'Inventory', value: '842', change: 'Stable', isPositive: true, icon: Package, color: 'green' },
      { title: 'Employees', value: String(profile.employees), change: '+2 New', isPositive: true, icon: Users, color: 'blue' },
      { title: 'Growth', value: '22%', change: 'High', isPositive: true, icon: Rocket, color: 'purple' },
    ];
  };

  const kpis = buildKpis();
  const healthScore = dashboardData ? dashboardData.health_score : profile.healthScore;

  // Get chart data from backend or use empty array (chart component handles fallback)
  const revenueChartData = dashboardData?.charts?.['revenue_expense'] || [];

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Business Command Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 text-sm">
              Real-time analytics for {profile.name} &bull; <span className="text-amber-400">{profile.industry} Sector</span> &bull; {profile.location}
            </p>
            {/* Backend Status Indicator */}
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              backendStatus.isConnected 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {backendStatus.isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {backendStatus.isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchDashboard(); toast.info('Refreshing dashboard data...'); }}
            disabled={isLoadingDashboard}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
            {isLoadingDashboard ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => {
              if (isEditingMetrics) {
                handleSaveMetrics();
              } else {
                setIsEditingMetrics(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
          >
            {isEditingMetrics ? (
              <>
                <Check className="w-4 h-4 text-green-400" /> Save Metrics
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-blue-400" /> Customize
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backend Recommendations (if available) */}
      {dashboardData && dashboardData.recommendations && dashboardData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2"
        >
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">AI Recommendations</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dashboardData.recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-3 bg-white/3 rounded-xl border border-white/5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded mr-2 ${
                  rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                  rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                }`}>{rec.priority}</span>
                <p className="text-xs font-bold text-white mt-1">{rec.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{rec.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Editing Metrics Panel */}
      {isEditingMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-[#111827]/95 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold block">Monthly Revenue</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              value={revenueInput}
              onChange={(e) => setRevenueInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold block">Total Employees</label>
            <input 
              type="number" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              value={empInput}
              onChange={(e) => setEmpInput(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold block">Health Score (1-100)</label>
            <input 
              type="number" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              value={scoreInput}
              onChange={(e) => setScoreInput(Number(e.target.value))}
            />
          </div>
        </motion.div>
      )}

      {/* Top Section: Health Score + Operational Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Business Health Score Card */}
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center justify-between min-h-[420px] shadow-lg shadow-black/10">
          <div className="space-y-2">
            <span className="text-xs text-blue-400 uppercase tracking-widest font-black">Performance Audit</span>
            <h2 className="text-2xl font-extrabold text-white">Business Health Score</h2>
            {dashboardData && (
              <p className="text-[10px] text-slate-500 font-semibold">
                Inventory Risk: <span className={`font-bold ${
                  dashboardData.inventory_risk === 'Low' ? 'text-green-400' :
                  dashboardData.inventory_risk === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{dashboardData.inventory_risk}</span>
              </p>
            )}
          </div>

          {/* Glowing Radial Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="8" fill="transparent" />
              <motion.circle 
                cx="50" cy="50" r="40" stroke="#d97706" strokeWidth="8" fill="transparent" 
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * healthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center">
              <span className="text-5xl font-black text-white">{healthScore}</span>
              <span className="text-slate-400 font-semibold block text-xs mt-1">/ 100</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {dashboardData 
                ? `Revenue: ₹${(dashboardData.revenue / 1_00_000).toFixed(1)}L • Profit: ₹${(dashboardData.profit / 1_00_000).toFixed(1)}L • Growth: ${dashboardData.growth_pct.toFixed(1)}%`
                : 'Your business is performing in the top 15% of MSMEs in your sector. Growth and Operations are leading, while Marketing shows room for optimization.'
              }
            </p>
            <div className="flex justify-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/10">
                Strong Finance
              </span>
              <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/10">
                Optimizing Sales
              </span>
            </div>
          </div>
        </div>

        {/* Operational Balance Radar Card */}
        <div className="glass-card p-8 rounded-3xl flex flex-col justify-between min-h-[420px]">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Structural Balance</span>
            <h2 className="text-2xl font-extrabold text-white">Operational Balance</h2>
          </div>

          <OperationalRadar />

          <p className="text-center text-xs text-gray-500 font-semibold italic">
            {backendStatus.isConnected 
              ? 'Live data from VyaparMitra Backend • Updated just now'
              : 'Gemma AI continuously tracks these scores based on integrated GST returns and sales reports.'}
          </p>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[140px] group hover:scale-[1.03] transition-transform"
            >
              <div className="flex justify-between items-start">
                <span className={`p-2 rounded-lg ${
                  kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                  kpi.color === 'purple' ? 'bg-indigo-500/10 text-indigo-400' :
                  kpi.color === 'orange' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-bold ${
                  kpi.change.startsWith('+') ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className="pt-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{kpi.title}</span>
                <span className="text-lg font-black text-white">{kpi.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Section: Revenue vs Profit trend line graph */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-extrabold">Revenue vs Profit Trend</h3>
            <p className="text-slate-400 text-xs">
              {dashboardData 
                ? 'Live backend analytics data' 
                : 'Comparative analysis over the last 6 months'}
            </p>
          </div>
          
          <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/5">
            <button 
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <RevenueProfitChart timeframe={timeframe} backendData={revenueChartData} />
      </div>

      {/* Recent Activity from Backend */}
      {dashboardData && dashboardData.recent_activity && dashboardData.recent_activity.length > 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData.recent_activity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                <div className={`p-2 rounded-lg text-xs font-black ${
                  activity.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                  activity.type === 'transaction' ? 'bg-green-500/10 text-green-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {activity.type[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{activity.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{activity.description}</p>
                </div>
                <span className="text-[9px] text-slate-500 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
