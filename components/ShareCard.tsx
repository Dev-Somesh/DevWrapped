
import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { GitHubStats, AIInsights } from '../types';
import { generateSecureTraceId } from '../services/security';

interface ShareCardProps {
  stats: GitHubStats;
  insights: AIInsights;
  onReset: () => void;
}

interface SelectedStat {
  label: string;
  value: string | number;
  score: number;
  id: string;
  icon: React.ReactNode;
}

// Reusable Octicon components
const Octicon = ({ children, className = "w-3 h-3" }: { children: React.ReactNode; className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">{children}</svg>
);

const Icons = {
  Repo: <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />,
  Calendar: <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5.5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.75 16H2.25A1.75 1.75 0 0 1 .5 14.25V3.75C.5 2.784 1.284 2 2.25 2H3.5V.75A.75.75 0 0 1 4.25 0Zm-2.5 3.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h11.5a.25.25 0 0 0 .25-.25V3.75a.25.25 0 0 0-.25-.25Z" />,
  Flame: <path d="M8 0c-.875 0-1.75.313-2.375.938A3.488 3.488 0 0 0 4.5 3.5c0 .611.161 1.18.441 1.673A6.023 6.023 0 0 0 2 10.5c0 3.038 2.462 5.5 5.5 5.5s5.5-2.462 5.5-5.5c0-1.218-.396-2.343-1.062-3.25a4.484 4.484 0 0 1 .562-2.25A4.478 4.478 0 0 0 11.5 5c0-2.761-1.567-5-3.5-5ZM7.5 14.5c-2.21 0-4-1.79-4-4 0-1.105.447-2.105 1.171-2.829l1.414 1.414L5.5 10.5h4l-.586-1.415 1.415-1.414A3.985 3.985 0 0 1 11.5 10.5c0 2.21-1.79 4-4 4Z" />,
  Code: <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z" />,
  GitCommit: <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5 0h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm-10 0h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z" />,
  GitHub: <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />,
  Dot: <circle cx="8" cy="8" r="4.5" />
};

const ShareCard: React.FC<ShareCardProps> = ({ stats, insights, onReset }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeHook, setActiveHook] = useState(0);
  const [traceId, setTraceId] = useState('FETCHING...');

  // Track page view when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'share_card_viewed', {
        username: stats.username,
        archetype: insights.archetype,
        total_commits: stats.totalCommits,
        active_days: stats.activeDays
      });
    }
  }, [stats.username, insights.archetype, stats.totalCommits, stats.activeDays]);

  // Temporary fallback: extract number from AI insight if API data is missing
  const extractRepoCountFromInsight = () => {
    if (stats.reposCreatedThisYear !== undefined && stats.reposCreatedThisYear !== null) {
      return stats.reposCreatedThisYear;
    }
    
    // Try to extract from cardInsight text
    const insight = insights.cardInsight || '';
    const numberMatch = insight.match(/(\w+)-(\w+)/); // "twenty-eight"
    if (numberMatch) {
      const wordNumbers: Record<string, number> = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        'thirty': 30, 'forty': 40, 'fifty': 50
      };
      
      const parts = numberMatch[0].split('-');
      if (parts.length === 2) {
        const tens = wordNumbers[parts[0]] || 0;
        const ones = wordNumbers[parts[1]] || 0;
        return tens + ones;
      }
    }
    
    // Try simple number extraction
    const simpleNumber = insight.match(/\b(\d+)\b/);
    if (simpleNumber) {
      return parseInt(simpleNumber[1]);
    }
    
    return 0;
  };

  useEffect(() => {
    generateSecureTraceId(stats.username).then(setTraceId);
  }, [stats.username]);

  const hooks = [
    { type: 'Pattern Reveal', text: 'Turns out my coding style has a pattern.\n\nThis year taught me more about how I work than how much I shipped.\n\nHere’s my developer year in review 👇' },
    { type: 'Reflection', text: 'This year wasn’t about doing more — it was about understanding how I work.\n\nSeeing my year in code as a story — not a dashboard — changed my perspective.\n\nSharing mine 👇' },
    { type: 'Curiosity', text: 'Ever wondered what your GitHub activity says about you?\n\nI finally saw mine — and it was surprisingly accurate.\n\nMy developer year wrapped 👇' }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cardRef.current) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const containerPadding = 32; // Account for padding
      const availableWidth = Math.min(viewportWidth - containerPadding, 600);
      const availableHeight = viewportHeight * 0.8; // Use 80% of viewport height
      
      // Fixed responsive card dimensions - increased size
      const cardWidth = 480;
      const cardHeight = 600;
      
      // Calculate scale based on both width and height constraints
      const widthScale = availableWidth / cardWidth;
      const heightScale = availableHeight / cardHeight;
      const newScale = Math.min(widthScale, heightScale, 1); // Don't scale up beyond 1
      
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    
    // Track export attempt with Microsoft Clarity
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'share_card_export_started', {
        username: stats.username,
        archetype: insights.archetype
      });
    }
    
    try {
      const originalTransform = cardRef.current.style.transform;
      cardRef.current.style.transform = 'none';
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: '#0d1117',
        quality: 1,
      });
      
      cardRef.current.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `devwrapped-2025-${stats.username}.png`;
      link.href = dataUrl;
      link.click();
      
      // Track successful export
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'share_card_export_success', {
          username: stats.username,
          archetype: insights.archetype
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      
      // Track export failure
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'share_card_export_failed', {
          username: stats.username,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const candidateStats: SelectedStat[] = [
    { 
      id: 'activeDays', 
      label: 'Active Days', 
      value: stats.activeDays, 
      score: 3,
      icon: <Octicon>{Icons.Calendar}</Octicon>
    },
    { 
      id: 'streak', 
      label: 'Max Streak', 
      value: `${stats.streak}d`, 
      score: 3,
      icon: <Octicon className="w-3 h-3 text-[#d29922]">{Icons.Flame}</Octicon>
    },
    { 
      id: 'focus', 
      label: 'Top Focus', 
      value: stats.topLanguages[0]?.name || 'Code', 
      score: 3,
      icon: <Octicon className="w-3 h-3 text-[#39d353]">{Icons.Dot}</Octicon>
    },
    { 
      id: 'commits', 
      label: 'Contributions', 
      value: stats.totalCommits, 
      score: 2,
      icon: <Octicon className="w-3 h-3 text-[#58a6ff]">{Icons.GitCommit}</Octicon>
    },
    { 
      id: 'reposCreated', 
      label: 'New Repos', 
      value: stats.reposCreatedThisYear || 0, 
      score: 2,
      icon: <Octicon className="w-3 h-3 text-[#f85149]">{Icons.Repo}</Octicon>
    },
  ];

  const gridCells = Array.from({ length: 12 }).map(() => {
    const val = Math.random();
    if (val > 0.7) return '#39d353'; // More green squares (30% chance)
    if (val > 0.4) return '#26a641'; // Medium green (30% chance)
    if (val > 0.2) return '#0d4429'; // Dark green (20% chance)
    return '#161b22'; // Dark background (20% chance)
  });

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
      <div className="w-full max-w-8xl px-2 md:px-4 flex justify-between items-end mb-4 md:mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] md:text-[10px] font-mono font-black text-[#39d353] tracking-[0.3em] md:tracking-[0.4em] uppercase">Status: Artifact_Finalized</span>
          <h2 className="text-[9px] md:text-[10px] font-mono font-bold text-white/20 tracking-[0.4em] md:tracking-[0.5em] uppercase">SECURE_TRACE_ID: {traceId}</h2>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-8 md:gap-12 items-start justify-center w-full max-w-8xl px-2 md:px-4">
        
        {/* CARD VIEWER */}
        <div 
          ref={containerRef}
          className="flex flex-col items-center gap-4 md:gap-6 w-full xl:w-auto flex-shrink-0"
        >
          <div 
            className="relative flex items-center justify-center transition-all duration-700 ease-in-out w-full max-w-lg md:max-w-none"
            style={{ 
              height: `${600 * scale}px`,
              width: `${480 * scale}px`,
              maxWidth: '100vw',
              transformOrigin: 'top center'
            }}
          >
            <div 
              ref={cardRef}
              className={`absolute inset-0 bg-[#0d1117] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 lg:p-10 overflow-hidden border border-[#30363d] shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col`}
              style={{ 
                width: '480px',
                height: '600px'
              }}
            >
              {/* Background GitHub Logos */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* First GitHub logo - top right */}
                <div 
                  className="absolute opacity-[0.04] select-none"
                  style={{
                    top: '10%',
                    right: '5%',
                    transform: 'rotate(15deg)',
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 16 16" fill="#c9d1d9">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                </div>
                
                {/* Second GitHub logo - bottom left */}
                <div 
                  className="absolute opacity-[0.03] select-none"
                  style={{
                    bottom: '15%',
                    left: '8%',
                    transform: 'rotate(-12deg)',
                  }}
                >
                  <svg width="100" height="100" viewBox="0 0 16 16" fill="#c9d1d9">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                </div>
              </div>

              <div className="absolute top-0 right-0 p-8 opacity-5 font-mono text-[8px] tracking-[0.4em] uppercase rotate-90 origin-top-right whitespace-nowrap select-none z-5">
                ARTIFACT_VERIFIED_{traceId}
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-20 flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-[#8b949e] tracking-[0.3em] uppercase mb-1">DEV_WRAPPED</span>
                  <span className="text-lg font-display font-black text-white tracking-tighter">2025</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  <img src={stats.avatarUrl} alt={stats.username} className="w-5 h-5 rounded-full grayscale" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/90 leading-none">@{stats.username}</span>
                    <div className="flex items-center gap-1 opacity-40">
                      <Octicon className="w-1.5 h-1.5">{Icons.Repo}</Octicon>
                      <span className="text-[6px] font-mono uppercase tracking-widest">{stats.reposContributed} repos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Archetype Hero */}
              <div className={`flex flex-col relative z-20 flex-shrink-0 mb-4`}>
                 <div className="w-8 h-[2px] bg-[#39d353] mb-3 rounded-full shadow-[0_0_15px_rgba(57,211,83,0.4)]"></div>
                 <h3 className={`text-3xl md:text-4xl font-display font-black text-white leading-tight tracking-tighter mb-4 uppercase`}>
                   {insights.archetype}
                 </h3>
                 <p className={`text-[13px] md:text-[14px] text-[#8b949e] font-light leading-relaxed tracking-wide opacity-90 italic`}>
                   {insights.archetypeDescription}
                 </p>
              </div>

              {/* Stats Grid */}
              <div className={`grid grid-cols-2 gap-x-6 gap-y-3 relative z-20 mb-5`}>
                {candidateStats.slice(0, 4).map((stat) => (
                  <div key={stat.id} className="border-t border-white/10 pt-2 md:pt-3 group">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                        {stat.icon}
                      </span>
                      <p className="text-[8px] md:text-[9px] text-[#484f58] font-mono uppercase tracking-[0.2em] group-hover:text-[#8b949e] transition-colors">{stat.label}</p>
                    </div>
                    <p className={`text-2xl md:text-3xl text-white font-black tracking-tighter truncate`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Additional Stats Row */}
              {candidateStats.length > 4 && (
                <div className={`grid grid-cols-1 gap-y-3 relative z-20 mb-5`}>
                  {candidateStats.slice(4).map((stat) => (
                    <div key={stat.id} className="border-t border-white/10 pt-2 md:pt-3 group text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                          {stat.icon}
                        </span>
                        <p className="text-[8px] md:text-[9px] text-[#484f58] font-mono uppercase tracking-[0.2em] group-hover:text-[#8b949e] transition-colors">{stat.label}</p>
                      </div>
                      <p className={`text-2xl md:text-3xl text-white font-black tracking-tighter truncate`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Insight Phrase */}
              <div className={`relative z-20 mb-6`}>
                <p className={`text-[14px] md:text-[15px] text-white/80 leading-relaxed border-l-[2px] border-[#39d353] pl-4 py-0 italic`}>
                  "{insights.cardInsight}"
                </p>
              </div>

              {/* Footer Grid */}
              <div className="mt-auto relative z-20 pt-4 border-t border-[#30363d]/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                  <Octicon className="w-3 h-3 text-white">{Icons.GitHub}</Octicon>
                  <span className="text-[8px] font-mono tracking-[0.3em] font-black uppercase">WRAPPED.DEV</span>
                </div>
                <div className="flex gap-1.5">
                  {gridCells.map((color, i) => (
                    <div key={i} className="w-3 md:w-4 h-3 md:h-4 rounded-[2px]" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR ACTIONS & SHARE SYSTEM */}
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-lg flex-shrink-0">
           <div className="flex flex-col h-full p-6 md:p-8 lg:p-10 rounded-[1.5rem] md:rounded-[2rem] bg-[#161b22]/40 border border-[#30363d] backdrop-blur-3xl shadow-xl">
             
             {/* Share Hook Selection */}
             <div className="mb-8 space-y-4">
               <h4 className="text-[11px] font-mono text-[#8b949e] uppercase tracking-[0.5em] font-black border-b border-white/5 pb-2">Share_Journey</h4>
               
               <p className="text-[11px] font-mono text-[#484f58] italic leading-relaxed px-1">
                 "This isn’t about numbers. It’s about recognizing your rhythm."
               </p>

               <div className="p-5 bg-[#0d1117] border border-white/5 rounded-2xl italic font-light text-[13px] text-[#8b949e] leading-relaxed relative group">
                 <div 
                   className="whitespace-pre-line"
                   dangerouslySetInnerHTML={{
                     __html: hooks[activeHook].text
                       .replace(/@(\w+)/g, '<span class="text-[#39d353] font-semibold not-italic">@$1</span>')
                       .replace(/(\d+)\s+(day|days|contribution|contributions|repo|repos|language|languages)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1 $2</span>')
                       .replace(/(JavaScript|TypeScript|Python|React|Node\.js|HTML|CSS|Java|C\+\+|Go|Rust|PHP|Ruby|Swift|Kotlin)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1</span>')
                       .replace(/(streak|pattern|consistency|rhythm|milestone|journey|wrapped)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1</span>')
                   }}
                 />
                 <button 
                  onClick={() => {
                    setActiveHook((activeHook + 1) % hooks.length);
                    // Track hook cycling
                    if (typeof window !== 'undefined' && (window as any).clarity) {
                      (window as any).clarity('event', 'share_hook_cycled', {
                        username: stats.username,
                        new_hook_type: hooks[(activeHook + 1) % hooks.length].type,
                        current_hook_type: hooks[activeHook].type
                      });
                    }
                  }}
                  className="absolute bottom-2 right-4 text-[9px] font-mono text-[#39d353] hover:text-white transition-colors uppercase font-black"
                 >
                   [Cycle_Hook]
                 </button>
               </div>
             </div>

             {/* Primary Actions */}
             <div className="space-y-4 mb-8">
               
               {/* Export Image - Primary Action */}
               <button 
                 onClick={downloadImage}
                 disabled={isExporting}
                 className={`w-full bg-[#f0f6fc] text-[#0d1117] font-black py-5 rounded-full flex items-center justify-center gap-4 hover:bg-white transition-all shadow-xl active:scale-[0.98] text-lg mb-4 ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
               >
                 {isExporting ? (
                   <div className="w-6 h-6 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <Octicon className="w-6 h-6">{Icons.GitHub}</Octicon>
                 )}
                 {isExporting ? 'EXPORTING...' : 'EXPORT MY YEAR'}
               </button>

               {/* Copy Personalized Text */}
               <button
                 onClick={() => {
                   const personalizedText = `${hooks[activeHook].text}\n\n🎬 Just got my DevWrapped 2025 results!\n\nArchetype: ${insights.archetype}\n"${insights.archetypeDescription}"\n\n2025 Highlights:\n• ${stats.totalCommits} contributions across ${stats.activeDays} active days\n• ${stats.streak} day longest streak\n• Top languages: ${stats.topLanguages.map(l => l.name).join(', ')}\n\nThe AI insights were surprisingly accurate! Try yours at https://devwrapped.netlify.app\n\n#DevWrapped2025 #YearInCode #GitHub #DeveloperStory`;
                   navigator.clipboard.writeText(personalizedText);
                   
                   // Track text copy with Microsoft Clarity
                   if (typeof window !== 'undefined' && (window as any).clarity) {
                     (window as any).clarity('event', 'personalized_text_copied', {
                       username: stats.username,
                       archetype: insights.archetype,
                       hook_type: hooks[activeHook].type,
                       text_length: personalizedText.length
                     });
                   }
                   
                   // Show temporary feedback
                   const button = event.target as HTMLButtonElement;
                   const originalText = button.textContent;
                   button.textContent = 'Copied to Clipboard! ✓';
                   button.classList.add('bg-[#39d353]/20', 'border-[#39d353]', 'text-[#39d353]');
                   setTimeout(() => {
                     button.textContent = originalText;
                     button.classList.remove('bg-[#39d353]/20', 'border-[#39d353]', 'text-[#39d353]');
                   }, 2000);
                 }}
                 className="w-full mb-4 bg-[#39d353]/10 hover:bg-[#39d353]/20 border border-[#39d353]/20 hover:border-[#39d353] text-[#39d353] hover:text-[#2ea043] py-3 rounded-xl text-[11px] font-mono uppercase tracking-widest font-black transition-all"
               >
                 📋 Copy Personalized Text
               </button>
               
               {/* Quick Platform Access */}
               <div className="grid grid-cols-4 gap-2 mb-4">
                 <a
                   href="https://www.linkedin.com/feed/"
                   target="_blank"
                   rel="noreferrer"
                   onClick={() => {
                     // Track LinkedIn click
                     if (typeof window !== 'undefined' && (window as any).clarity) {
                       (window as any).clarity('event', 'social_platform_opened', {
                         platform: 'linkedin',
                         username: stats.username,
                         archetype: insights.archetype
                       });
                     }
                   }}
                   className="flex flex-col items-center gap-1 p-3 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 hover:border-[#0077b5] rounded-lg text-[#0077b5] hover:text-[#00a0dc] transition-all"
                   title="Open LinkedIn"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                   <span className="text-[7px] font-mono font-bold">LinkedIn</span>
                 </a>
                 
                 <a
                   href="https://twitter.com/compose/tweet"
                   target="_blank"
                   rel="noreferrer"
                   onClick={() => {
                     // Track Twitter/X click
                     if (typeof window !== 'undefined' && (window as any).clarity) {
                       (window as any).clarity('event', 'social_platform_opened', {
                         platform: 'twitter',
                         username: stats.username,
                         archetype: insights.archetype
                       });
                     }
                   }}
                   className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-[#c9d1d9] hover:text-white transition-all"
                   title="Open X (Twitter)"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                   </svg>
                   <span className="text-[7px] font-mono font-bold">X</span>
                 </a>
                 
                 <a
                   href="https://www.instagram.com/"
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1 p-3 bg-[#E4405F]/10 hover:bg-[#E4405F]/20 border border-[#E4405F]/20 hover:border-[#E4405F] rounded-lg text-[#E4405F] hover:text-[#F56040] transition-all"
                   title="Open Instagram"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                   </svg>
                   <span className="text-[7px] font-mono font-bold">Instagram</span>
                 </a>
                 
                 <a
                   href="https://reddit.com/submit"
                   target="_blank"
                   rel="noreferrer"
                   className="flex flex-col items-center gap-1 p-3 bg-[#ff4500]/10 hover:bg-[#ff4500]/20 border border-[#ff4500]/20 hover:border-[#ff4500] rounded-lg text-[#ff4500] hover:text-[#ff6500] transition-all"
                   title="Open Reddit"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 2.21-.763zM6.25 13c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25S6.94 13 6.25 13zm7.5 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25S14.44 13 13.75 13zm-5.69 3.94c.463-.89 1.281-1.44 2.19-1.44s1.727.55 2.19 1.44a.25.25 0 0 1-.48.14c-.197-.51-.787-.8-1.71-.8s-1.513.29-1.71.8a.25.25 0 0 1-.48-.14z"/>
                   </svg>
                   <span className="text-[7px] font-mono font-bold">Reddit</span>
                 </a>
               </div>
               
               <div className="text-center">
                 <p className="text-[8px] font-mono text-[#8b949e] leading-relaxed">
                   💡 Export image → Copy text → Paste on any platform → Upload image
                 </p>
               </div>
             </div>

             {/* Product Hunt Review CTA */}
             <div className="mt-6 p-4 bg-gradient-to-r from-[#ff6154]/10 to-[#ff9500]/10 border border-[#ff6154]/20 rounded-xl text-center">
               <p className="text-[11px] font-mono text-[#c9d1d9] mb-3 leading-relaxed">
                 🎉 <span className="text-[#ff6154] font-semibold">Enjoyed your DevWrapped?</span> Help us reach more developers!
               </p>
               <a
                 href="https://www.producthunt.com/products/devwrapped-2025/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-devwrapped-2025"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block hover:scale-105 transition-transform"
               >
                 <img 
                   src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1143033&theme=neutral" 
                   alt="DevWrapped 2025 - DevWrapped 2025 – Your GitHub year, told as a story | Product Hunt" 
                   width="200" 
                   height="43" 
                   className="rounded"
                 />
               </a>
               <p className="text-[9px] font-mono text-[#8b949e] mt-2 opacity-70">
                 Your upvote helps other developers discover their coding story ✨
               </p>
             </div>

             <div className="mt-auto">
               <button 
                 onClick={onReset}
                 className="w-full bg-transparent border border-[#30363d] text-[#8b949e] font-black py-4 rounded-full hover:bg-[#161b22] hover:text-[#f0f6fc] transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest"
               >
                 Start New Analysis
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
