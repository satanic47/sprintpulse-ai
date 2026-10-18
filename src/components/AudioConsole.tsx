import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, FastForward, RotateCcw } from 'lucide-react';
import { WaveBookmark } from './AudioWave';

interface AudioConsoleProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isDark: boolean;
  bookmarks?: WaveBookmark[];
  onSeekBookmark?: (seconds: number) => void;
}

export const AudioConsole: React.FC<AudioConsoleProps> = ({
  audioUrl,
  isPlaying,
  onTogglePlay,
  audioRef,
  isDark,
  bookmarks = [],
  onSeekBookmark
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current, audioUrl]);

  if (!audioUrl) return null;

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 font-mono text-xs transition-all ${
        isDark ? 'bg-[#050505] border-[#1a1a1a] shadow-inner' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-xl bg-[#00ff66] hover:bg-[#00e65c] text-black font-bold flex items-center justify-center transition-all shadow-md shadow-[#00ff66]/20 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div>
            <span className="font-bold text-[11px] text-[#00ff66] block">
              Developer Audio Console
            </span>
            <span className="text-[10px] opacity-60">
              {formatTime(currentTime)} / {formatTime(duration || 12)}
            </span>
          </div>
        </div>

        {/* Speed Multiplier Toggles */}
        <div className="flex items-center gap-1">
          {[1, 1.25, 1.5, 2].map(speed => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                playbackSpeed === speed
                  ? 'bg-[#00f0ff] text-black shadow-sm'
                  : 'bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              {speed}x
            </button>
          ))}

          {/* Download memo */}
          <a
            href={audioUrl}
            download={`sprintpulse-memo-${Date.now()}.webm`}
            className="ml-1 p-1.5 rounded-lg border border-gray-700/50 hover:border-[#00ff66] text-[#00f0ff] hover:text-[#00ff66] transition-colors"
            title="Download WebM audio memo"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 30}
          step={0.1}
          value={currentTime}
          onChange={handleSliderSeek}
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00ff66]"
        />
      </div>
    </div>
  );
};
