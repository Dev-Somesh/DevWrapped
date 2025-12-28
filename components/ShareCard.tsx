
import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { GitHubStats, AIInsights } from '../types';

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
}

const ShareCard: React.FC<ShareCardProps> = ({ stats, insights, onReset }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [scale, setScale] = useState(1);
  const [activeHook, setActiveHook] = useState(0);

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
    { id: 'activeDays', label: 'Active Days', value: stats.activeDays, score: 3 },
    { id: 'streak', label: 'Max Streak', value: `${stats.streak}d`, score: 3 },
    { id: 'focus', label: 'Top Focus', value: stats.topLanguages[0]?.name || 'Code', score: 3 },
    { id: 'commits', label: 'Contributions', value: stats.totalCommits, score: 2 },
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
          <h2 className="text-[10px] font-mono font-bold text-white/20 tracking-[0.5em] uppercase">SYSTEM_TRACE_KEY: {Math.random().toString(36).substring(7).toUpperCase()}</h2>
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
                ARTIFACT_VERIFIED_2025
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6 relative z-10 flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-[#8b949e] tracking-[0.3em] uppercase mb-1">DEV_WRAPPED</span>
                  <span className="text-xl font-display font-black text-white tracking-tighter">2025</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <img src={stats.avatarUrl} alt={stats.username} className="w-6 h-6 rounded-full grayscale" />
                  <span className="text-[11px] font-black text-white/90">@{stats.username}</span>
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
                    <p className="text-[8px] md:text-[9px] text-[#484f58] font-mono uppercase tracking-[0.2em] mb-1 group-hover:text-[#8b949e] transition-colors">{stat.label}</p>
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
                  <svg height="14" viewBox="0 0 16 16" width="14" fill="white"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
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
                   <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                     <path d="M4.5 14h7a.5.5 0 0 0 .5-.5V11h1v2.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5V11h1v2.5a.5.5 0 0 0 .5.5Zm0-12h7a.5.5 0 0 1 .5.5V5h1V2.5A1.5 1.5 0 0 0 11.5 1h-7A1.5 1.5 0 0 0 3 2.5V5h1V2.5a.5.5 0 0 1 .5-.5ZM5 7h6a1 1 0 0 1 1 1v3H4V8a1 1 0 0 1 1-1Zm0 1v2h6V8H5Z"></path>
                   </svg>
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
