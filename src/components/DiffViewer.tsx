import React, { useState } from 'react';
import { FileCode, Plus, Minus, Eye, Code2, Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  rawDiff: string;
  isDark: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ rawDiff, isDark }) => {
  const [viewMode, setViewMode] = useState<'syntax' | 'raw'>('syntax');
  const [copied, setCopied] = useState<boolean>(false);

  if (!rawDiff.trim()) {
    return null;
  }

  const lines = rawDiff.split('\n');
  let additions = 0;
  let deletions = 0;

  lines.forEach(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(rawDiff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border font-mono text-xs overflow-hidden transition-all ${
        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Diff Header */}
      <div
        className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 ${
          isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="font-bold text-[11px] text-[#00f0ff] uppercase tracking-wider">
            Git Diff Syntax Viewer
          </span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-1.5 py-0.2 rounded bg-[#00ff66]/10 text-[#00ff66] font-bold">
              +{additions}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#ff0055]/10 text-[#ff0055] font-bold">
              -{deletions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center p-0.5 rounded-lg border text-[10px] ${
              isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setViewMode('syntax')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                viewMode === 'syntax'
                  ? 'bg-[#00f0ff] text-black font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Syntax</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                viewMode === 'raw'
                  ? 'bg-[#00f0ff] text-black font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Raw</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title="Copy diff to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Diff Body */}
      {viewMode === 'raw' ? (
        <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto whitespace-pre font-mono text-slate-300 max-h-48">
          {rawDiff}
        </pre>
      ) : (
        <div className="p-2 space-y-0.5 max-h-56 overflow-y-auto text-[11px] font-mono leading-5">
          {lines.map((line, idx) => {
            if (line.startsWith('+++') || line.startsWith('---')) {
              return (
                <div key={idx} className="text-slate-400 font-bold px-2 py-0.5 bg-white/5 rounded">
                  {line}
                </div>
              );
            }
            if (line.startsWith('+')) {
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] border-l-2 border-[#00ff66]"
                >
                  <span className="opacity-40 select-none w-6 text-right text-[10px]">{idx + 1}</span>
                  <Plus className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span className="break-all">{line.substring(1)}</span>
                </div>
              );
            }
            if (line.startsWith('-')) {
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 px-2 py-0.5 rounded bg-[#ff0055]/15 text-[#ff0055] border-l-2 border-[#ff0055]"
                >
                  <span className="opacity-40 select-none w-6 text-right text-[10px]">{idx + 1}</span>
                  <Minus className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span className="break-all">{line.substring(1)}</span>
                </div>
              );
            }
            if (line.startsWith('@@')) {
              return (
                <div
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] font-bold border-l-2 border-[#00f0ff]"
                >
                  {line}
                </div>
              );
            }
            if (line.startsWith('commit ') || line.startsWith('Author:') || line.startsWith('Date:')) {
              return (
                <div key={idx} className="text-[#ffcc00] font-semibold px-2 py-0.5">
                  {line}
                </div>
              );
            }
            return (
              <div key={idx} className="flex items-start gap-2 px-2 py-0.5 text-slate-400">
                <span className="opacity-30 select-none w-6 text-right text-[10px]">{idx + 1}</span>
                <span className="w-3 flex-shrink-0" />
                <span className="break-all">{line}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
