
import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { GitHubStats, AIInsights } from '../types';
import { generateSecureTraceId } from '../services/security';

type AspectRatio = '1:1' | '4:5' | '9:16';

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
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [scale, setScale] = useState(1);
  const [activeHook, setActiveHook] = useState(0);
  const [traceId, setTraceId] = useState('FETCHING...');

  useEffect(() => {
    generateSecureTraceId(stats.username).then(setTraceId);
  }, [stats.username]);

  const hooks = [
    { type: 'Pattern Reveal', text: 'Turns out my coding style has a pattern.\n\nThis year taught me more about how I work than how much I shipped.\n\nHere’s my developer year in review 👇' },
    { type: 'Reflection', text: 'This year wasn’t about doing more — it was about understanding how I work.\n\nSeeing my year in code as a story — not a dashboard — changed my perspective.\n\nSharing mine 👇' },
    { type: 'Curiosity', text: 'Ever wondered what your GitHub activity says about you?\n\nI finally saw mine — and it was surprisingly accurate.\n\nMy developer year wrapped 👇' }
  ];

  const hashtags = "#DevWrapped #YearInCode #DeveloperStory #BuildInPublic";

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cardRef.current) return;
      const viewportHeight = window.innerHeight;
      const containerHeight = viewportHeight * 0.75;
      const cardHeight = cardRef.current.offsetHeight;
      
      if (cardHeight > containerHeight) {
        setScale(containerHeight / cardHeight);
      } else {
        setScale(1);
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [aspectRatio]);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
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
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string, platform?: string) => {
    const fullText = `${text}\n\n${hashtags}`;
    navigator.clipboard.writeText(fullText);
    alert(`${platform ? platform : 'Text'} copied to clipboard! Share it with your exported image.`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert('App link copied! Share it so others can see their year.');
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
  ];

  const gridCells = Array.from({ length: 12 }).map(() => {
    const val = Math.random();
    if (val > 0.8) return '#39d353';
    if (val > 0.5) return '#26a641';
    return '#161b22';
  });

  const ratioStyles = {
    '1:1': { width: '480px', height: '480px' },
    '4:5': { width: '480px', height: '600px' },
    '9:16': { width: '420px', height: '746px' },
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
      <div className="w-full max-w-7xl px-4 flex justify-between items-end mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-black text-[#39d353] tracking-[0.4em] uppercase">Status: Artifact_Finalized</span>
          <h2 className="text-[10px] font-mono font-bold text-white/20 tracking-[0.5em] uppercase">SECURE_TRACE_ID: {traceId}</h2>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-12 items-start justify-center w-full max-w-7xl px-4">
        
        {/* CARD VIEWER */}
        <div 
          ref={containerRef}
          className="flex flex-col items-center gap-6 w-full xl:w-auto"
        >
          {/* Ratio Selector */}
          <div className="flex bg-[#161b22]/90 backdrop-blur-2xl p-1.5 rounded-full border border-[#30363d] shadow-2xl z-20">
            {(['1:1', '4:5', '9:16'] as AspectRatio[]).map((r) => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${aspectRatio === r ? 'bg-[#39d353] text-black font-black' : 'text-[#8b949e] hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div 
            className="relative flex items-center justify-center transition-all duration-700 ease-in-out"
            style={{ 
              height: ratioStyles[aspectRatio].height,
              width: ratioStyles[aspectRatio].width,
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
          >
            <div 
              ref={cardRef}
              className={`absolute inset-0 bg-[#0d1117] rounded-[2rem] p-8 md:p-10 overflow-hidden border border-[#30363d] shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col`}
              style={{ ...ratioStyles[aspectRatio] }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 font-mono text-[8px] tracking-[0.4em] uppercase rotate-90 origin-top-right whitespace-nowrap select-none">
                ARTIFACT_VERIFIED_{traceId}
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6 relative z-10 flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-[#8b949e] tracking-[0.3em] uppercase mb-1">DEV_WRAPPED</span>
                  <span className="text-xl font-display font-black text-white tracking-tighter">2025</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <img src={stats.avatarUrl} alt={stats.username} className="w-6 h-6 rounded-full grayscale" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white/90 leading-none">@{stats.username}</span>
                    <div className="flex items-center gap-1 opacity-40">
                      <Octicon className="w-2 h-2">{Icons.Repo}</Octicon>
                      <span className="text-[7px] font-mono uppercase tracking-widest">{stats.reposContributed} repos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Archetype Hero */}
              <div className={`flex flex-col relative z-10 flex-shrink-0 ${aspectRatio === '1:1' ? 'mb-4' : 'mb-6'}`}>
                 <div className="w-10 h-[3px] bg-[#39d353] mb-5 rounded-full shadow-[0_0_15px_rgba(57,211,83,0.4)]"></div>
                 <h3 className={`${aspectRatio === '1:1' ? 'text-2xl' : 'text-3xl md:text-4xl'} font-display font-black text-white leading-tight tracking-tighter mb-4 uppercase`}>
                   {insights.archetype}
                 </h3>
                 <p className={`${aspectRatio === '1:1' ? 'text-[11px]' : 'text-[13px] md:text-[15px]'} text-[#8b949e] font-light leading-relaxed tracking-wide opacity-90 italic`}>
                   {insights.archetypeDescription}
                 </p>
              </div>

              {/* Stats Grid */}
              <div className={`grid grid-cols-2 gap-x-8 gap-y-4 relative z-10 ${aspectRatio === '1:1' ? 'mb-4' : 'mb-6'}`}>
                {candidateStats.map((stat) => (
                  <div key={stat.id} className="border-t border-white/10 pt-2 md:pt-4 group">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                        {stat.icon}
                      </span>
                      <p className="text-[8px] md:text-[9px] text-[#484f58] font-mono uppercase tracking-[0.2em] group-hover:text-[#8b949e] transition-colors">{stat.label}</p>
                    </div>
                    <p className={`${aspectRatio === '1:1' ? 'text-xl' : 'text-2xl md:text-3xl'} text-white font-black tracking-tighter truncate`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Insight Phrase */}
              <div className={`relative z-10 ${aspectRatio === '1:1' ? 'mb-4' : 'mb-8'}`}>
                <p className={`${aspectRatio === '1:1' ? 'text-[12px]' : 'text-[14px] md:text-[16px]'} text-white/80 leading-relaxed border-l-[2px] border-[#39d353] pl-4 py-0 italic`}>
                  "{insights.cardInsight}"
                </p>
              </div>

              {/* Footer Grid */}
              <div className="mt-auto relative z-10 pt-6 border-t border-[#30363d]/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
                  <Octicon className="w-4 h-4 text-white">{Icons.GitHub}</Octicon>
                  <span className="text-[9px] font-mono tracking-[0.3em] font-black uppercase">WRAPPED.DEV</span>
                </div>
                <div className="flex gap-1">
                  {gridCells.map((color, i) => (
                    <div key={i} className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-[1px]" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR ACTIONS & SHARE SYSTEM */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
           <div className="flex flex-col h-full p-8 rounded-[2rem] bg-[#161b22]/40 border border-[#30363d] backdrop-blur-3xl shadow-xl">
             
             {/* Share Hook Selection */}
             <div className="mb-8 space-y-4">
               <h4 className="text-[11px] font-mono text-[#8b949e] uppercase tracking-[0.5em] font-black border-b border-white/5 pb-2">Share_Journey</h4>
               
               <p className="text-[11px] font-mono text-[#484f58] italic leading-relaxed px-1">
                 "This isn’t about numbers. It’s about recognizing your rhythm."
               </p>

               <div className="p-5 bg-[#0d1117] border border-white/5 rounded-2xl italic font-light text-[13px] text-[#8b949e] leading-relaxed relative group">
                 <p className="line-clamp-4">"{hooks[activeHook].text}"</p>
                 <button 
                  onClick={() => setActiveHook((activeHook + 1) % hooks.length)}
                  className="absolute bottom-2 right-4 text-[9px] font-mono text-[#39d353] hover:text-white transition-colors uppercase font-black"
                 >
                   [Cycle_Hook]
                 </button>
               </div>
             </div>

             <div className="space-y-3 mb-8">
               <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={() => copyToClipboard(hooks[activeHook].text, 'LinkedIn')}
                  className="bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all font-black flex items-center justify-center gap-2"
                 >
                   LinkedIn
                 </button>
                 <button 
                  onClick={() => copyToClipboard(hooks[activeHook].text, 'X / Twitter')}
                  className="bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all font-black flex items-center justify-center gap-2"
                 >
                   X / Twitter
                 </button>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={() => copyToClipboard(hooks[activeHook].text, 'Instagram')}
                  className="bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all font-black flex items-center justify-center gap-2"
                 >
                   Instagram
                 </button>
                 <button 
                  onClick={copyLink}
                  className="bg-white/5 border border-white/10 text-white/70 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all font-black flex items-center justify-center gap-2"
                 >
                   Copy Link
                 </button>
               </div>
               
               <button 
                 onClick={downloadImage}
                 disabled={isExporting}
                 className={`w-full bg-[#f0f6fc] text-[#0d1117] font-black py-5 mt-4 rounded-full flex items-center justify-center gap-4 hover:bg-white transition-all shadow-xl active:scale-[0.98] text-lg ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
               >
                 {isExporting ? (
                   <div className="w-6 h-6 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <Octicon className="w-6 h-6">{Icons.GitHub}</Octicon>
                 )}
                 {isExporting ? 'EXPORTING...' : 'EXPORT MY YEAR'}
               </button>
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
