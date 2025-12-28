
import React, { useState, useMemo } from 'react';
import { Step, GitHubStats, AIInsights } from './types';
import { fetchGitHubData } from './services/githubService';
import { generateAIWrapped } from './services/geminiService';
import Landing from './components/Landing';
import Loading from './components/Loading';
import StatsSlide from './components/StatsSlide';
import PatternDetection from './components/PatternDetection';
import AIInsightsSlide from './components/AIInsightsSlide';
import NarrativeSummary from './components/NarrativeSummary';
import ArchetypeReveal from './components/ArchetypeReveal';
import ShareCard from './components/ShareCard';
import DevelopmentDossier from './components/DevelopmentDossier';

const BackgroundIcons: React.FC = () => {
  const icons = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 10,
      opacity: Math.random() * 0.04 + 0.01,
      rotate: `${Math.random() * 360}deg`,
      delay: `${Math.random() * -10}s`,
      blur: i % 3 === 0 ? 'blur-sm' : '',
      duration: `${Math.random() * 4 + 6}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={`absolute floating-icon ${icon.blur}`}
          style={{
            top: icon.top,
            left: icon.left,
            opacity: icon.opacity,
            '--rotate': icon.rotate,
            animationDelay: icon.delay,
            animationDuration: icon.duration,
          } as React.CSSProperties}
        >
          <svg
            height={icon.size}
            viewBox="0 0 16 16"
            width={icon.size}
            fill="white"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>
      ))}
    </div>
  );
};

const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <button onClick={onClose} className="text-[#484f58] hover:text-white transition-colors">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#39d353]"></div>
             <h3 className="text-[11px] font-mono uppercase tracking-[0.5em] text-[#8b949e] font-black">Privacy_Standard_Log</h3>
          </div>
          <h2 className="text-3xl font-display font-black text-white tracking-tighter">Zero Data Retention.</h2>
          <div className="space-y-4 font-mono text-[11px] text-[#8b949e] leading-relaxed">
             <p className="p-4 bg-[#0d1117] rounded-xl border border-white/5">
               <span className="text-[#39d353] pr-2">✓</span>
               <span className="text-white">VOLATILE_AUTH:</span> Your Personal Access Token is used strictly for client-side API calls and is never stored on any server or local disk.
             </p>
             <p className="p-4 bg-[#0d1117] rounded-xl border border-white/5">
               <span className="text-[#39d353] pr-2">✓</span>
               <span className="text-white">ENCRYPTED_SESSION:</span> Analysis happens in-memory and is purged immediately once the browser session is terminated.
             </p>
             <p className="p-4 bg-[#0d1117] rounded-xl border border-white/5">
               <span className="text-[#39d353] pr-2">✓</span>
               <span className="text-white">NO_TRACKING:</span> We do not collect analytics on who uses the tool, nor do we store any GitHub profile data.
             </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<{ onOpenPrivacy: () => void }> = ({ onOpenPrivacy }) => (
  <footer className="w-full py-8 px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono uppercase tracking-[0.3em] text-[#484f58] border-t border-white/5 bg-[#0d1117]/50 backdrop-blur-xl relative z-50">
    <div className="flex items-center gap-4 mb-4 md:mb-0">
      <span className="text-[#39d353] font-black tracking-widest">DEVWRAPPED_2025</span>
      <span className="opacity-30">|</span>
      <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">Privacy_Policy</button>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center md:items-end">
        <span className="text-white/40 mb-1">Architected & Engineered By</span>
        <a 
          href="https://someshbhardwaj.me" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#39d353] hover:text-white transition-colors font-black"
        >
          Somesh Bhardwaj
        </a>
      </div>
      <span className="opacity-30 hidden md:block">|</span>
      <div className="hidden md:flex flex-col items-end">
        <span className="text-white/40 mb-1">Intelligence By</span>
        <span className="text-[#58a6ff] font-black">Google Gemini AI</span>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Entry);
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const startAnalysis = async (user: string, token?: string) => {
    setUsername(user);
    setStep(Step.Analysis);
    setError(null);
    
    try {
      const fetchedStats = await fetchGitHubData(user, token);
      setStats(fetchedStats);
      
      const fetchedInsights = await generateAIWrapped(fetchedStats);
      setInsights(fetchedInsights);
      
      // Delay for cinematic buildup
      setTimeout(() => setStep(Step.Stats), 3500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze GitHub profile.');
      setStep(Step.Entry);
    }
  };

  const nextStep = () => {
    if (step < Step.Share) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > Step.Stats) {
      setStep(prev => prev - 1);
    } else if (step === Step.Stats) {
      setStep(Step.Entry);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.Entry:
        return <Landing onConnect={startAnalysis} error={error} />;
      case Step.Analysis:
        return <Loading />;
      case Step.Stats:
        return stats && <StatsSlide stats={stats} onNext={nextStep} onBack={prevStep} />;
      case Step.Patterns:
        return insights && <PatternDetection insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.AIInsights:
        return insights && <AIInsightsSlide insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Narrative:
        return insights && <NarrativeSummary insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Archetype:
        return insights && <ArchetypeReveal insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Share:
        return stats && insights && (
          <div className="w-full flex flex-col items-center pt-12 pb-24 no-scrollbar">
            <ShareCard stats={stats} insights={insights} onReset={() => setStep(Step.Entry)} />
            <DevelopmentDossier stats={stats} insights={insights} />
          </div>
        );
      default:
        return <Landing onConnect={startAnalysis} error={error} />;
    }
  };

  const isSharePage = step === Step.Share;

  return (
    <div className={`min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col relative transition-colors duration-1000 ${isSharePage ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Background Layer */}
      <BackgroundIcons />

      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-[3000ms] z-1">
        <div className={`absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[160px] transition-colors duration-[2000ms] ${step >= Step.Stats ? 'bg-purple-900/30' : 'bg-blue-900/20'}`}></div>
        <div className={`absolute -bottom-1/4 -right-1/4 w-[800px] h-[800px] rounded-full blur-[160px] transition-colors duration-[2000ms] ${step >= Step.Narrative ? 'bg-blue-900/30' : 'bg-purple-900/20'}`}></div>
      </div>
      
      <main className="flex-1 w-full max-w-5xl px-6 mx-auto z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative">
        {renderStep()}
      </main>

      {/* Persistent Footer */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Privacy Modal Overlay */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Progress Footer */}
      {step >= Step.Stats && step < Step.Share && (
        <div className="fixed bottom-28 left-0 w-full px-12 flex items-center justify-center gap-6 z-50">
           <span className="text-[9px] font-mono tracking-[0.5em] text-white/30 uppercase font-black">
             Process_{String((step - Step.Stats) + 1).padStart(2, '0')}
           </span>
           <div className="flex-1 max-w-[200px] h-[1px] bg-white/10 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#39d353] transition-all duration-700 shadow-[0_0_10px_rgba(57,211,83,0.5)]"
                style={{ width: `${((step - Step.Stats) / (Step.Share - Step.Stats - 1)) * 100}%` }}
              ></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
