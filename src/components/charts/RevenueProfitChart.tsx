import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DataPoint {
  name: string;
  revenue: number;
  profit: number;
  expense?: number;
}

interface RevenueProfitChartProps {
  timeframe: 'monthly' | 'weekly';
  backendData?: Array<Record<string, any>>;
}

const monthlyFallback: DataPoint[] = [
  { name: 'Jan', revenue: 3.2, profit: 0.8, expense: 2.4 },
  { name: 'Feb', revenue: 3.6, profit: 0.9, expense: 2.7 },
  { name: 'Mar', revenue: 2.8, profit: 0.7, expense: 2.1 },
  { name: 'Apr', revenue: 4.8, profit: 1.4, expense: 3.4 },
  { name: 'May', revenue: 4.2, profit: 1.1, expense: 3.1 },
  { name: 'Jun', revenue: 5.5, profit: 1.7, expense: 3.8 },
];

const weeklyFallback: DataPoint[] = [
  { name: 'Wk 1', revenue: 0.8, profit: 0.2, expense: 0.6 },
  { name: 'Wk 2', revenue: 1.1, profit: 0.3, expense: 0.8 },
  { name: 'Wk 3', revenue: 0.9, profit: 0.22, expense: 0.68 },
  { name: 'Wk 4', revenue: 1.4, profit: 0.38, expense: 1.02 },
];

// Convert backend data to chart format (scale from raw rupees to lakh)
function normalizeBackendData(raw: Array<Record<string, any>>): DataPoint[] {
  if (!raw || raw.length === 0) return [];
  return raw.map((d) => ({
    name: d.name || d.month || d.period || 'N/A',
    revenue: typeof d.revenue === 'number' ? +(d.revenue / 1_00_000).toFixed(2) : +(d.revenue || 0),
    profit: typeof d.profit === 'number' ? +(d.profit / 1_00_000).toFixed(2) : +(d.profit || 0),
    expense: typeof d.expense === 'number' ? +(d.expense / 1_00_000).toFixed(2) : 
             typeof d.expenses === 'number' ? +(d.expenses / 1_00_000).toFixed(2) : undefined,
  }));
}

export default function RevenueProfitChart({ timeframe, backendData }: RevenueProfitChartProps) {
  // Prefer backend data, then fall back to static data
  const normalizedBackend = backendData ? normalizeBackendData(backendData) : [];
  const data = normalizedBackend.length > 0 
    ? normalizedBackend 
    : (timeframe === 'monthly' ? monthlyFallback : weeklyFallback);

  const isLive = normalizedBackend.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 rounded-xl border border-white/5 text-xs shadow-2xl bg-[#111827]/95">
          <p className="font-bold text-slate-200 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-semibold">
              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: ₹{p.value}L
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-2">
      {isLive && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-bold">Live Backend Data</span>
        </div>
      )}
      <div className="w-full h-[280px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRev)" 
            />
            {data[0]?.expense !== undefined && (
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={1} 
                fill="url(#colorExpense)" 
              />
            )}
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#d97706" 
              strokeWidth={2.5}
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
          <span className="text-[10px] text-slate-400">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-500 inline-block rounded" style={{ borderTop: '2px dashed #d97706' }} />
          <span className="text-[10px] text-slate-400">Profit</span>
        </div>
        {data[0]?.expense !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block rounded" style={{ borderTop: '2px dashed #ef4444' }} />
            <span className="text-[10px] text-slate-400">Expense</span>
          </div>
        )}
      </div>
    </div>
  );
}
