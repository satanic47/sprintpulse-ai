import React, { useState } from 'react';
import { Users, Plus, Trash2, Copy, Check, Sparkles, Send, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeamMemberUpdate } from '../types';

interface TeamDigestModeProps {
  isDark: boolean;
  onSendToSlack: (content: string) => void;
}

export const TeamDigestMode: React.FC<TeamDigestModeProps> = ({ isDark, onSendToSlack }) => {
  const [members, setMembers] = useState<TeamMemberUpdate[]>([
    {
      id: 'm-1',
      name: 'Alex Rivera',
      role: 'Frontend Lead',
      avatar: '👨‍💻',
      transcript:
        'Yesterday finished the dark mode CSS architecture and responsive navigation drawer. Today working on integrating the Web Speech API audio visualizer. Blocker: waiting on Figma design tokens for mobile modal.'
    },
    {
      id: 'm-2',
      name: 'Maya Chen',
      role: 'Backend Architect',
      avatar: '👩‍💻',
      transcript:
        'Yesterday resolved the Redis session invalidation multi-exec transaction bug. Today writing end-to-end integration tests for Stripe webhook retries and idempotency keys. No blockers.'
    },
    {
      id: 'm-3',
      name: 'Samir Patel',
      role: 'DevOps & Cloud',
      avatar: '🚀',
      transcript:
        'Yesterday deployed the new Kubernetes Helm chart to staging EKS cluster. Today setting up Prometheus metrics exporter for queue autoscaling. Blocker: need IAM role permission approval.'
    }
  ]);

  const [activeMemberId, setActiveMemberId] = useState<string>('m-1');
  const [digestContent, setDigestContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleUpdateTranscript = (id: string, text: string) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, transcript: text } : m)));
  };

  const handleAddMember = () => {
    const newId = `m-${Date.now()}`;
    const newMember: TeamMemberUpdate = {
      id: newId,
      name: `Engineer ${members.length + 1}`,
      role: 'Software Engineer',
      avatar: '💻',
      transcript: 'Yesterday implemented core features. Today continuing with testing and reviews.'
    };
    setMembers(prev => [...prev, newMember]);
    setActiveMemberId(newId);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    if (activeMemberId === id) {
      setActiveMemberId(members[0].id);
    }
  };

  const handleSynthesizeDigest = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let digest = `*🏢 Daily Consolidated Engineering Digest*\n*Date:* ${today}\n*Team Roster:* ${members.length} engineers reporting\n\n`;

    members.forEach(m => {
      digest += `*${m.avatar} ${m.name} (${m.role})*\n`;
      const sentences = m.transcript.split(/(?<=[.?!])\s+/).filter(Boolean);
      sentences.forEach(s => {
        digest += `• ${s.trim()}\n`;
      });
      digest += `\n`;
    });

    digest += `---\n_Consolidated with SprintPulse AI • Powered by Wispr Flow 🎙️_`;
    setDigestContent(digest);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8b5cf6', '#ec4899', '#38bdf8']
    });
  };

  const handleCopy = () => {
    if (!digestContent) return;
    navigator.clipboard.writeText(digestContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeMember = members.find(m => m.id === activeMemberId) || members[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left: Member selection & voice dictation */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div
          className={`border rounded-2xl p-5 shadow-xl ${
            isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-sm font-bold uppercase font-mono tracking-wide">
                Team Standup Members
              </h2>
            </div>
            <button
              onClick={handleAddMember}
              className="px-2.5 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 font-mono transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          </div>

          {/* Member chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMemberId(m.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  activeMemberId === m.id
                    ? 'bg-purple-600/20 border-purple-500 shadow-sm'
                    : isDark
                    ? 'bg-[#0a0f1d] border-[#1e293b] text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{m.avatar}</span>
                    <span className="truncate">{m.name}</span>
                  </div>
                  <p className="text-[10px] opacity-60 truncate">{m.role}</p>
                </div>
                {members.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveMember(m.id);
                    }}
                    className="opacity-40 hover:opacity-100 text-red-400 p-1"
                    title="Remove member"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            ))}
          </div>

          {/* Member Dictation Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <span>{activeMember.avatar}</span>
                <span>Dictating for {activeMember.name}:</span>
              </span>
              <span className="opacity-60 font-mono">
                {activeMember.transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              value={activeMember.transcript}
              onChange={e => handleUpdateTranscript(activeMember.id, e.target.value)}
              rows={6}
              placeholder="Dictate this team member's update using Wispr Flow (Hold Caps Lock)..."
              className={`w-full rounded-xl p-3 text-xs leading-relaxed border focus:outline-none ${
                isDark
                  ? 'bg-[#0a0f1d] border-[#1e293b] text-slate-200 focus:border-purple-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-600'
              }`}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] opacity-60 font-mono flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                Hold Caps Lock to speak with Wispr Flow
              </span>
              <button
                onClick={handleSynthesizeDigest}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Synthesize Team Digest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Consolidated Team Digest Output */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div
          className={`border rounded-2xl p-5 shadow-2xl flex-1 flex flex-col ${
            isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
            <h3 className="text-sm font-semibold font-mono">Consolidated Team Digest</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSendToSlack(digestContent)}
                disabled={!digestContent}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4A154B] hover:bg-[#611f64] text-white flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Slack</span>
              </button>
              <button
                onClick={handleCopy}
                disabled={!digestContent}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-50 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Digest'}
              </button>
            </div>
          </div>

          <div
            className={`flex-1 rounded-xl p-4 mt-3 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap select-text border min-h-[300px] ${
              isDark
                ? 'bg-[#090d18] border-[#192338] text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {digestContent ||
              'Click "Synthesize Team Digest" to merge all team member updates into a unified report.'}
          </div>
        </div>
      </div>
    </div>
  );
};
