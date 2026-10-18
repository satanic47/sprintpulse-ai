import React, { useState } from 'react';
import { X, Check, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LinearJiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isDark: boolean;
}

export const LinearJiraModal: React.FC<LinearJiraModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  isDark
}) => {
  const [platform, setPlatform] = useState<'linear' | 'jira'>('linear');
  const [ticketKey, setTicketKey] = useState<string>('ENG-1042');
  const [status, setStatus] = useState<'idle' | 'posting' | 'success'>('idle');

  if (!isOpen) return null;

  const handlePost = async () => {
    setStatus('posting');
    await new Promise(r => setTimeout(r, 800));
    setStatus('success');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5E6AD2', '#0052CC', '#36B37E']
    });
    setTimeout(() => {
      setStatus('idle');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#0f172a] border-[#1e293b] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                platform === 'linear' ? 'bg-[#5E6AD2]' : 'bg-[#0052CC]'
              }`}
            >
              {platform === 'linear' ? 'LIN' : 'JIRA'}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Post to Linear / Jira</h3>
              <p className="text-[11px] opacity-70">Attach sprint progress and blocker note to ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPlatform('linear')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                platform === 'linear'
                  ? 'bg-[#5E6AD2]/20 border-[#5E6AD2] text-[#5E6AD2]'
                  : 'opacity-60 border-transparent hover:opacity-100'
              }`}
            >
              Linear Issue
            </button>
            <button
              onClick={() => setPlatform('jira')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                platform === 'jira'
                  ? 'bg-[#0052CC]/20 border-[#0052CC] text-[#0052CC]'
                  : 'opacity-60 border-transparent hover:opacity-100'
              }`}
            >
              Jira Ticket
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              Ticket Key (Issue ID)
            </label>
            <input
              type="text"
              value={ticketKey}
              onChange={e => setTicketKey(e.target.value.toUpperCase())}
              placeholder="e.g. ENG-1042 or SPRINT-88"
              className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none ${
                isDark
                  ? 'bg-[#090d18] border-[#1e293b] text-indigo-300 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-600'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">Comment Preview</label>
            <div
              className={`text-[11px] font-mono p-3 rounded-xl border max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
                isDark ? 'bg-[#090d18] border-[#1e293b] text-slate-300' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {content}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium opacity-80 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={status === 'posting'}
              className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all ${
                platform === 'linear' ? 'bg-[#5E6AD2] hover:bg-[#4d59bc]' : 'bg-[#0052CC] hover:bg-[#0047b3]'
              }`}
            >
              {status === 'success' ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {status === 'posting' ? 'Posting...' : status === 'success' ? 'Posted!' : `Post to ${ticketKey}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
