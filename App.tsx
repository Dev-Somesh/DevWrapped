
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

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Entry);
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className={`min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center relative transition-colors duration-1000 ${step === Step.Share ? 'overflow-y-auto' : 'overflow-hidden'}`}>
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
      
      <main className="w-full max-w-5xl px-6 z-10 flex flex-col items-center justify-center min-h-screen relative">
        {renderStep()}
      </main>

      {/* Progress Footer */}
      {step >= Step.Stats && step < Step.Share && (
        <div className="fixed bottom-10 left-0 w-full px-12 flex items-center justify-center gap-6 z-50">
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
