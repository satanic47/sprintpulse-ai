import React, { useState } from 'react';
import { X, GitPullRequest, ExternalLink, Copy, Check, Terminal } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isDark: boolean;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  isDark
}) => {
  const [repo, setRepo] = useState<string>(() => {
    return localStorage.getItem('sprintpulse_github_repo') || 'my-org/sprintpulse-project';
  });
  const [baseBranch, setBaseBranch] = useState<string>('main');
  const [compareBranch, setCompareBranch] = useState<string>('feature/voice-sprint');
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenPr = () => {
    if (repo) localStorage.setItem('sprintpulse_github_repo', repo);

    const encodedTitle = encodeURIComponent(title);
    const encodedBody = encodeURIComponent(content);
    const url = `https://github.com/${repo}/compare/${baseBranch}...${compareBranch}?quick_pull=1&title=${encodedTitle}&body=${encodedBody}`;
    window.open(url, '_blank');
  };

  const handleOpenIssue = () => {
    if (repo) localStorage.setItem('sprintpulse_github_repo', repo);

    const encodedTitle = encodeURIComponent(title);
    const encodedBody = encodeURIComponent(content);
    const url = `https://github.com/${repo}/issues/new?title=${encodedTitle}&body=${encodedBody}`;
    window.open(url, '_blank');
  };

  const ghCliCommand = `gh pr create --repo ${repo} --base ${baseBranch} --head ${compareBranch} --title "${title.replace(/"/g, '\\"')}" --body "${content.replace(/"/g, '\\"').slice(0, 300)}..."`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(ghCliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
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
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white">
              <GitPullRequest className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">GitHub Direct Exporter</h3>
              <p className="text-[11px] opacity-70">Create a Pull Request or Issue with synthesized voice markdown</p>
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
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              GitHub Repository (owner/repo)
            </label>
            <input
              type="text"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              placeholder="e.g. acme-corp/backend-api"
              className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none ${
                isDark
                  ? 'bg-[#090d18] border-[#1e293b] text-emerald-300 focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-600'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Base Branch</label>
              <input
                type="text"
                value={baseBranch}
                onChange={e => setBaseBranch(e.target.value)}
                placeholder="main"
                className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none ${
                  isDark
                    ? 'bg-[#090d18] border-[#1e293b] text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Compare Branch</label>
              <input
                type="text"
                value={compareBranch}
                onChange={e => setCompareBranch(e.target.value)}
                placeholder="feature/branch"
                className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none ${
                  isDark
                    ? 'bg-[#090d18] border-[#1e293b] text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* GitHub CLI Quick Command */}
          <div
            className={`p-3 rounded-xl border text-xs font-mono relative ${
              isDark ? 'bg-[#090d18] border-[#1e293b]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 text-[11px] opacity-70">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                GitHub CLI (gh pr create)
              </span>
              <button
                onClick={handleCopyCli}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedCli ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCli ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="line-clamp-2 opacity-80 text-[10px] select-all">{ghCliCommand}</p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleOpenIssue}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isDark
                  ? 'border-[#1e293b] hover:bg-[#1a2642] text-slate-300'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Open as GitHub Issue
            </button>
            <button
              onClick={handleOpenPr}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Pre-filled GitHub PR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
