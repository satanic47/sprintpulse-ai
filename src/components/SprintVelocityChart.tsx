import React from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, Zap, ShieldAlert } from 'lucide-react';

interface SprintVelocityChartProps {
  tasksCompletedCount: number;
  tasksInFlightCount: number;
  blockersCount: number;
  isDark: boolean;
  isDemoData?: boolean;
}

export const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({
  tasksCompletedCount = 4,
  tasksInFlightCount = 3,
  blockersCount = 1,
  isDark,
  isDemoData = false
}) => {
  const total = Math.max(1, tasksCompletedCount + tasksInFlightCount + blockersCount);
  const completedPct = Math.round((tasksCompletedCount / total) * 100);
  const inFlightPct = Math.round((tasksInFlightCount / total) * 100);
  const blockerPct = Math.max(0, 100 - completedPct - inFlightPct);

  // Dynamic Sprint Health Score formula: penalizes blockers heavily
  const rawScore = 100 - blockersCount * 18 + (tasksCompletedCount >= 2 ? 8 : 0);
  const healthScore = Math.max(35, Math.min(99, rawScore));

  // Delivery Confidence calculation
  const confidencePct = Math.max(40, Math.min(98, 100 - blockersCount * 12));

  return (
    <div
      className={`rounded-xl p-4 border font-mono text-xs transition-all ${
        isDark
          ? 'bg-[#050505] border-[#1a1a1a] text-slate-200'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00ff66]" />
          <span className="font-bold uppercase tracking-wider text-xs">
            Sprint Velocity & Burndown Health
          </span>
          {isDemoData && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#ffcc00]/10 border border-[#ffcc00]/40 text-[#ffcc00] animate-pulse">
              [DEMO DATA - PRELOADED PRESET]
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="text-[#00ff66] font-bold">{healthScore}%</span>
            <span className="opacity-60">Sprint Health</span>
          </span>
          <span className="opacity-30">|</span>
          <span className="flex items-center gap-1">
            <span className="text-[#00f0ff] font-bold">{confidencePct}%</span>
            <span className="opacity-60">Confidence</span>
          </span>
        </div>
      </div>

      {/* Multi-segment Cyberpunk Progress Bar */}
      <div className="w-full h-3 rounded-full bg-[#111111] overflow-hidden flex border border-gray-800 mb-3 shadow-inner">
        <div
          style={{ width: `${completedPct}%` }}
          className="bg-gradient-to-r from-[#00ff66] to-[#00d655] h-full transition-all duration-500 relative group"
          title={`Completed: ${tasksCompletedCount} tasks (${completedPct}%)`}
        />
        <div
          style={{ width: `${inFlightPct}%` }}
          className="bg-gradient-to-r from-[#00f0ff] to-[#00b0ff] h-full transition-all duration-500 relative group"
          title={`In Flight: ${tasksInFlightCount} tasks (${inFlightPct}%)`}
        />
        <div
          style={{ width: `${blockerPct}%` }}
          className="bg-gradient-to-r from-[#ff0055] to-[#ff3366] h-full transition-all duration-500 relative group"
          title={`Blockers: ${blockersCount} items (${blockerPct}%)`}
        />
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-2 rounded-lg border flex flex-col items-center justify-center ${
            isDark ? 'bg-[#0a0a0a] border-[#00ff66]/20' : 'bg-white border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-1 text-[#00ff66] text-[10px] font-bold uppercase mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </div>
          <span className="text-sm font-black text-[#00ff66]">{tasksCompletedCount} tasks</span>
          <span className="text-[9px] opacity-60">{completedPct}% of scope</span>
        </div>

        <div
          className={`p-2 rounded-lg border flex flex-col items-center justify-center ${
            isDark ? 'bg-[#0a0a0a] border-[#00f0ff]/20' : 'bg-white border-cyan-100'
          }`}
        >
          <div className="flex items-center gap-1 text-[#00f0ff] text-[10px] font-bold uppercase mb-0.5">
            <Clock className="w-3 h-3" />
            <span>In Flight</span>
          </div>
          <span className="text-sm font-black text-[#00f0ff]">{tasksInFlightCount} active</span>
          <span className="text-[9px] opacity-60">{inFlightPct}% ongoing</span>
        </div>

        <div
          className={`p-2 rounded-lg border flex flex-col items-center justify-center ${
            isDark ? 'bg-[#0a0a0a] border-[#ff0055]/20' : 'bg-white border-red-100'
          }`}
        >
          <div className="flex items-center gap-1 text-[#ff0055] text-[10px] font-bold uppercase mb-0.5">
            <ShieldAlert className="w-3 h-3" />
            <span>Blockers</span>
          </div>
          <span className="text-sm font-black text-[#ff0055]">{blockersCount} flagged</span>
          <span className="text-[9px] opacity-60">{blockerPct}% blocked</span>
        </div>
      </div>
    </div>
  );
};
