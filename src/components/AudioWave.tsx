import React from 'react';
import { Bookmark, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface WaveBookmark {
  id: string;
  timestamp: string; // e.g. "00:14"
  label: string; // e.g. "Blocker: Sarah review"
  positionPct: number; // 0 to 100
  type: 'blocker' | 'risk';
}

interface AudioWaveProps {
  isActive: boolean;
  barCount?: number;
  bookmarks?: WaveBookmark[];
  onSelectBookmark?: (bookmark: WaveBookmark) => void;
}

export const AudioWave: React.FC<AudioWaveProps> = ({
  isActive,
  barCount = 36,
  bookmarks = [],
  onSelectBookmark
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative flex items-center justify-between gap-1 h-14 px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-inner">
        {/* Animated Audio Spectrum Bars */}
        {Array.from({ length: barCount }).map((_, i) => {
          const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
          const heightMultiplier = Math.max(0.15, 1 - centerDistance * 0.7);
          const delay = (i * 0.04).toFixed(2);
          const duration = (0.4 + (i % 7) * 0.1).toFixed(2);

          const isCyan = i % 3 === 0;
          const isYellow = i % 7 === 0;
          const barColor = isYellow
            ? 'from-[#ffcc00] to-[#ff6600]'
            : isCyan
            ? 'from-[#00f0ff] to-[#0088ff]'
            : 'from-[#00ff66] via-[#05f292] to-[#00f0ff]';

          return (
            <span
              key={i}
              className={`flex-1 rounded-full transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-t ${barColor} wispr-bar shadow-[0_0_8px_rgba(0,255,102,0.4)]`
                  : 'bg-[#151515]'
              }`}
              style={{
                height: isActive ? `${Math.max(15, Math.round(heightMultiplier * 46))}px` : '4px',
                animationDelay: isActive ? `${delay}s` : '0s',
                animationDuration: isActive ? `${duration}s` : '1s',
              }}
            />
          );
        })}

        {/* Blocker Timestamp Bookmark Markers Overlay */}
        {bookmarks.map((bm) => (
          <button
            key={bm.id}
            onClick={() => onSelectBookmark && onSelectBookmark(bm)}
            style={{ left: `${Math.min(94, Math.max(4, bm.positionPct))}%` }}
            className={`absolute top-1 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10 transition-transform hover:scale-110`}
            title={`Jump to [${bm.timestamp}]: ${bm.label}`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-lg animate-pulse ${
                bm.type === 'blocker'
                  ? 'bg-[#ff0055] text-white shadow-[#ff0055]/50'
                  : 'bg-[#ffcc00] text-black shadow-[#ffcc00]/50'
              }`}
            >
              !
            </span>
            <span className="w-0.5 h-7 bg-gradient-to-b from-[#ff0055] to-transparent opacity-75" />
          </button>
        ))}
      </div>

      {/* Bookmarks pills tray if any blockers detected */}
      {bookmarks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          <span className="opacity-60 flex items-center gap-1 text-[#ff0055]">
            <ShieldAlert className="w-3 h-3" />
            <span>Waveform Audio Bookmarks:</span>
          </span>
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => onSelectBookmark && onSelectBookmark(bm)}
              className="px-2 py-0.5 rounded-md bg-[#ff0055]/10 border border-[#ff0055]/40 text-[#ff0055] hover:bg-[#ff0055]/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="font-bold">[{bm.timestamp}]</span>
              <span className="truncate max-w-[150px]">{bm.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
