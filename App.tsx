import React, { useState, useMemo, useEffect } from 'react';
import { Step, GitHubStats, AIInsights } from './types';
import { fetchGitHubData } from './services/githubService';
import { generateAIWrapped } from './services/geminiService';
import { logDiagnosticData } from './services/security';
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
          <svg height={icon.size} viewBox="0 0 16 16" width={icon.size} fill="white">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>
      ))}
    </div>
  );
};

const ApiKeyGuard: React.FC<{ onAuthorized: (model: string) => void }> = ({ onAuthorized }) => {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");

  const handleSelectKey = async () => {
    setLoading(true);
    // @ts-ignore
    if (window.aistudio) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        onAuthorized(selectedModel);
      } catch (err) {
        console.error("Key selection UI failed to open", err);
        setLoading(false);
      }
    } else {
      onAuthorized(selectedModel);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-3xl"></div>
      <div className="relative w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="space-y-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-[#39d353] animate-pulse"></div>
             <h3 className="text-[11px] font-mono uppercase tracking-[0.5em] text-[#8b949e] font-black">Auth_Initialization</h3>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black text-white tracking-tighter leading-tight">Authorize AI Session.</h2>
            <p className="text-[#8b949e] text-base font-light leading-relaxed">
              Dev-Wrapped requires a Gemini API Key. Both <strong>Free Tier</strong> and <strong>Paid</strong> keys are supported.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-mono text-[#484f58] uppercase tracking-[0.3em] font-black">Select Processing Core</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedModel("gemini-3-flash-preview")}
                className={`p-4 rounded-2xl border transition-all text-left ${selectedModel === "gemini-3-flash-preview" ? 'bg-[#39d353]/10 border-[#39d353] text-[#39d353]' : 'bg-[#0d1117] border-white/5 text-[#8b949e]'}`}
              >
                <p className="text-[11px] font-black uppercase mb-1">Flash 3</p>
                <p className="text-[9px] opacity-60">High Performance</p>
              </button>
              <button 
                onClick={() => setSelectedModel("gemini-flash-lite-latest")}
                className={`p-4 rounded-2xl border transition-all text-left ${selectedModel === "gemini-flash-lite-latest" ? 'bg-[#58a6ff]/10 border-[#58a6ff] text-[#58a6ff]' : 'bg-[#0d1117] border-white/5 text-[#8b949e]'}`}
              >
                <p className="text-[11px] font-black uppercase mb-1">Flash Lite</p>
                <p className="text-[9px] opacity-60">Free Tier Friendly</p>
              </button>
            </div>
          </div>

          <button 
            onClick={handleSelectKey}
            disabled={loading}
            className={`w-full bg-[#f0f6fc] text-[#0d1117] font-black py-6 rounded-2xl hover:bg-white transition-all shadow-xl text-lg tracking-tighter flex items-center justify-center gap-3 group ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? 'OPENING...' : 'SELECT API KEY'}
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5Z"></path></svg>
          </button>

          <div className="flex justify-between items-center text-[9px] font-mono text-[#484f58] uppercase tracking-widest px-2">
            <span>Session: Volatile</span>
            <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Pricing ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Entry);
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeModel, setActiveModel] = useState("gemini-3-flash-preview");

  useEffect(() => {
    const checkAuth = async () => {
      // @ts-ignore
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setIsAuthorized(true);
      } else if (process.env.API_KEY) {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, []);

  const handleAuthorization = (model: string) => {
    setActiveModel(model);
    setIsAuthorized(true);
  };

  const startAnalysis = async (user: string, token?: string) => {
    setUsername(user);
    setStep(Step.Analysis);
    setError(null);
    
    try {
      const fetchedStats = await fetchGitHubData(user, token);
      setStats(fetchedStats);
      
      const fetchedInsights = await generateAIWrapped(fetchedStats, activeModel);
      setInsights(fetchedInsights);
      
      setTimeout(() => setStep(Step.Stats), 3500);
    } catch (err: any) {
      // Detailed Diagnostic Logging
      logDiagnosticData(err, { username: user, step: Step[step], model: activeModel });
      
      if (err.message && (err.message.includes("AUTH") || err.message.includes("key") || err.message.includes("401"))) {
        setIsAuthorized(false);
        setError("AUTHENTICATION_FAILED: Intelligence session invalid. Please authorize a new key.");
      } else if (err.message && (err.message.includes("RATE_LIMIT") || err.message.includes("429"))) {
        setError("RESOURCE_EXHAUSTED: Service quota reached. Please try again in a moment.");
      } else {
        setError(err.message || 'SYSTEM_FAILURE: Failed to interpret developer telemetry.');
      }
      setStep(Step.Entry);
    }
  };

  const nextStep = () => {
    if (step < Step.Share) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (step > Step.Stats) setStep(prev => prev - 1);
    else if (step === Step.Stats) setStep(Step.Entry);
  };

  const renderStep = () => {
    switch (step) {
      case Step.Entry: return <Landing onConnect={startAnalysis} error={error} />;
      case Step.Analysis: return <Loading />;
      case Step.Stats: return stats && <StatsSlide stats={stats} onNext={nextStep} onBack={prevStep} />;
      case Step.Patterns: return insights && <PatternDetection insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.AIInsights: return insights && <AIInsightsSlide insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Narrative: return insights && <NarrativeSummary insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Archetype: return insights && <ArchetypeReveal insights={insights} onNext={nextStep} onBack={prevStep} />;
      case Step.Share: return stats && insights && (
        <div className="w-full flex flex-col items-center pt-12 pb-24 no-scrollbar">
          <ShareCard stats={stats} insights={insights} onReset={() => setStep(Step.Entry)} />
          <DevelopmentDossier stats={stats} insights={insights} />
        </div>
      );
      default: return <Landing onConnect={startAnalysis} error={error} />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col relative transition-colors duration-1000 ${step === Step.Share ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      <BackgroundIcons />
      
      {!isAuthorized && step === Step.Entry && (
        <ApiKeyGuard onAuthorized={handleAuthorization} />
      )}

      <main className="flex-1 w-full max-w-5xl px-6 mx-auto z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative">
        {renderStep()}
      </main>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono uppercase tracking-[0.3em] text-[#484f58] border-t border-white/5 bg-[#0d1117]/50 backdrop-blur-xl relative z-50">
        <div className="flex items-center gap-4">
          <span className="text-[#39d353] font-black tracking-widest">DEV-WRAPPED_2025</span>
          <span className="opacity-30">|</span>
          <span className="text-white/40">Engineered by Somesh Bhardwaj</span>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <span className="text-[#58a6ff] font-black uppercase tracking-widest opacity-60">Engine: {activeModel.includes('lite') ? 'Gemini Lite' : 'Gemini 3 Flash'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;