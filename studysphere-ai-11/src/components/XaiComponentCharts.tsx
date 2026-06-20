import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

// 1. Define the shape of a single data point on the radar
interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

// 2. Define the props this component expects to receive
interface XaiRadarChartProps {
  radarData?: RadarDataPoint[];
  dominantFactor?: string;
  insightText?: string;
}

const XaiComponentCharts: React.FC<XaiRadarChartProps> = ({ radarData, dominantFactor, insightText }) => {
  // Fallback data just in case the backend payload is slow or missing
  const data: RadarDataPoint[] = radarData || [
    { subject: 'Time Complexity', A: 0, fullMark: 100 },
    { subject: 'Space Complexity', A: 0, fullMark: 100 },
    { subject: 'Topic Recency', A: 0, fullMark: 100 },
    { subject: 'Syntax/Logic', A: 0, fullMark: 100 },
  ];

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-lg max-w-md w-full">
      
      {/* Insight Header */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-purple-400 tracking-wider uppercase mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
          SHAP Explainable AI
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-purple-500 pl-3">
          {insightText || "Analyzing your coding patterns..."}
        </p>
      </div>

      {/* The Radar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
              itemStyle={{ color: '#A78BFA' }}
            />
            <Radar
              name="Impact Score"
              dataKey="A"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="#8B5CF6"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dominant Factor Footer */}
      <div className="mt-4 flex justify-between items-center bg-[#0d1117] p-3 rounded-lg border border-gray-800">
        <span className="text-xs text-gray-400 font-semibold uppercase">Dominant Factor</span>
        <span className="text-sm text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded">
          {dominantFactor || "Processing..."}
        </span>
      </div>

    </div>
  );
};

export default XaiComponentCharts;