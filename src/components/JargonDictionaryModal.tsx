import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Plus, Trash2, ExternalLink } from 'lucide-react';

interface JargonDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const JargonDictionaryModal: React.FC<JargonDictionaryModalProps> = ({
  isOpen,
  onClose,
  isDark
}) => {
  const [jargonList, setJargonList] = useState<string[]>([
    'Kubernetes',
    'Redis multi-exec',
    'GraphQL',
    'microservices',
    'idempotency',
    'Prometheus exporter',
    'Apache Kafka',
    'gRPC proto',
    'OAuth2 refresh token',
    'SemVer changelog',
    'AWS Secrets Manager',
    'ArgoCD GitOps',
    'Trivy scan',
    'Datadog telemetry',
    'PostgreSQL RLS'
  ]);

  const [newWord, setNewWord] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newWord.trim() && !jargonList.includes(newWord.trim())) {
      setJargonList([...jargonList, newWord.trim()]);
      setNewWord('');
    }
  };

  const handleRemove = (word: string) => {
    setJargonList(jargonList.filter(w => w !== word));
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(jargonList.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#050505] border-[#00f0ff]/30 text-white shadow-[#00f0ff]/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Wispr Flow Jargon Tuner</h3>
              <p className="text-[11px] opacity-70">Custom developer dictionary for enhanced acoustic recognition</p>
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
            <input
              type="text"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add technical term (e.g. Istio ServiceMesh)..."
              className={`flex-1 text-xs font-mono p-2.5 rounded-xl border focus:outline-none ${
                isDark
                  ? 'bg-[#0a0a0a] border-[#1f293d] text-[#00f0ff] focus:border-[#00f0ff]'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
              }`}
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 bg-[#00f0ff] hover:bg-[#00d8e6] text-black font-bold text-xs rounded-xl flex items-center gap-1 font-mono transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div>
            <label className="block text-[11px] opacity-70 mb-2 font-mono">
              Active Tuned Vocabulary ({jargonList.length} terms):
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl border border-gray-500/10">
              {jargonList.map(term => (
                <span
                  key={term}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                    isDark
                      ? 'bg-[#0a0a0a] border-[#00f0ff]/20 text-[#00f0ff]'
                      : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                  }`}
                >
                  <span>{term}</span>
                  <button
                    onClick={() => handleRemove(term)}
                    className="opacity-50 hover:opacity-100 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] opacity-60 font-mono">
              Paste directly into Wispr Flow &gt; Settings &gt; Dictionary
            </span>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied All Terms!' : 'Copy Terms for Wispr Flow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
