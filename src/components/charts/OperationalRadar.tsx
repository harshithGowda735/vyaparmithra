import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface OperationalRadarProps {
  data?: Array<{ subject: string; score: number; fullMark: number }>;
}

const defaultData = [
  { subject: 'Finance', score: 85, fullMark: 100 },
  { subject: 'Marketing', score: 60, fullMark: 100 },
  { subject: 'Tech', score: 75, fullMark: 100 },
  { subject: 'Support', score: 80, fullMark: 100 },
  { subject: 'Ops', score: 90, fullMark: 100 },
];

export default function OperationalRadar({ data = defaultData }: OperationalRadarProps) {
  return (
    <div className="w-full h-[280px] md:h-[320px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#dde3e9', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Operational Balance"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
