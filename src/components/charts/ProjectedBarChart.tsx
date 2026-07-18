import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SimulationResponse } from '../../services/api';

interface GrowthPoint {
  quarter: string;
  current: number;
  optimized: number;
}

interface ProjectedBarChartProps {
  data?: GrowthPoint[];
  simulationResult?: SimulationResponse | null;
}

const defaultData: GrowthPoint[] = [
  { quarter: 'Q1', current: 30, optimized: 45 },
  { quarter: 'Q2', current: 35, optimized: 55 },
  { quarter: 'Q3', current: 40, optimized: 70 },
  { quarter: 'Q4', current: 38, optimized: 85 },
  { quarter: "Q1 '27", current: 45, optimized: 100 },
];

function buildFromSimulation(result: SimulationResponse): GrowthPoint[] {
  const currentL = +(result.new_monthly_revenue - result.estimated_revenue_increase) / 1_00_000;
  const newL = +result.new_monthly_revenue / 1_00_000;
  
  return [
    { quarter: 'M1', current: +currentL.toFixed(1), optimized: +(currentL * 1.02).toFixed(1) },
    { quarter: 'M3', current: +currentL.toFixed(1), optimized: +(currentL + newL * 0.25).toFixed(1) },
    { quarter: 'M6', current: +(currentL * 1.02).toFixed(1), optimized: +(currentL + newL * 0.5).toFixed(1) },
    { quarter: 'M9', current: +(currentL * 1.03).toFixed(1), optimized: +(currentL + newL * 0.75).toFixed(1) },
    { quarter: 'M12', current: +(currentL * 1.05).toFixed(1), optimized: +newL.toFixed(1) },
  ];
}

export default function ProjectedBarChart({ data, simulationResult }: ProjectedBarChartProps) {
  const chartData = simulationResult 
    ? buildFromSimulation(simulationResult) 
    : (data || defaultData);

  const isLive = !!simulationResult;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-xs shadow-2xl bg-slate-900/95">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          <p className="text-slate-400">
            Current: <span className="text-white font-semibold">₹{payload[0].value}L</span>
          </p>
          <p className="text-blue-400">
            Projected: <span className="text-blue-400 font-semibold">₹{payload[1].value}L</span>
          </p>
          {isLive && (
            <p className="text-emerald-400 text-[9px] mt-1 font-bold">▲ Live Backend Projection</p>
          )}
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
          <span className="text-[10px] text-green-400 font-bold">Live Backend Projection</span>
        </div>
      )}
      <div className="w-full h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="quarter" 
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
            <Bar dataKey="current" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Current" />
            <Bar dataKey="optimized" fill="#2563eb" radius={[4, 4, 0, 0]} name="Projected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-white/10 inline-block rounded-sm" />
          <span className="text-[10px] text-slate-400">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-600 inline-block rounded-sm" />
          <span className="text-[10px] text-slate-400">Projected</span>
        </div>
      </div>
    </div>
  );
}
