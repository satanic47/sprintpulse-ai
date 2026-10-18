import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Clock, Users, Zap, ShieldCheck } from 'lucide-react';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  totalWordsDictated: number;
}

export const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  isOpen,
  onClose,
  isDark,
  totalWordsDictated
}) => {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(55); // $ / hr
  const [standupsPerWeek, setStandupsPerWeek] = useState<number>(5);

  if (!isOpen) return null;

  // Typing speed = 40 WPM. Wispr speed = 175 WPM.
  // Average standup + PR documentation per dev per day = ~350 words.
  const wordsPerDevPerWeek = 350 * standupsPerWeek;
  const teamWordsPerMonth = wordsPerDevPerWeek * 4 * teamSize;

  const typingHoursPerMonth = (teamWordsPerMonth / 40) / 60;
  const speakingHoursPerMonth = (teamWordsPerMonth / 175) / 60;
  const hoursSavedPerMonth = Math.round(typingHoursPerMonth - speakingHoursPerMonth);
  const dollarSavingsPerMonth = Math.round(hoursSavedPerMonth * hourlyRate);
  const velocityGainPercent = Math.min(28, Math.round((hoursSavedPerMonth / (teamSize * 160)) * 100 * 2.5));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-xl rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#050505] border-[#00ff66]/30 text-white shadow-[#00ff66]/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00ff66]/20 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                Developer ROI & Sprint Velocity Calculator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff66]/20 text-[#00ff66] font-mono border border-[#00ff66]/30">
                  Wispr Flow 4.4x
                </span>
              </h3>
              <p className="text-[11px] opacity-70">Quantifying time and cost savings from voice-first sprint reporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
              <label className="block text-[11px] opacity-70 mb-1">Engineering Team Size</label>
              <div className="flex items-center justify-between font-mono">
                <span className="text-lg font-bold text-[#00f0ff]">{teamSize}</span>
                <span className="text-xs opacity-50">devs</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={teamSize}
                onChange={e => setTeamSize(Number(e.target.value))}
                className="w-full mt-2 accent-[#00f0ff]"
              />
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
              <label className="block text-[11px] opacity-70 mb-1">Avg Dev Rate ($/hr)</label>
              <div className="flex items-center justify-between font-mono">
                <span className="text-lg font-bold text-[#00ff66]">${hourlyRate}</span>
                <span className="text-xs opacity-50">/ hr</span>
              </div>
              <input
                type="range"
                min={20}
                max={150}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full mt-2 accent-[#00ff66]"
              />
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
              <label className="block text-[11px] opacity-70 mb-1">Standups / Week</label>
              <div className="flex items-center justify-between font-mono">
                <span className="text-lg font-bold text-[#ffcc00]">{standupsPerWeek}</span>
                <span className="text-xs opacity-50">days</span>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                value={standupsPerWeek}
                onChange={e => setStandupsPerWeek(Number(e.target.value))}
                className="w-full mt-2 accent-[#ffcc00]"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0c0c0c] border-[#00ff66]/30 shadow-lg shadow-[#00ff66]/5' : 'bg-emerald-50 border-emerald-200'}`}>
              <Clock className="w-5 h-5 mx-auto text-[#00ff66] mb-1" />
              <span className="block text-2xl font-black font-mono text-[#00ff66]">
                {hoursSavedPerMonth}h
              </span>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider">Hours Saved / Mo</span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0c0c0c] border-[#00f0ff]/30 shadow-lg shadow-[#00f0ff]/5' : 'bg-cyan-50 border-cyan-200'}`}>
              <DollarSign className="w-5 h-5 mx-auto text-[#00f0ff] mb-1" />
              <span className="block text-2xl font-black font-mono text-[#00f0ff]">
                ${dollarSavingsPerMonth.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider">Cost Value / Mo</span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0c0c0c] border-[#ffcc00]/30 shadow-lg shadow-[#ffcc00]/5' : 'bg-amber-50 border-amber-200'}`}>
              <Zap className="w-5 h-5 mx-auto text-[#ffcc00] mb-1" />
              <span className="block text-2xl font-black font-mono text-[#ffcc00]">
                +{velocityGainPercent}%
              </span>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider">Velocity Boost</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[#00ff66] font-bold">Wispr Voice Velocity Formula:</span> Developers dictate at ~175 WPM vs 40 WPM average typing. Saving 18 minutes per engineer every working day returns <span className="text-white font-bold">{hoursSavedPerMonth} hours of deep focus coding time</span> back to your sprint cycle every month.
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00ff66] hover:bg-[#00e65c] text-black font-bold text-xs shadow-lg shadow-[#00ff66]/20 transition-all font-mono"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
