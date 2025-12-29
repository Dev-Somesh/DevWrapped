
import React, { useState, useMemo } from 'react';
import { Step, GitHubStats, AIInsights } from './types';
import { fetchGitHubData } from './services/githubService';
import { generateAIWrapped } from './services/geminiService';
import { logDiagnosticData } from './services/security';
import Landing from './components/Landing';
import Loading from './components/Loading';
// Intermediate step components removed for streamlined flow
// import StatsSlide from './components/StatsSlide';
// import PatternDetection from './components/PatternDetection';
// import AIInsightsSlide from './components/AIInsightsSlide';
// import NarrativeSummary from './components/NarrativeSummary';
// import ArchetypeReveal from './components/ArchetypeReveal';
import ShareCard from './components/ShareCard';
import DevelopmentDossier from './components/DevelopmentDossier';
import CreditsModal from './components/CreditsModal';

const BackgroundIcons: React.FC = () => {
  const icons = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 10,
      opacity: Math.random() * 0.12 + 0.08,
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
            opacity: icon.opacity * 0.3, // Reduced opacity to 30% of original
            '--rotate': icon.rotate,
            animationDelay: icon.delay,
            animationDuration: icon.duration,
          } as React.CSSProperties}
        >
          <svg height={icon.size} viewBox="0 0 16 16" width={icon.size} fill="#c9d1d9">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.30.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>
      ))}
    </div>
  );
};


const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Entry);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModel] = useState("gemini-3-flash-preview");
  const [showCredits, setShowCredits] = useState(false);

  const startAnalysis = async (user: string, token?: string) => {
    setStep(Step.Analysis);
    setError(null);
    
    try {
      const fetchedStats = await fetchGitHubData(user, token);
      setStats(fetchedStats);
      
      const fetchedInsights = await generateAIWrapped(fetchedStats, activeModel);
      setInsights(fetchedInsights);
      
      // Skip intermediate steps and go directly to Share page
      setTimeout(() => setStep(Step.Share), 3500);
    } catch (err: any) {
      // Detailed Diagnostic Logging
      logDiagnosticData(err, { username: user, step: Step[step], model: activeModel });
      
      if (err.message && (err.message.includes("AUTH") || err.message.includes("key") || err.message.includes("401"))) {
        setError("AUTHENTICATION_FAILED: API key configuration error. Please check Netlify environment variables.");
      } else if (err.message && (err.message.includes("RATE_LIMIT") || err.message.includes("429"))) {
        setError("RESOURCE_EXHAUSTED: Service quota reached. Please try again in a moment.");
      } else if (err.message && err.message.includes("CONFIG_ERROR")) {
        setError("CONFIGURATION_ERROR: GEMINI_API_KEY is not configured. Please set it in Netlify environment variables.");
      } else {
        setError(err.message || 'SYSTEM_FAILURE: Failed to interpret developer telemetry.');
      }
      setStep(Step.Entry);
    }
  };

  const nextStep = () => {
    // No longer needed since we go directly to Share
    if (step < Step.Share) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    // From Share page, go back to Entry to restart
    if (step === Step.Share) setStep(Step.Entry);
  };

  const renderStep = () => {
    switch (step) {
      case Step.Entry: return <Landing onConnect={startAnalysis} error={error} />;
      case Step.Analysis: return <Loading />;
      // Intermediate steps skipped for streamlined user experience
      // case Step.Stats: return stats && <StatsSlide stats={stats} onNext={nextStep} onBack={prevStep} />;
      // case Step.Patterns: return insights && <PatternDetection insights={insights} onNext={nextStep} onBack={prevStep} />;
      // case Step.AIInsights: return insights && <AIInsightsSlide insights={insights} onNext={nextStep} onBack={prevStep} />;
      // case Step.Narrative: return insights && <NarrativeSummary insights={insights} onNext={nextStep} onBack={prevStep} />;
      // case Step.Archetype: return insights && <ArchetypeReveal insights={insights} onNext={nextStep} onBack={prevStep} />;
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

      <main className="flex-1 w-full max-w-5xl px-6 mx-auto z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative">
        {renderStep()}
      </main>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono tracking-[0.3em] text-[#484f58] border-t border-white/5 bg-[#0d1117]/50 backdrop-blur-xl relative z-50">
        <div className="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-[#39d353] font-black uppercase tracking-widest">DEVWRAPPED_2025</span>
            <span className="opacity-30 hidden md:inline">|</span>
            <span className="text-white/40">Engineered by Somesh Bhardwaj</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[9px] tracking-[0.25em] uppercase">
            <span className="text-[#8b949e]">Builder · Indie Engineer · Storyteller</span>
            <span className="opacity-20 hidden md:inline">/</span>
            <div className="flex items-center gap-3">
              <a
                href="https://someshbhardwaj.me"
                target="_blank"
                rel="noreferrer"
                className="text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
              >
                Portfolio
              </a>
              <span className="opacity-20">·</span>
              <a
                href="https://github.com/dev-somesh"
                target="_blank"
                rel="noreferrer"
                className="text-[#c9d1d9] hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span className="opacity-20">·</span>
              <a
                href="https://www.linkedin.com/in/ersomeshbhardwaj/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0077b5] hover:text-[#00a0dc] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-6 md:mt-0">
          <button
            onClick={() => setShowCredits(true)}
            className="text-[#8b949e] hover:text-[#58a6ff] transition-colors text-[9px] tracking-[0.25em] uppercase font-mono hover:underline"
          >
            Credits
          </button>
          <span className="text-[#58a6ff] font-black uppercase tracking-widest opacity-60 text-[9px]">
            Engine: {activeModel.includes('lite') ? 'Gemini Lite' : 'Gemini 3 Flash'}
          </span>
        </div>
      </footer>

      {/* Credits Modal */}
      <CreditsModal isOpen={showCredits} onClose={() => setShowCredits(false)} />
    </div>
  );
};

export default App;
