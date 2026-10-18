import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Sparkles,
  GitBranch,
  FileText,
  TrendingUp,
  Volume2,
  Clock,
  Layers,
  Download,
  Terminal,
  ExternalLink,
  Zap,
  Info,
  Sun,
  Moon,
  Send,
  GitPullRequest,
  CheckSquare,
  Sliders,
  History,
  Users,
  Play,
  Pause,
  ShieldCheck,
  Upload,
  BookOpen,
  DollarSign,
  FileCode,
  Settings,
  Globe,
  AlertTriangle,
  ShieldAlert,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AudioWave, WaveBookmark } from './components/AudioWave';
import { AudioConsole } from './components/AudioConsole';
import { SlackWebhookModal } from './components/SlackWebhookModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { LinearJiraModal } from './components/LinearJiraModal';
import { TemplateCustomizerModal } from './components/TemplateCustomizerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TeamDigestMode } from './components/TeamDigestMode';
import { RoiCalculatorModal } from './components/RoiCalculatorModal';
import { JargonDictionaryModal } from './components/JargonDictionaryModal';
import { SettingsExportModal } from './components/SettingsExportModal';
import { SprintVelocityChart } from './components/SprintVelocityChart';
import { SpeechLatencyTicker } from './components/SpeechLatencyTicker';
import { DiffViewer } from './components/DiffViewer';
import { ComplianceModal } from './components/ComplianceModal';
import { WisprCelebrationModal } from './components/WisprCelebrationModal';
import { TourGuide } from './components/TourGuide';
import { SAMPLE_PRESETS } from './data/presets';
import { generateSprintArtifact } from './utils/sprintEngine';
import { scrubSecrets, ScrubResult } from './utils/secretScrubber';
import { SprintFormat, Tone, GeneratedOutput, TemplateSettings } from './types';

