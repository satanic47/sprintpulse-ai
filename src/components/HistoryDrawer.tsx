import React, { useState } from 'react';
import { X, Search, Clock, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { GeneratedOutput } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedOutput[];
  onSelect: (item: GeneratedOutput) => void;
  onClear: () => void;
  isDark: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  isDark
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = history.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.content.toLowerCase().includes(search.toLowerCase()) ||
    item.format.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (item: GeneratedOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div
        className={`w-full max-w-md h-full flex flex-col p-6 shadow-2xl border-l transition-all ${
          isDark
            ? 'bg-[#0f172a] border-[#1e293b] text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold">Standup & PR History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved standups, PRs, keywords..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${
              isDark
                ? 'bg-[#090d18] border-[#1e293b] text-slate-200 focus:border-purple-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-600'
            }`}
          />
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-50 text-xs">
              No saved sprint updates match your search.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer group transition-all ${
                  isDark
                    ? 'bg-[#0a0f1d] border-[#1e293b] hover:border-purple-500/60'
                    : 'bg-slate-50 border-slate-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-70">
                  <span className="font-mono uppercase font-bold text-purple-400">
                    {item.format}
                  </span>
                  <span>{item.timestamp}</span>
                </div>

                <h4 className="text-xs font-semibold line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h4>

                <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed mb-2 font-mono">
                  {item.content.slice(0, 120)}...
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-gray-500/10 text-[10px]">
                  <span className="opacity-50">{item.stats.words} words</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleCopy(item, e)}
                      className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-mono flex items-center gap-1"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </button>
                    <span className="text-purple-400 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      Load <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-gray-500/20 flex items-center justify-between text-xs">
            <span className="opacity-60">{history.length} items archived</span>
            <button
              onClick={onClear}
              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
