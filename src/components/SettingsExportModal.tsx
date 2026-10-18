import React, { useRef } from 'react';
import { X, Download, Upload, Check, RefreshCw } from 'lucide-react';

interface SettingsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onImportSuccess: () => void;
}

export const SettingsExportModal: React.FC<SettingsExportModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onImportSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const config = {
      theme: localStorage.getItem('sprintpulse_theme') || 'dark',
      slackWebhook: localStorage.getItem('sprintpulse_slack_webhook') || '',
      githubRepo: localStorage.getItem('sprintpulse_github_repo') || '',
      templateSettings: localStorage.getItem('sprintpulse_template_settings') || '',
      history: localStorage.getItem('sprintpulse_history') || '',
      exportedAt: new Date().toISOString(),
      version: '2.0-cyberpunk'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprintpulse-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.theme) localStorage.setItem('sprintpulse_theme', config.theme);
        if (config.slackWebhook) localStorage.setItem('sprintpulse_slack_webhook', config.slackWebhook);
        if (config.githubRepo) localStorage.setItem('sprintpulse_github_repo', config.githubRepo);
        if (config.templateSettings) localStorage.setItem('sprintpulse_template_settings', config.templateSettings);
        if (config.history) localStorage.setItem('sprintpulse_history', config.history);

        alert('Settings imported successfully! Reloading...');
        onImportSuccess();
        onClose();
        window.location.reload();
      } catch {
        alert('Invalid JSON config file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all SprintPulse AI settings to default?')) {
      localStorage.removeItem('sprintpulse_theme');
      localStorage.removeItem('sprintpulse_slack_webhook');
      localStorage.removeItem('sprintpulse_github_repo');
      localStorage.removeItem('sprintpulse_template_settings');
      localStorage.removeItem('sprintpulse_history');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#050505] border-[#ffcc00]/30 text-white shadow-[#ffcc00]/10'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <h3 className="text-sm font-bold tracking-tight">Configuration Backup & Restore</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs opacity-70">
            Export your webhooks, templates, target repos, and sprint history to easily migrate across browsers or backup your settings.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExport}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono text-xs transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] border-[#1f293d] hover:border-[#00ff66] text-[#00ff66]'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Export Config (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono text-xs transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] border-[#1f293d] hover:border-[#00f0ff] text-[#00f0ff]'
                  : 'bg-cyan-50 border-cyan-200 text-cyan-800'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Import Config</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <div className="pt-4 border-t border-gray-500/10 flex justify-between items-center text-xs">
            <button
              onClick={handleResetDefaults}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg opacity-70 hover:opacity-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
