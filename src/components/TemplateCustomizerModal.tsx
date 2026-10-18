import React from 'react';
import { X, Check, Sliders } from 'lucide-react';
import { TemplateSettings, StandupStyle } from '../types';

interface TemplateCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TemplateSettings;
  onSave: (newSettings: TemplateSettings) => void;
  isDark: boolean;
}

export const TemplateCustomizerModal: React.FC<TemplateCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isDark
}) => {
  const [current, setCurrent] = React.useState<TemplateSettings>(settings);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#0f172a] border-[#1e293b] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold tracking-tight">Standup Template Customizer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 opacity-80">Standup Methodology</label>
            <div className="space-y-2">
              {[
                { id: 'scrum', title: 'Agile Scrum', desc: 'Yesterday • Today • Blockers' },
                { id: 'kanban', title: 'Kanban Flow', desc: 'Done • In Flight • Expedite Bottlenecks' },
                { id: 'async-remote', title: 'Async Remote', desc: 'What Shipped • Next Focus • Heads Up' }
              ].map(s => (
                <div
                  key={s.id}
                  onClick={() => setCurrent({ ...current, style: s.id as StandupStyle })}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    current.style === s.id
                      ? 'bg-purple-600/20 border-purple-500 shadow-sm'
                      : isDark
                      ? 'bg-[#090d18] border-[#1e293b] hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold">{s.title}</h4>
                    <p className="text-[11px] opacity-60">{s.desc}</p>
                  </div>
                  {current.style === s.id && <Check className="w-4 h-4 text-purple-400" />}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-2 border-t border-gray-500/10">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs opacity-80">Enable Emoji Markers (⚡, 🛑, 🚀)</span>
              <input
                type="checkbox"
                checked={current.emojis}
                onChange={e => setCurrent({ ...current, emojis: e.target.checked })}
                className="rounded accent-purple-600 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs opacity-80">Include Smart Action Items for Blockers</span>
              <input
                type="checkbox"
                checked={current.includeActionItems}
                onChange={e => setCurrent({ ...current, includeActionItems: e.target.checked })}
                className="rounded accent-purple-600 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs opacity-80">Append Recent Git Commit Hashes</span>
              <input
                type="checkbox"
                checked={current.includeGitLogs}
                onChange={e => setCurrent({ ...current, includeGitLogs: e.target.checked })}
                className="rounded accent-purple-600 w-4 h-4"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium opacity-80 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
