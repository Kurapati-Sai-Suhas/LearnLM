import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Activity } from "lucide-react";
import api from "@/services/api";

// --- Premium dark tooltip for Recharts ---
const PremiumTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0a0f1e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
      {label !== undefined && (
        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2">{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: entry.color, color: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-white font-mono font-semibold">
            {entry.value}
            {entry.unit || ""}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AITutor() {
  const [data, setData] = useState({
    univariate: [],
    bivariate: []
  });

  useEffect(() => {
    api.get("/analytics/charts/")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Analytics failed", err));
  }, []);

  // shared axis/grid styling
  const axisTick = { fill: "#94a3b8", fontSize: 11, fontFamily: "ui-monospace, monospace" };
  const axisLine = { stroke: "rgba(255,255,255,0.08)" };
  const gridStroke = "rgba(255,255,255,0.04)";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#08091a] to-[#050612] -m-6 p-6 md:p-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-indigo-600/12 blur-[130px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-cyan-500/8 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[120px]" />
      </div>

      <div className="relative space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.25em] bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-1 rounded-md">
              <Activity className="h-3 w-3"/> Live Telemetry
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" />
            Performance Analytics
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Data-driven insights into your learning patterns, distributions, and correlations.
          </p>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Datasets", value: (data.univariate?.length || 0) + (data.bivariate?.length || 0), accent: "text-indigo-300", glow: "shadow-[0_0_20px_rgba(99,102,241,0.25)]" },
            { label: "Score Buckets", value: data.univariate?.length || 0, accent: "text-cyan-300", glow: "shadow-[0_0_20px_rgba(34,211,238,0.25)]" },
            { label: "Subjects Tracked", value: data.bivariate?.length || 0, accent: "text-emerald-300", glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]" },
            { label: "Charts Rendered", value: 2, accent: "text-violet-300", glow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">{kpi.label}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.accent}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* CHARTS GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* CHART 1: UNIVARIATE (Histogram) */}
          <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none"/>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"/>
            
            <div className="relative p-6 pb-3">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    <BarChart3 className="h-5 w-5 text-white"/>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">Score Distribution</h3>
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Univariate</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3"/> Histogram
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-2">How consistent are your quiz results?</p>
            </div>

            <CardContent className="relative h-[300px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.univariate} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="indigoBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis 
                    dataKey="range" 
                    tick={axisTick} 
                    axisLine={axisLine}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={axisTick}
                    axisLine={axisLine}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={<PremiumTooltip />}
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#indigoBar)" 
                    radius={[6, 6, 0, 0]} 
                    name="Number of Quizzes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* CHART 2: BIVARIATE (Scatter / Correlation) */}
          <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none"/>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"/>
            
            <div className="relative p-6 pb-3">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <TrendingUp className="h-5 w-5 text-white"/>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">Effort vs. Impact</h3>
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Bivariate</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3"/> Scatter
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Does studying more lead to higher scores?</p>
            </div>

            <CardContent className="relative h-[300px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                  <defs>
                    <radialGradient id="emeraldDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                    </radialGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis 
                    type="number" 
                    dataKey="hours_studied" 
                    name="Hours Studied" 
                    unit="h" 
                    tick={axisTick}
                    axisLine={axisLine}
                    tickLine={false}
                    label={{ value: 'Hours Studied', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="average_score" 
                    name="Avg Score" 
                    unit=" pts" 
                    tick={axisTick}
                    axisLine={axisLine}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={<PremiumTooltip />}
                    cursor={{ strokeDasharray: '3 3', stroke: 'rgba(16,185,129,0.3)' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                    iconType="circle"
                  />
                  <Scatter 
                    name="Subjects" 
                    data={data.bivariate} 
                    fill="url(#emeraldDot)"
                    shape={(props: any) => (
                      <g>
                        <circle 
                          cx={props.cx} 
                          cy={props.cy} 
                          r={8} 
                          fill="#34d399" 
                          opacity={0.25}
                        />
                        <circle 
                          cx={props.cx} 
                          cy={props.cy} 
                          r={4} 
                          fill="#6ee7b7"
                          stroke="#0a0f1e"
                          strokeWidth={1.5}
                        />
                      </g>
                    )}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Empty state hint */}
        {data.univariate.length === 0 && data.bivariate.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 opacity-70">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-indigo-500/15 blur-2xl rounded-full"/>
              <div className="relative h-12 w-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                <BarChart3 className="h-5 w-5 text-indigo-300"/>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              No analytics data yet. Complete a few quizzes to see your performance charts populate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}