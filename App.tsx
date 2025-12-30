
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

  const startAnalysis = async (user: string) => {
    setStep(Step.Analysis);
    setError(null);
    
    try {
      const fetchedStats = await fetchGitHubData(user); // Remove token parameter
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

      <footer className="w-full py-6 md:py-8 px-4 md:px-6 border-t border-white/5 bg-[#0d1117]/50 backdrop-blur-xl relative z-50">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 mb-6">
          {/* Left Section - Project Info */}
          <div className="flex flex-col gap-3 items-center lg:items-start text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-3">
              <span className="text-[#39d353] font-black uppercase tracking-widest text-[10px] md:text-[11px]">DEVWRAPPED_2025</span>
              <span className="opacity-30 hidden md:inline">|</span>
              <span className="text-white/40 text-[9px] md:text-[10px]">Engineered by Somesh Bhardwaj</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-3 text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.25em] uppercase">
              <span className="text-[#8b949e] text-center lg:text-left">Builder · Indie Engineer · Storyteller</span>
            </div>
          </div>

          {/* Center Section - Engagement & Community */}
          <div className="flex flex-col items-center gap-4">
            {/* GitHub Repository */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Dev-Somesh/Dev-Wrapped"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#58a6ff] rounded-lg transition-all group"
              >
                <svg className="w-4 h-4 text-[#c9d1d9] group-hover:text-[#58a6ff]" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <span className="text-[10px] md:text-[11px] font-mono font-black uppercase tracking-widest text-[#c9d1d9] group-hover:text-[#58a6ff]">
                  View Source
                </span>
              </a>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-[#8b949e] uppercase tracking-widest mr-2">Share:</span>
              
              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://devwrapped.netlify.app')}&summary=${encodeURIComponent('Check out DevWrapped 2025 - Transform your GitHub journey into a cinematic year-in-review! 🎬 AI-powered insights, beautiful visualizations, and personalized developer archetypes. Discover your coding story at https://devwrapped.netlify.app #DevWrapped2025 #GitHub #YearInReview #Developer')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 hover:border-[#0077b5] rounded text-[#0077b5] hover:text-[#00a0dc] transition-all"
                title="Share on LinkedIn"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-[8px] font-mono font-bold">LI</span>
              </a>

              {/* Twitter/X Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out DevWrapped 2025 - Transform your GitHub journey into a cinematic year-in-review! 🎬')}&url=${encodeURIComponent('https://devwrapped.netlify.app')}&hashtags=DevWrapped2025,GitHub,YearInReview,Developer`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded text-[#c9d1d9] hover:text-white transition-all"
                title="Share on X (Twitter)"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[8px] font-mono font-bold">X</span>
              </a>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col items-center lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCredits(true)}
                className="text-[#8b949e] hover:text-[#58a6ff] transition-colors text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.25em] uppercase font-mono hover:underline"
              >
                Credits
              </button>
              <span className="text-[#58a6ff] font-black uppercase tracking-widest opacity-60 text-[8px] md:text-[9px]">
                Engine: {activeModel.includes('lite') ? 'Gemini Lite' : 'Gemini 3 Flash'}
              </span>
            </div>
            
            {/* Personal Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://someshbhardwaj.me"
                target="_blank"
                rel="noreferrer"
                className="text-[#58a6ff] hover:text-[#79c0ff] transition-colors text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono"
              >
                Portfolio
              </a>
              <span className="opacity-20">·</span>
              <a
                href="https://github.com/dev-somesh"
                target="_blank"
                rel="noreferrer"
                className="text-[#c9d1d9] hover:text-white transition-colors text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono"
              >
                GitHub
              </a>
              <span className="opacity-20">·</span>
              <a
                href="https://www.linkedin.com/in/ersomeshbhardwaj/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0077b5] hover:text-[#00a0dc] transition-colors text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Community & Engagement */}
        <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[8px] md:text-[9px] font-mono">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[#8b949e]">
            <a
              href="https://github.com/Dev-Somesh/Dev-Wrapped/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"/>
              </svg>
              Report Issues
            </a>
            <a
              href="https://github.com/Dev-Somesh/Dev-Wrapped/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#39d353] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3Z"/>
              </svg>
              Contribute
            </a>
            <a
              href="https://github.com/Dev-Somesh/Dev-Wrapped"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#d29922] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
              Star Project
            </a>
          </div>
          
          <div className="flex items-center gap-2 text-[#484f58]">
            <span>Made with</span>
            <span className="text-[#ff7b72]">❤️</span>
            <span>for the developer community</span>
          </div>
        </div>
      </footer>

      {/* Credits Modal */}
      <CreditsModal isOpen={showCredits} onClose={() => setShowCredits(false)} />
    </div>
  );
};

export default App;
