
import React, { useState, useMemo, useEffect } from 'react';
import { Step, GitHubStats, AIInsights } from './types';
import { fetchGitHubData } from './services/githubService';
import { generateAIWrapped } from './services/geminiService';
import { logDiagnosticData } from './services/security';
import { trackEvent, identifyUser, trackTimeOnPage, trackScrollDepth, trackSessionStart, trackSessionEnd } from './services/mixpanelService';
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
  const [pageStartTime] = useState(Date.now());

  // Track page view on app load
  useEffect(() => {
    // Start session tracking
    const sessionId = trackSessionStart();
    
    trackEvent('Page View', {
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      session_id: sessionId
    });
  }, []);

  // Track scroll depth on Share page
  useEffect(() => {
    if (step !== Step.Share) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      trackScrollDepth(scrollPercent, 'share_page', {
        user_id: stats?.username,
        archetype: insights?.archetype
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step, stats?.username, insights?.archetype]);

  // Track time spent when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackTimeOnPage(pageStartTime, 'devwrapped_app', {
        final_step: Step[step],
        user_id: stats?.username,
        completed_analysis: step === Step.Share
      });
      
      trackSessionEnd({
        final_step: Step[step],
        user_id: stats?.username,
        completed_analysis: step === Step.Share,
        total_commits: stats?.totalCommits,
        archetype: insights?.archetype
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageStartTime, step, stats?.username, stats?.totalCommits, insights?.archetype]);

  const startAnalysis = async (user: string, selectedYear?: number) => {
    const analysisYear = selectedYear || new Date().getFullYear();
    setStep(Step.Analysis);
    setError(null);
    
    // Track Launch AI event
    trackEvent('Launch AI', {
      user_id: user,
      selected_year: analysisYear,
      page_url: window.location.href,
      page_title: document.title
    });

    // Identify user for Mixpanel
    identifyUser(user, {
      '$name': user,
      'platform': 'GitHub',
      'analysis_date': new Date().toISOString(),
      'selected_year': analysisYear
    });
    
    // Track analysis start
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'analysis_started', {
        username: user
      });
    }
    
    try {
      const fetchedStats = await fetchGitHubData(user, analysisYear);
      setStats(fetchedStats);
      
      const fetchedInsights = await generateAIWrapped(fetchedStats, activeModel);
      setInsights(fetchedInsights);

      // Track AI Response Sent
      trackEvent('AI Response Sent', {
        user_id: user,
        archetype: fetchedInsights.archetype,
        total_commits: fetchedStats.totalCommits,
        active_days: fetchedStats.activeDays,
        streak: fetchedStats.streak,
        top_language: fetchedStats.topLanguages[0]?.name || 'Unknown',
        model_used: activeModel
      });

      // Track Conversion Event (successful analysis completion)
      trackEvent('Conversion Event', {
        user_id: user,
        conversion_type: 'GitHub Analysis Completed',
        archetype: fetchedInsights.archetype
      });
      
      // Skip intermediate steps and go directly to Share page
      setTimeout(() => {
        setStep(Step.Share);
        
        // Track successful analysis completion and results page view
        if (typeof window !== 'undefined' && (window as any).clarity) {
          (window as any).clarity('event', 'results_page_reached', {
            username: user,
            archetype: fetchedInsights.archetype,
            total_commits: fetchedStats.totalCommits,
            active_days: fetchedStats.activeDays,
            streak: fetchedStats.streak,
            top_language: fetchedStats.topLanguages[0]?.name || 'Unknown'
          });
        }
      }, 3500);
    } catch (err: any) {
      // Track API Error
      trackEvent('API Error', {
        user_id: user,
        error_type: err.message?.includes('AUTH') ? 'Authentication' : 
                   err.message?.includes('RATE_LIMIT') ? 'Rate Limit' : 
                   err.message?.includes('CONFIG_ERROR') ? 'Configuration' : 'Unknown',
        error_message: err.message || 'Unknown error',
        page_url: window.location.href,
        model_used: activeModel
      });

      // Track general Error event
      trackEvent('Error', {
        error_type: 'API',
        error_message: err.message || 'Analysis failed',
        error_code: err.status || 'unknown',
        page_url: window.location.href,
        user_id: user
      });

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
    if (step === Step.Share) {
      setStep(Step.Entry);
      
      // Track restart action
      trackEvent('Analysis Restarted', {
        previous_username: stats?.username || 'unknown',
        page_url: window.location.href
      });
      
      // Track restart action
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'analysis_restarted', {
          previous_username: stats?.username || 'unknown'
        });
      }
    }
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

      <footer className="w-full py-8 md:py-12 px-4 md:px-6 border-t border-white/5 bg-[#0d1117]/80 backdrop-blur-xl relative z-50">
        {/* Secure Core Trace Divider - Blurred */}
        <div className="flex items-center justify-center gap-6 mb-8 opacity-10 blur-sm">
          <span className="h-px w-12 bg-white/30"></span>
          <p className="text-[9px] font-mono uppercase tracking-[1em] text-white/30 font-black">Secure_Core_Trace</p>
          <span className="h-px w-12 bg-white/30"></span>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto">
          {/* Top Section - Project Info & Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
            {/* Left - Project Branding */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center">
                  <svg height="18" width="18" viewBox="0 0 16 16" fill="white">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#39d353] font-black uppercase tracking-widest text-sm">DevWrapped</h3>
                  <p className="text-[#8b949e] text-xs font-mono">AI-Powered GitHub Year in Review</p>
                </div>
              </div>
              <p className="text-[#8b949e] text-xs max-w-sm leading-relaxed">
                Transform your GitHub journey into a cinematic year-in-review experience with AI-powered insights and beautiful visualizations.
              </p>
            </div>

            {/* Right - Primary Actions */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Dev-Somesh/Dev-Wrapped"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'github_repo_star',
                      destination: 'github.com',
                      action: 'star_project',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#58a6ff] rounded-lg transition-all group"
                >
                  <svg className="w-4 h-4 text-[#c9d1d9] group-hover:text-[#58a6ff]" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                  <span className="text-sm font-mono font-bold text-[#c9d1d9] group-hover:text-[#58a6ff]">
                    Star Project
                  </span>
                </a>
                
                <a
                  href="https://github.com/sponsors/Dev-Somesh"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'github_sponsor',
                      destination: 'github.com',
                      action: 'sponsor_click',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 hover:from-pink-500/30 hover:to-red-500/30 border border-pink-500/30 hover:border-pink-400 rounded-lg transition-all group"
                >
                  <svg className="w-4 h-4 text-pink-400 group-hover:text-pink-300" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
                  </svg>
                  <span className="text-sm font-mono font-bold text-pink-400 group-hover:text-pink-300">
                    Sponsor
                  </span>
                </a>
              </div>
              
              <p className="text-[10px] font-mono text-[#8b949e] text-center">
                Powered by Google Gemini AI & GitHub Telemetry
              </p>
            </div>
          </div>

          {/* Middle Section - Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 py-8 border-t border-b border-white/5">
            {/* Community */}
            <div>
              <h4 className="text-[#f0f6fc] font-mono font-bold text-sm mb-4 uppercase tracking-wider">Community</h4>
              <div className="space-y-3">
                <a
                  href="https://github.com/Dev-Somesh/Dev-Wrapped/issues"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'github_issues',
                      destination: 'github.com',
                      action: 'report_issues',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#58a6ff] transition-colors text-sm"
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
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'github_contributing',
                      destination: 'github.com',
                      action: 'view_contributing',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#39d353] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3Z"/>
                  </svg>
                  Contribute
                </a>
                <button
                  onClick={() => {
                    setShowCredits(true);
                    trackEvent('Modal Opened', {
                      modal_type: 'credits',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#bc8cff] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  Credits
                </button>
              </div>
            </div>

            {/* Share */}
            <div>
              <h4 className="text-[#f0f6fc] font-mono font-bold text-sm mb-4 uppercase tracking-wider">Share</h4>
              <div className="space-y-3">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://devwrapped.netlify.app')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'linkedin_share',
                      destination: 'linkedin.com',
                      action: 'share_app',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#0077b5] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out DevWrapped - AI-powered GitHub year in review!')}&url=${encodeURIComponent('https://devwrapped.netlify.app')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'twitter_share',
                      destination: 'twitter.com',
                      action: 'share_app',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter/X
                </a>
                <a
                  href="https://www.producthunt.com/products/devwrapped-2025"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'product_hunt',
                      destination: 'producthunt.com',
                      action: 'view_product',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#ff6154] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.8s-.806-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.803c2.319 0 4.199 1.88 4.199 4.2s-1.88 4.2-4.199 4.2z"/>
                  </svg>
                  Product Hunt
                </a>
              </div>
            </div>

            {/* Developer */}
            <div>
              <h4 className="text-[#f0f6fc] font-mono font-bold text-sm mb-4 uppercase tracking-wider">Developer</h4>
              <div className="space-y-3">
                <a
                  href="https://someshbhardwaj.me"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'portfolio',
                      destination: 'someshbhardwaj.me',
                      action: 'view_portfolio',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#58a6ff] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-6.5h-2.49A13.65 13.65 0 0 1 12.18 2H14.326c-.365.767-.594 1.61-.656 2.5zM11.855 2a9.267 9.267 0 0 1 .64 1.539 6.688 6.688 0 0 1 .597.933A7.025 7.025 0 0 0 13.745 2H11.855z"/>
                  </svg>
                  Portfolio
                </a>
                <a
                  href="https://github.com/dev-somesh"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'github_profile',
                      destination: 'github.com',
                      action: 'view_profile',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ersomeshbhardwaj/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackEvent('External Link Clicked', {
                      link_type: 'linkedin_profile',
                      destination: 'linkedin.com',
                      action: 'view_profile',
                      page_url: window.location.href
                    });
                  }}
                  className="flex items-center gap-2 text-[#8b949e] hover:text-[#0077b5] transition-colors text-sm"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright & Status */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-[#8b949e]">
              <span>© {new Date().getFullYear()} Somesh Bhardwaj</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1">
                Made with <span className="text-[#ff7b72]">❤️</span> for developers
              </span>
              <span className="opacity-40">•</span>
              <span className="text-[#39d353]">Open Source & Free</span>
            </div>
            
            <div className="flex items-center gap-2 text-[#484f58]">
              <span className="text-[#58a6ff] font-mono">
                Engine: {activeModel.includes('lite') ? 'Gemini Lite' : 'Gemini 3 Flash'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Credits Modal */}
      <CreditsModal isOpen={showCredits} onClose={() => setShowCredits(false)} />
    </div>
  );
};

export default App;