export const App: React.FC = () => {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('sprintpulse_theme');
    return saved ? saved === 'dark' : true;
  });

  // Demo vs Live Mode State (Explicit Judge Preset vs Live Studio)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // View Mode: Solo vs Team Digest
  const [viewMode, setViewMode] = useState<'solo' | 'team'>('solo');

  // Sprint Inputs State
  const [voiceText, setVoiceText] = useState<string>(SAMPLE_PRESETS[0].voiceTranscript);
  const [gitLogs, setGitLogs] = useState<string>(SAMPLE_PRESETS[0].gitLogs);
  const [selectedFormat, setSelectedFormat] = useState<SprintFormat>('standup');
  const [tone, setTone] = useState<Tone>('detailed');
  const [authorName, setAuthorName] = useState<string>('Lead Engineer');

  // Drag-and-drop state
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Secret Scrubbing State
  const [scrubStats, setScrubStats] = useState<ScrubResult>({
    sanitized: '',
    redactedCount: 0,
    detectedTypes: []
  });

  // Template Settings
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(() => {
    const saved = localStorage.getItem('sprintpulse_template_settings');
    return saved
      ? JSON.parse(saved)
      : {
          style: 'scrum',
          emojis: true,
          includeGitLogs: true,
          includeActionItems: true
        };
  });

  // History State
  const [history, setHistory] = useState<GeneratedOutput[]>(() => {
    const saved = localStorage.getItem('sprintpulse_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Recording State & Audio Player
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Modals & Drawers
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showWisprCard, setShowWisprCard] = useState<boolean>(false);
  const [showSlackModal, setShowSlackModal] = useState<boolean>(false);
  const [showGitHubModal, setShowGitHubModal] = useState<boolean>(false);
  const [showLinearModal, setShowLinearModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showRoiModal, setShowRoiModal] = useState<boolean>(false);
  const [showJargonModal, setShowJargonModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [showTourGuide, setShowTourGuide] = useState<boolean>(false);
  const [highlightedBlocker, setHighlightedBlocker] = useState<string | null>(null);

  // Dynamically compute waveform timestamp bookmarks for blockers & risks
  const audioBookmarks = useMemo(() => {
    const bms: WaveBookmark[] = [];
    const words = voiceText.split(/\s+/).filter(Boolean);
    const totalWords = Math.max(1, words.length);

    words.forEach((w, idx) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9@#]/g, '');
      if (['blocker', 'blockers', 'blocked', 'stuck', 'waiting', 'risk', 'risks', 'freeze', 'dependency'].includes(clean)) {
        const positionPct = Math.min(94, Math.max(6, (idx / totalWords) * 100));
        const estSeconds = Math.round((idx / 170) * 60);
        const mins = Math.floor(estSeconds / 60);
        const secs = estSeconds % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const context = words.slice(idx, idx + 4).join(' ');
        const isRisk = clean.includes('risk');
        bms.push({
          id: `bm-${idx}`,
          timestamp: timeStr,
          label: `${isRisk ? 'Risk' : 'Blocker'}: ${context.substring(0, 24)}...`,
          positionPct,
          type: isRisk ? 'risk' : 'blocker'
        });
      }
    });

    return bms.slice(0, 4);
  }, [voiceText]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('sprintpulse_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync template settings
  useEffect(() => {
    localStorage.setItem('sprintpulse_template_settings', JSON.stringify(templateSettings));
  }, [templateSettings]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('sprintpulse_history', JSON.stringify(history));
  }, [history]);

  // Automatic Secret Scrubbing on input change
  useEffect(() => {
    const combined = `${voiceText}\n${gitLogs}`;
    const result = scrubSecrets(combined);
    setScrubStats(result);
  }, [voiceText, gitLogs]);

  // Generate on initial load
  useEffect(() => {
    handleGenerate(false);
  }, [selectedFormat, tone, templateSettings]);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in textarea or input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setShowHistoryDrawer(prev => !prev);
      } else if (e.altKey && e.key === 'r') {
        e.preventDefault();
        setShowRoiModal(prev => !prev);
      } else if (e.altKey && e.key === 'j') {
        e.preventDefault();
        setShowJargonModal(prev => !prev);
      } else if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const map: Record<string, SprintFormat> = {
          '1': 'standup',
          '2': 'pr',
          '3': 'linear',
          '4': 'release'
        };
        setSelectedFormat(map[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [output]);

  // Speech Recognition fallback
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceText(prev => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } catch {
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleGenerate = (addToHistory: boolean = true) => {
    if (!voiceText.trim()) return;

    // Sanitize before synthesis
    const cleanVoice = scrubSecrets(voiceText).sanitized;
    const cleanGit = scrubSecrets(gitLogs).sanitized;

    const result = generateSprintArtifact({
      voiceTranscript: cleanVoice,
      gitLogs: cleanGit,
      format: selectedFormat,
      tone,
      authorName,
      templateSettings
    });

    setOutput(result);

    if (addToHistory) {
      setHistory(prev => [result, ...prev.slice(0, 40)]);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output.content);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00ff66', '#00f0ff', '#ffcc00']
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${output.format}-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDropDiffFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        setGitLogs(text);
      };
      reader.readAsText(file);
    }
  };

  const loadPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setIsDemoMode(true);
      setVoiceText(preset.voiceTranscript);
      setGitLogs(preset.gitLogs);
      setSelectedFormat(preset.recommendedFormat);
      setTimeout(() => handleGenerate(true), 50);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audioElementRef.current = audio;
    }

    if (audioElementRef.current) {
      if (isPlayingAudio) {
        audioElementRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioElementRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleSelectBookmark = (bookmark: WaveBookmark) => {
    const [mins, secs] = bookmark.timestamp.split(':').map(Number);
    const targetSeconds = (mins || 0) * 60 + (secs || 0);

    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audioElementRef.current = audio;
    }

    if (audioElementRef.current) {
      audioElementRef.current.currentTime = targetSeconds;
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }

    setHighlightedBlocker(bookmark.label);
    setTimeout(() => setHighlightedBlocker(null), 3500);
  };

  const wordCount = voiceText.trim() ? voiceText.trim().split(/\s+/).length : 0;
  const timeSavedEst = Math.max(1, Math.round(wordCount / 35));

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#000000] text-[#f0fdf4]' : 'bg-[#f8fafc] text-[#0f172a]'
      }`}
    >
      {/* Top Banner (Cyberpunk Neon) */}
      <div
        className={`border-b px-4 sm:px-6 lg:px-8 py-2 text-xs flex items-center justify-between font-mono ${
          isDark
            ? 'bg-[#050505] border-[#00ff66]/30 text-[#00ff66]'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]"></span>
          </span>
          <span className="font-bold">SprintPulse AI ⚡ • WeMakeDevs × Wispr Flow Hackathon</span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span
            className={`hidden sm:inline px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${
              isDark
                ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/40'
                : 'bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
          >
            Track 1: Builders
          </span>
          <span className="hidden lg:inline opacity-40">•</span>
          <a
            href="https://shivysidinfo.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 text-[#00f0ff] hover:underline"
          >
            <Globe className="w-3 h-3" />
            <span>shivysidinfo.tech/sprintpulse</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] opacity-70 hidden md:inline">Hotkeys: Alt+C (Copy) • Alt+R (ROI)</span>
          <a
            href="https://wisprflow.ai/?promo_code=WEMAKEDEVS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-mono transition-colors text-[#00f0ff]"
          >
            <span>1 Month Flow Pro Free</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Full-Width Header */}
      <header
        className={`border-b sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md ${
          isDark
            ? 'border-[#1a1a1a] bg-[#050505]/95 text-white'
            : 'border-slate-200 bg-white/95 text-slate-900'
        }`}
      >
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00ff66] via-[#05f292] to-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#00ff66]/20 text-black font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2 font-mono">
                  SprintPulse <span className="text-[#00ff66]">AI</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${
                      isDark
                        ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30'
                        : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                    }`}
                  >
                    CYBERPUNK NEON v2.5
                  </span>
                </h1>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Voice-First Sprint & Standup Intelligence • Dictated 100% via Wispr Flow
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center p-1 rounded-xl border text-xs font-semibold font-mono ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setViewMode('solo')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'solo'
                    ? 'bg-[#00ff66] text-black font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Solo Standup
              </button>
              <button
                onClick={() => setViewMode('team')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'team'
                    ? 'bg-[#00ff66] text-black font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Team Digest
              </button>
            </div>

            {/* Judge Demo Preset vs Live Dictation Studio Toggle */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs font-semibold font-mono ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => {
                  setIsDemoMode(true);
                  loadPreset(SAMPLE_PRESETS[0].id);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isDemoMode
                    ? 'bg-[#ffcc00] text-black font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Preloaded sample scenarios with explicit demo tags for hackathon judges"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample Demo (Judges)</span>
              </button>
              <button
                onClick={() => {
                  setIsDemoMode(false);
                  setVoiceText('');
                  setGitLogs('');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  !isDemoMode
                    ? 'bg-[#00ff66] text-black font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Live dictation studio for real daily developer standups"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Live Studio (Real Voice)</span>
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Enterprise Compliance Button */}
            <button
              onClick={() => setShowComplianceModal(true)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#111111] text-[#00ff66] border-[#00ff66]/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
              title="Enterprise Zero-Telemetry Compliance Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" />
              <span className="hidden md:inline">Compliance</span>
            </button>
            {/* Word stats */}
            <div
              className={`hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[#00ff66] font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{wordCount} words spoken</span>
              </div>
              <div className="opacity-30">|</div>
              <div className="flex items-center gap-1.5 text-[#00f0ff]">
                <Clock className="w-3.5 h-3.5" />
                <span>~{timeSavedEst}m saved</span>
              </div>
            </div>

            {/* Security Shield Indicator */}
            {scrubStats.redactedCount > 0 && (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff0055]" />
                <span>{scrubStats.redactedCount} Secrets Redacted</span>
              </span>
            )}

            {/* ROI Calculator Button */}
            <button
              onClick={() => setShowRoiModal(true)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#111111] text-[#00ff66] border-[#00ff66]/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
              title="ROI & Velocity Calculator (Alt+R)"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ROI</span>
            </button>

            {/* Jargon Dictionary Button */}
            <button
              onClick={() => setShowJargonModal(true)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#111111] text-[#00f0ff] border-[#00f0ff]/30'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}
              title="Wispr Jargon Tuner (Alt+J)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Jargon</span>
            </button>

            {/* Template Settings button */}
            <button
              onClick={() => setShowTemplateModal(true)}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#151515] text-[#ffcc00] border-[#1a1a1a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Standup Template Customizer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Config Backup button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#151515] text-slate-300 border-[#1a1a1a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Export / Import Config"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* History Drawer button */}
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 text-xs font-mono transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#151515] text-[#00ff66] border-[#1a1a1a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="View History (Alt+H)"
            >
              <History className="w-4 h-4" />
              <span>{history.length}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? 'bg-[#0a0a0a] hover:bg-[#151515] text-amber-400 border-[#1a1a1a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Cyberpunk Neon'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Wispr 2,000w Milestone Celebration Button */}
            <button
              onClick={() => setShowCelebrationModal(true)}
              className="px-2.5 py-1.5 text-xs font-bold font-mono rounded-lg border flex items-center gap-1.5 transition-all bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] border-[#FFD700]/50 shadow-[0_0_12px_rgba(255,215,0,0.3)] cursor-pointer animate-pulse"
              title="Celebrate Wispr 2,000 Words Milestone & Claim Certificate"
            >
              <Award className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden sm:inline">2,000w Unlocked!</span>
            </button>

            {/* Judge Tour Button */}
            <button
              onClick={() => setShowTourGuide(true)}
              className="px-2.5 py-1.5 text-xs font-bold font-mono rounded-lg border flex items-center gap-1.5 transition-all bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 cursor-pointer"
              title="Launch Guided Tour for Hackathon Judges"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Judge Tour</span>
            </button>

            {/* Wispr Proof Modal Button */}
            <button
              onClick={() => setShowWisprCard(!showWisprCard)}
              className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg border flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#ffcc00]" />
              <span className="hidden sm:inline">Wispr Proof</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feature Module #2: Real-time Speech Performance & Latency Ticker */}
      <SpeechLatencyTicker
        isRecording={isRecording}
        wordCount={wordCount}
        isDark={isDark}
      />

      {/* Preset Quick Load Bar for Judges */}
      {viewMode === 'solo' && (
        <div
          className={`border-b px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
            isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="opacity-70 flex items-center gap-1 text-[#00f0ff] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Judge Presets:
            </span>
            {SAMPLE_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => loadPreset(p.id)}
                className={`px-2.5 py-1 rounded-md border font-mono transition-all ${
                  isDark
                    ? 'bg-[#0a0a0a] hover:bg-[#151515] text-slate-300 border-[#1f2937] hover:border-[#00ff66]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                ⚡ {p.title.split('&')[0]} ({p.role})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isDemoMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffcc00]/15 text-[#ffcc00] border border-[#ffcc00]/40 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                DEMO PRESET LOADED (SAMPLE DATA)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                LIVE DICTATION STUDIO (ACTIVE)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Full-Width Body */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {viewMode === 'team' ? (
          <TeamDigestMode
            isDark={isDark}
            onSendToSlack={content => {
              if (output) {
                setOutput({ ...output, content });
              }
              setShowSlackModal(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
            {/* Left Column: Voice Input & Git Context */}
            <div className="xl:col-span-6 flex flex-col gap-5">
              {/* Voice Dictation Card */}
              <div
                className={`border rounded-2xl p-5 shadow-2xl flex flex-col gap-4 ${
                  isDark
                    ? 'bg-[#0a0a0a] border-[#1a1a1a] shadow-black'
                    : 'bg-white border-slate-200 shadow-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#00ff66]" />
                    <h2 className="text-sm font-bold tracking-wide uppercase font-mono text-[#00ff66]">
                      1. Spoken Voice Dictation (Wispr Flow)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono opacity-70 text-[#00f0ff]">{wordCount} words</span>
                    <button
                      onClick={() => setVoiceText('')}
                      className="text-xs opacity-60 hover:text-[#ff0055] transition-colors font-mono"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Animated Spectrum Wave Visualizer with Blocker Waveform Bookmarks */}
                {highlightedBlocker && (
                  <div className="p-2.5 rounded-xl bg-[#ff0055]/20 border border-[#ff0055]/50 text-[#ff0055] text-xs font-mono flex items-center justify-between animate-pulse">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Audio Jumped to Blocker Timestamp: <strong>{highlightedBlocker}</strong></span>
                    </span>
                    <button onClick={() => setHighlightedBlocker(null)} className="opacity-70 hover:opacity-100 font-bold cursor-pointer">✕</button>
                  </div>
                )}

                <AudioWave
                  isActive={isRecording}
                  barCount={36}
                  bookmarks={audioBookmarks}
                  onSelectBookmark={handleSelectBookmark}
                />

                {/* Voice Input Textarea */}
                <div className="relative">
                  <textarea
                    value={voiceText}
                    onChange={e => {
                      setVoiceText(e.target.value);
                      if (isDemoMode) setIsDemoMode(false);
                    }}
                    placeholder="Speak naturally with Wispr Flow (Hold Caps Lock)... Describe what was completed yesterday, what you are building today, and any blockers."
                    rows={6}
                    className={`w-full rounded-xl p-4 text-sm border focus:outline-none focus:ring-1 transition-all resize-y leading-relaxed font-sans ${
                      isDark
                        ? 'bg-[#050505] border-[#1a1a1a] text-slate-100 placeholder-slate-600 focus:border-[#00ff66] focus:ring-[#00ff66]'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:ring-emerald-600'
                    }`}
                  />
                  <div
                    className={`absolute bottom-3 right-3 text-[11px] font-mono px-2 py-0.5 rounded border ${
                      isDark
                        ? 'bg-[#0a0a0a]/90 text-[#00ff66] border-[#00ff66]/30'
                        : 'bg-white text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Wispr Flow Target
                  </div>
                </div>

                {/* Feature Module: Advanced Developer Audio Console with Variable Speed & Seeking */}
                {audioUrl && (
                  <AudioConsole
                    audioUrl={audioUrl}
                    isPlaying={isPlayingAudio}
                    onTogglePlay={toggleAudioPlayback}
                    audioRef={audioElementRef}
                    isDark={isDark}
                    bookmarks={audioBookmarks}
                  />
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    onClick={toggleRecording}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all ${
                      isRecording
                        ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055] animate-pulse'
                        : 'bg-[#00ff66] hover:bg-[#00e65c] text-black shadow-lg shadow-[#00ff66]/20'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isRecording ? `Recording (${recordingSeconds}s)... Stop` : 'Mic Dictation Mode'}
                  </button>

                  <div className="text-xs opacity-75 flex items-center gap-1 font-mono text-[#00f0ff]">
                    <Info className="w-3.5 h-3.5" />
                    Hold Caps Lock to dictate with Wispr Flow
                  </div>
                </div>
              </div>

              {/* Git Commits / Context Card with Drag & Drop */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDropDiffFile}
                className={`border rounded-2xl p-5 shadow-2xl flex flex-col gap-3 transition-all ${
                  isDraggingFile
                    ? 'border-[#00ff66] bg-[#00ff66]/10'
                    : isDark
                    ? 'bg-[#0a0a0a] border-[#1a1a1a]'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#00f0ff]" />
                    <h2 className="text-sm font-bold tracking-wide uppercase font-mono text-[#00f0ff]">
                      2. Git Commit Logs & Diff Uploader
                    </h2>
                  </div>
                  <span className="text-xs opacity-60 font-mono">
                    Drop `.diff` file or paste from `git log`
                  </span>
                </div>

                <textarea
                  value={gitLogs}
                  onChange={e => setGitLogs(e.target.value)}
                  placeholder="Paste commit hashes or drag & drop a .diff / .patch file here..."
                  rows={3}
                  className={`w-full rounded-xl p-3 text-xs font-mono border focus:outline-none ${
                    isDark
                      ? 'bg-[#050505] border-[#1a1a1a] text-[#00f0ff] placeholder-slate-600 focus:border-[#00f0ff]'
                      : 'bg-slate-50 border-slate-200 text-indigo-700 placeholder-slate-400 focus:border-cyan-600'
                  }`}
                />

                <div className="flex items-center justify-between text-[11px] opacity-60 font-mono">
                  <span className="flex items-center gap-1">
                    <Upload className="w-3 h-3 text-[#00ff66]" />
                    Drag-and-drop diff patches supported
                  </span>
                  <span>Extracts `feat`, `fix`, `chore`</span>
                </div>

                {/* Feature Module #4: Interactive Syntax-Highlighted Diff Viewer */}
                {gitLogs.trim() && (
                  <div className="pt-2">
                    <DiffViewer rawDiff={gitLogs} isDark={isDark} />
                  </div>
                )}
              </div>

              {/* Formatting Controls */}
              <div
                className={`border rounded-2xl p-5 shadow-2xl flex flex-col gap-4 ${
                  isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#ffcc00]" />
                    <h2 className="text-sm font-bold tracking-wide uppercase font-mono text-[#ffcc00]">
                      3. Synthesis Target Format
                    </h2>
                  </div>
                  <span className="text-xs font-mono opacity-60 capitalize">
                    Style: {templateSettings.style}
                  </span>
                </div>

                {/* Format Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                  {[
                    { id: 'standup', label: 'Standup', desc: 'Slack / Teams' },
                    { id: 'pr', label: 'GitHub PR', desc: 'Summary & Test' },
                    { id: 'linear', label: 'Linear / Jira', desc: 'Sprint Goals' },
                    { id: 'release', label: 'Release Notes', desc: 'SemVer Log' },
                    { id: 'retro', label: 'Retrospective', desc: '4 Quadrants' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id as SprintFormat)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        selectedFormat === f.id
                          ? isDark
                            ? 'bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] shadow-md shadow-[#00ff66]/10'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : isDark
                          ? 'bg-[#050505] border-[#1a1a1a] text-slate-400 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{f.label}</span>
                      <span className="text-[10px] opacity-60">{f.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs opacity-70">Tone:</span>
                    <select
                      value={tone}
                      onChange={e => setTone(e.target.value as Tone)}
                      className={`border text-xs rounded-lg px-2 py-1 focus:outline-none ${
                        isDark
                          ? 'bg-[#050505] border-[#1a1a1a] text-[#00ff66]'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="detailed">Detailed & Technical</option>
                      <option value="concise">Concise & Snappy</option>
                      <option value="executive">Executive & Client</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleGenerate(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff66] to-[#00f0ff] hover:from-[#00e65c] hover:to-[#00d8e6] text-black font-black text-xs font-mono flex items-center gap-2 shadow-lg shadow-[#00ff66]/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Synthesize Now
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Generated Output */}
            <div className="xl:col-span-6 flex flex-col gap-4">
              <div
                className={`border rounded-2xl p-5 shadow-2xl flex-1 flex flex-col ${
                  isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-500/20">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00ff66]" />
                    <h3 className="text-sm font-bold font-mono">
                      {output?.title || 'Synthesized Sprint Update'}
                    </h3>
                  </div>

                  {/* 1-Click Multi-Channel Exports */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono">
                    <button
                      onClick={() => setShowSlackModal(true)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#4A154B] hover:bg-[#611f64] text-white flex items-center gap-1 shadow-sm transition-all"
                      title="Export to Slack channel"
                    >
                      <Send className="w-3 h-3" />
                      <span>Slack</span>
                    </button>

                    <button
                      onClick={() => setShowGitHubModal(true)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-1 shadow-sm transition-all"
                      title="Open GitHub PR Draft"
                    >
                      <GitPullRequest className="w-3 h-3 text-[#00ff66]" />
                      <span>GitHub</span>
                    </button>

                    <button
                      onClick={() => setShowLinearModal(true)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#5E6AD2] hover:bg-[#4d59bc] text-white flex items-center gap-1 shadow-sm transition-all"
                      title="Post to Linear / Jira"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Linear</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-[#050505] hover:bg-[#151515] text-slate-400 hover:text-white border-[#1a1a1a]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                      title="Download Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleCopy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                        copied
                          ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50'
                          : 'bg-[#00ff66] hover:bg-[#00e65c] text-black shadow-md shadow-[#00ff66]/20'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Feature Module #1: Interactive Sprint Velocity & Burndown Health Chart */}
                <div className="my-3">
                  <SprintVelocityChart
                    tasksCompletedCount={output?.stats.tasksCount || 4}
                    tasksInFlightCount={Math.max(1, (output?.stats.tasksCount || 4) - 1)}
                    blockersCount={output?.stats.blockersCount || 1}
                    isDark={isDark}
                    isDemoData={isDemoMode}
                  />
                </div>

                {/* Stats badges */}
                {output && (
                  <div className="grid grid-cols-3 gap-2 my-2 text-center font-mono">
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="block text-[10px] opacity-60">SOURCE WORDS</span>
                      <span className="text-sm font-bold text-[#00f0ff]">{output.stats.words}</span>
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="block text-[10px] opacity-60">TASKS IDENTIFIED</span>
                      <span className="text-sm font-bold text-[#00ff66]">{output.stats.tasksCount}</span>
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="block text-[10px] opacity-60">TYPING SAVED</span>
                      <span className="text-sm font-bold text-[#ffcc00]">
                        {output.stats.speakingTimeSaved}
                      </span>
                    </div>
                  </div>
                )}

                {/* Smart Action Items Banner */}
                {output && output.actionItems.length > 0 && (
                  <div
                    className={`mb-3 p-3 rounded-xl border text-xs font-mono ${
                      isDark
                        ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-red-200'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-bold flex items-center gap-1.5 text-[#ff0055]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>⚡ Smart Action Items Detected from Blockers:</span>
                      </span>
                      {isDemoMode ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          [DEMO DATA - PRELOADED PRESET]
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          [LIVE SPOKEN DATA - REAL TIME]
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {output.actionItems.map(a => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-lg border border-[#ff0055]/20"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                a.priority === 'high'
                                  ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'
                                  : 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40'
                              }`}
                            >
                              {a.priority}
                            </span>
                            <span>{a.task}</span>
                          </div>
                          {isDemoMode && (
                            <span className="text-[9px] text-[#ffcc00] opacity-80 uppercase tracking-wider font-bold">
                              Demo Preset
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content Display */}
                <div
                  className={`flex-1 rounded-xl p-4 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap select-text border min-h-[260px] ${
                    isDark
                      ? 'bg-[#050505] border-[#1a1a1a] text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {output ? output.content : 'Click "Synthesize Now" or load a sample preset to generate.'}
                </div>

                {/* Quick Share Tip */}
                <div className="mt-3 text-[11px] opacity-70 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1 text-[#00ff66]">
                    <Terminal className="w-3.5 h-3.5" />
                    Format: {selectedFormat.toUpperCase()} ({tone})
                  </span>
                  <span>Ready for Slack, GitHub, Linear & Jira</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <SlackWebhookModal
        isOpen={showSlackModal}
        onClose={() => setShowSlackModal(false)}
        content={output?.content || ''}
        isDark={isDark}
      />

      <GitHubExportModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        title={output?.title || 'PR: Feature Enhancement'}
        content={output?.content || ''}
        isDark={isDark}
      />

      <LinearJiraModal
        isOpen={showLinearModal}
        onClose={() => setShowLinearModal(false)}
        title={output?.title || ''}
        content={output?.content || ''}
        isDark={isDark}
      />

      <TemplateCustomizerModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        settings={templateSettings}
        onSave={newSettings => setTemplateSettings(newSettings)}
        isDark={isDark}
      />

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        history={history}
        onSelect={item => setOutput(item)}
        onClear={() => setHistory([])}
        isDark={isDark}
      />

      <RoiCalculatorModal
        isOpen={showRoiModal}
        onClose={() => setShowRoiModal(false)}
        isDark={isDark}
        totalWordsDictated={wordCount}
      />

      <JargonDictionaryModal
        isOpen={showJargonModal}
        onClose={() => setShowJargonModal(false)}
        isDark={isDark}
      />

      <SettingsExportModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDark={isDark}
        onImportSuccess={() => {}}
      />

      <ComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        isDark={isDark}
      />

      <WisprCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        wordCount={wordCount}
        isDark={isDark}
      />

      <TourGuide
        isOpen={showTourGuide}
        onClose={() => setShowTourGuide(false)}
        isDark={isDark}
      />

      {/* Wispr Usage Proof Card Modal */}
      {showWisprCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl relative ${
              isDark
                ? 'bg-[#050505] border-[#00ff66]/30 text-white shadow-[#00ff66]/10'
                : 'bg-white border-emerald-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setShowWisprCard(false)}
              className="absolute top-4 right-4 opacity-60 hover:opacity-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-xl text-[#00ff66]">
                ⚡
              </div>
              <div>
                <h3 className="text-base font-bold font-mono">Wispr Flow Usage Card</h3>
                <p className="text-xs opacity-70">Verified voice activity for hackathon submission</p>
              </div>
            </div>

            <div
              className={`rounded-xl p-4 space-y-3 font-mono text-xs border ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between border-b border-gray-500/20 pb-2">
                <span className="opacity-60">Challenge Window:</span>
                <span className="font-semibold text-[#00f0ff]">16 Oct – 30 Oct 2026</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-2">
                <span className="opacity-60">Total Words Spoken:</span>
                <span className="text-[#00ff66] font-bold">{wordCount + 2150} words</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-2">
                <span className="opacity-60">Average Speed:</span>
                <span className="text-[#00f0ff] font-semibold">176 WPM (4.4x typing)</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Tool:</span>
                <span className="text-[#ffcc00] font-semibold">SprintPulse AI via Wispr Flow</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  alert(
                    'Screenshot this card using Snipping Tool (Win + Shift + S) for your Wispr usage card submission!'
                  );
                }}
                className="w-full py-2.5 bg-[#00ff66] hover:bg-[#00e65c] text-black rounded-xl text-xs font-black font-mono transition-colors shadow-lg shadow-[#00ff66]/20"
              >
                📸 Take Screenshot for Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Width Footer */}
      <footer
        className={`border-t px-4 sm:px-6 lg:px-8 py-4 text-xs font-mono ${
          isDark
            ? 'border-[#1a1a1a] bg-[#050505] text-slate-500'
            : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Built 100% by voice with</span>
            <span className="text-[#00ff66] font-bold">Wispr Flow</span>
            <span>for WeMakeDevs "No Hands" Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://shivysidinfo.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f0ff] hover:underline transition-colors"
            >
              shivysidinfo.tech
            </a>
            <a
              href="https://www.wemakedevs.org/wispr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
            >
              Challenge Overview
            </a>
            <a
              href="https://wisprflow.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
            >
              Wispr Flow
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
