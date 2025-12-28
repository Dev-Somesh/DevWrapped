
import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { GitHubStats, AIInsights } from '../types';

interface DevelopmentDossierProps {
  stats: GitHubStats;
  insights: AIInsights;
}

const DevelopmentDossier: React.FC<DevelopmentDossierProps> = ({ stats, insights }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportFullReport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0d1117',
        style: {
          padding: '40px',
        }
      });
      const link = document.createElement('a');
      link.download = `dev-dossier-2025-${stats.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mt-24 mb-32 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end mb-12 px-4">
        <div className="space-y-2">
          <h3 className="text-4xl font-display font-black text-white tracking-tighter uppercase">Full Intelligence Dossier</h3>
          <p className="text-[#8b949e] font-light italic text-lg">Comprehensive analysis of the 2025 development cycle.</p>
        </div>
        <button 
          onClick={exportFullReport}
          disabled={isExporting}
          className="bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
        >
          {isExporting ? 'Generating...' : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Full Trace (.PNG)
            </>
          )}
        </button>
      </div>

      <div 
        ref={reportRef}
        className="bg-[#0d1117] border border-[#30363d] rounded-[3.5rem] p-12 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20 pb-12 border-b border-[#30363d]">
          <div className="flex items-center gap-8">
            <img src={stats.avatarUrl} className="w-28 h-28 rounded-full border-4 border-[#30363d] grayscale" alt={stats.username} />
            <div>
              <h4 className="text-4xl font-display font-black text-white mb-2">@{stats.username}</h4>
              <p className="text-[#39d353] font-mono text-base tracking-widest uppercase font-bold">{insights.archetype}</p>
              <div className="flex gap-3 mt-5">
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[11px] font-mono text-[#8b949e] border border-white/10 uppercase tracking-tighter">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[11px] font-mono text-[#8b949e] border border-white/10 uppercase tracking-tighter">V: 2025.REL.01</span>
              </div>
            </div>
          </div>
          <div className="md:text-right flex flex-col justify-center">
            <span className="text-[11px] font-mono text-[#484f58] uppercase tracking-[0.6em] mb-3">Classification</span>
            <p className="text-xl text-[#c9d1d9] font-light italic leading-relaxed max-w-sm md:ml-auto">
              "{insights.archetypeDescription}"
            </p>
          </div>
        </div>

        {/* The Narrative Trace */}
        <section className="mb-24">
          <h5 className="text-[11px] font-mono text-[#39d353] uppercase tracking-[0.7em] mb-10 font-black">Section I // The Narrative Trace</h5>
          <div className="bg-[#161b22]/30 border border-[#30363d] p-12 rounded-[3rem]">
            <p className="text-2xl md:text-3xl font-display text-[#f0f6fc] leading-relaxed font-light italic opacity-95">
              {insights.narrative}
            </p>
          </div>
        </section>

        {/* Growth & Observations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <section>
            <h5 className="text-[11px] font-mono text-purple-500 uppercase tracking-[0.7em] mb-10 font-black">Section II // Intelligence Observations</h5>
            <div className="space-y-6">
              {insights.insights.map((ins, i) => (
                <div key={i} className="flex gap-6 p-7 bg-white/5 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10">
                  <span className="text-purple-500 font-mono text-[12px] pt-1 font-black">0{i+1}</span>
                  <p className="text-base text-[#c9d1d9] leading-relaxed font-light">{ins}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h5 className="text-[11px] font-mono text-[#58a6ff] uppercase tracking-[0.7em] mb-10 font-black">Section III // Behavioral Patterns</h5>
            <div className="space-y-6">
              {insights.patterns.map((pat, i) => (
                <div key={i} className="flex gap-6 p-7 bg-white/5 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10">
                  <span className="text-[#58a6ff] font-mono text-[12px] pt-1 font-black">PK</span>
                  <p className="text-base text-[#c9d1d9] leading-relaxed font-light">{pat}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Core Metrics */}
        <section className="mb-24">
          <h5 className="text-[11px] font-mono text-[#ff7b72] uppercase tracking-[0.7em] mb-10 font-black">Section IV // Core Contribution Metrics</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Contributions', val: stats.totalCommits },
              { label: 'Active Cycle Days', val: stats.activeDays },
              { label: 'Longest Streak', val: `${stats.streak}d` },
              { label: 'Peak Cycle Month', val: stats.mostActiveMonth }
            ].map((m, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-[#161b22]/40 border border-[#30363d] text-center shadow-xl hover:scale-105 transition-transform duration-500">
                <span className="block text-4xl font-display font-black text-white mb-3">{m.val}</span>
                <span className="text-[10px] text-[#484f58] uppercase font-mono tracking-widest font-black leading-tight">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Technical DNA */}
        <section className="mb-24">
          <h5 className="text-[11px] font-mono text-white uppercase tracking-[0.7em] mb-10 font-black">Section V // Technical DNA Landscape</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="col-span-1 space-y-5">
              {stats.topLanguages.map((lang, i) => (
                <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-base text-white font-bold">{lang.name}</span>
                  <span className="text-[12px] font-mono text-[#8b949e]">{lang.count} Repos</span>
                </div>
              ))}
            </div>
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.recentRepos.slice(0, 4).map((repo, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 flex flex-col hover:border-white/20 transition-colors">
                  <h6 className="text-xl font-black text-white mb-3 truncate">{repo.name}</h6>
                  <p className="text-[13px] text-[#8b949e] line-clamp-2 mb-6 italic leading-relaxed">{repo.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">{repo.language}</span>
                    <span className="text-[11px] font-mono text-[#d29922] font-black">★ {repo.stars}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Attribution & Contact */}
        <section className="mt-20 pt-16 border-t border-[#30363d]/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="space-y-4">
              <h5 className="text-[11px] font-mono text-white/40 uppercase tracking-[0.5em] font-black">Reported by DevWrapped</h5>
              <div className="space-y-1">
                <p className="text-xl font-display font-black text-white">Somesh Bhardwaj</p>
                <div className="flex gap-4">
                  <a href="https://github.com/Dev-Somesh" target="_blank" rel="noopener noreferrer" className="text-sm text-[#39d353] hover:underline font-mono">/Dev-Somesh</a>
                  <a href="https://www.linkedin.com/in/ersomeshbhardwaj/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#58a6ff] hover:underline font-mono">LinkedIn</a>
                </div>
              </div>
            </div>
            <div className="md:text-right space-y-2">
              <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Inquiries & Feedback</p>
              <a href="mailto:hello@someshbhardwaj.me" className="text-lg text-white hover:text-[#39d353] transition-colors font-mono font-medium">hello@someshbhardwaj.me</a>
            </div>
          </div>
        </section>

        {/* Dossier Footer */}
        <div className="mt-16 pt-12 border-t border-[#30363d]/30 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20">
           <div className="flex items-center gap-4">
             <svg height="28" viewBox="0 0 16 16" width="28" fill="white"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
             <span className="text-[12px] font-mono tracking-[1em] font-black uppercase">DEVWRAPPED // ARTIFACT // 2025</span>
           </div>
           <div className="font-mono text-[10px] uppercase tracking-widest text-right">
             <p>SYSTEM_REPORT_GEN_SUCCESS</p>
             <p>ENCRYPTION_LAYER_ACTIVE</p>
             <p>TRACED_BY_SOMESH_BHARDWAJ</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentDossier;
