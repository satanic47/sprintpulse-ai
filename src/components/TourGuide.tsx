import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, ShieldCheck, Zap, Radio, Activity, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface TourStep {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  hint: string;
}

export const TourGuide: React.FC<TourGuideProps> = ({ isOpen, onClose, isDark }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: TourStep[] = [
    {
      title: '1. Wispr Flow Dictation Hub',
      badge: 'VOICE-FIRST SPEED',
      description:
        'Software engineers speak at 170+ WPM directly into the Wispr target by holding Caps Lock. Includes an animated sound spectrum visualizer and instant audio memo recordings.',
      icon: <Zap className="w-5 h-5 text-[#00ff66]" />,
      hint: 'Supports conventional commit correlation and smart action item generation.',
    },
    {
      title: '2. Client-Side Secret Scrubber',
      badge: 'SECURITY FIRST',
      description:
        'A background regex interception engine continuously scans your spoken words and git logs. It automatically redacts AWS Access Keys, Stripe API Keys, GitHub Personal Access Tokens, and JWTs before external dispatch.',
      icon: <Lock className="w-5 h-5 text-[#ff0055]" />,
      hint: 'Zero credentials ever leak to webhooks or third-party APIs.',
    },
    {
      title: '3. Real-Time Speech Telemetry Ticker',
      badge: 'EDGE PERFORMANCE',
      description:
        'Tracks real-time edge buffer latency in milliseconds (24ms), speech-to-text throughput in words per minute (172 WPM), and cumulative keystrokes saved in real time.',
      icon: <Radio className="w-5 h-5 text-[#00f0ff]" />,
      hint: 'Operates with 0.00% packet drop rate over WebM audio streams.',
    },
    {
      title: '4. Sprint Velocity & Burndown Health',
      badge: 'AGILE METRICS',
      description:
        'Visualizes completed tasks vs. work in flight vs. blockers in an active cyberpunk progress bar, dynamically computing Sprint Health Score and Delivery Confidence %.',
      icon: <Activity className="w-5 h-5 text-[#ffcc00]" />,
      hint: 'Identifies bottlenecks and flags dependencies automatically.',
    },
    {
      title: '5. Enterprise Compliance & Edge Gateway',
      badge: 'PRIVACY GUARANTEE',
      description:
        'Powered by a dedicated Node.js/Express edge proxy featuring cryptographic HMAC-SHA256 signature verification, token-bucket rate limiting, and an absolute RAM-only zero disk retention policy.',
      icon: <ShieldCheck className="w-5 h-5 text-[#00ff66]" />,
      hint: 'Download cryptographic compliance audit certificates with one click.',
    },
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#00f0ff', '#FFD700'],
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className={`border-2 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative font-mono text-xs ${
          isDark
            ? 'bg-[#050505] border-[#00f0ff] text-white shadow-[0_0_40px_rgba(0,240,255,0.2)]'
            : 'bg-white border-cyan-400 text-slate-900 shadow-xl'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 opacity-60 hover:opacity-100 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00f0ff]">
              Hackathon Judge Guided Tour
            </span>
          </div>
          <span className="text-[10px] opacity-60">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Tour Card Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
              {step.icon}
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 uppercase tracking-widest inline-block mb-1">
                {step.badge}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">{step.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">{step.description}</p>

          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-[11px] ${
              isDark ? 'bg-[#0a0a0a] border-gray-800 text-[#00ff66]' : 'bg-slate-50 border-slate-200 text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{step.hint}</span>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="text-[11px] opacity-60 hover:opacity-100 cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-gray-700 hover:border-gray-500 font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-[#00f0ff] hover:bg-[#00d6e6] text-black font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-[#00f0ff]/20 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next'}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
