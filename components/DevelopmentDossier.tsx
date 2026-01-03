
import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { GitHubStats, AIInsights } from '../types';
import { trackEvent } from '../services/mixpanelService';

interface DevelopmentDossierProps {
  stats: GitHubStats;
  insights: AIInsights;
}

const DevelopmentDossier: React.FC<DevelopmentDossierProps> = ({ stats, insights }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    narrative: false,
    insights: false,
    patterns: false,
    forward: false,
    technical: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Enhanced highlighting function for narratives with user data
  const highlightText = (text: string) => {
    return text
      // Highlight usernames (with @ symbol and without)
      .replace(/@(\w+)/g, '<span class="text-[#39d353] font-semibold not-italic">@$1</span>')
      .replace(new RegExp(`\\b${stats.username}\\b`, 'gi'), '<span class="text-[#39d353] font-semibold not-italic">$&</span>')
      // Highlight numbers with units (contributions, days, streak, etc.)
      .replace(/(\d+)\s+(day|days|contribution|contributions|repo|repos|language|languages|commit|commits|star|stars)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1 $2</span>')
      // Highlight programming languages and technologies
      .replace(/(JavaScript|TypeScript|Python|React|Node\.js|HTML|CSS|Java|C\+\+|Go|Rust|PHP|Ruby|Swift|Kotlin|Vue|Angular|Docker|Git)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1</span>')
      // Highlight key development terms
      .replace(/(streak|pattern|consistency|rhythm|milestone|journey|wrapped|archetype|developer|coding|programming|repository|commit|merge|pull request)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1</span>')
      // Highlight months
      .replace(/(January|February|March|April|May|June|July|August|September|October|November|December)/gi, '<span class="text-[#39d353] font-semibold not-italic">$1</span>')
      // Convert line breaks to proper HTML paragraphs
      .replace(/\n\n/g, '</p><p class="mb-6">')
      .replace(/\n/g, '<br/>');
  };

  const exportFullReport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    // Track dossier export attempt with Mixpanel
    trackEvent('Development Dossier Export Started', {
      user_id: stats.username,
      archetype: insights.archetype,
      page_url: window.location.href
    });
    
    // Track dossier export attempt
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'dossier_export_started', {
        username: stats.username,
        archetype: insights.archetype
      });
    }
    
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
      
      // Track successful dossier export with Mixpanel
      trackEvent('Development Dossier Export Success', {
        user_id: stats.username,
        archetype: insights.archetype,
        page_url: window.location.href
      });
      
      // Track successful dossier export
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'dossier_export_success', {
          username: stats.username,
          archetype: insights.archetype
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      window.print();
      
      // Track dossier export failure with Mixpanel
      trackEvent('Error', {
        error_type: 'Dossier Export',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        page_url: window.location.href,
        user_id: stats.username,
        fallback_action: 'print'
      });
      
      // Track dossier export failure (fallback to print)
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'dossier_export_failed_print_fallback', {
          username: stats.username,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mt-12 md:mt-24 mb-16 md:mb-32 animate-in fade-in duration-1000 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 md:gap-0">
        <div className="space-y-2 text-center md:text-left w-full md:w-auto">
          <h3 className="text-2xl md:text-4xl font-display font-black text-white tracking-tighter uppercase">Intelligence Dossier</h3>
          <p className="text-[#8b949e] font-light italic text-base md:text-lg">Comprehensive analysis of the 2025 development cycle.</p>
        </div>
        <button 
          onClick={exportFullReport}
          disabled={isExporting}
          className="bg-[#39d353] text-black hover:bg-[#2ea043] px-4 md:px-8 py-3 md:py-4 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 md:gap-3 active:scale-95 font-black shadow-xl w-full md:w-auto justify-center"
        >
          {isExporting ? 'Processing...' : (
            <>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">DOWNLOAD FULL DOSSIER</span>
              <span className="sm:hidden">DOWNLOAD DOSSIER</span>
            </>
          )}
        </button>
      </div>

      <div 
        ref={reportRef}
        className="bg-[#0d1117] border border-[#30363d] rounded-2xl md:rounded-[3.5rem] p-4 md:p-8 lg:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Background GitHub Logos */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* First GitHub logo - top right */}
          <div 
            className="absolute opacity-[0.025] select-none"
            style={{
              top: '8%',
              right: '12%',
              transform: 'rotate(25deg)',
            }}
          >
            <svg width="200" height="200" viewBox="0 0 16 16" fill="#c9d1d9">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
          
          {/* Second GitHub logo - middle left */}
          <div 
            className="absolute opacity-[0.02] select-none"
            style={{
              top: '35%',
              left: '5%',
              transform: 'rotate(-18deg)',
            }}
          >
            <svg width="180" height="180" viewBox="0 0 16 16" fill="#c9d1d9">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>

          {/* Third GitHub logo - bottom right */}
          <div 
            className="absolute opacity-[0.015] select-none"
            style={{
              bottom: '20%',
              right: '8%',
              transform: 'rotate(12deg)',
            }}
          >
            <svg width="160" height="160" viewBox="0 0 16 16" fill="#c9d1d9">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
        </div>
        {/* Dossier Header - Mobile Optimized */}
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 mb-12 md:mb-20 pb-8 md:pb-12 border-b border-[#30363d]">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 text-center sm:text-left">
            <img src={stats.avatarUrl} className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#30363d] grayscale" alt={stats.username} />
            <div>
              <h4 className="text-2xl md:text-4xl font-display font-black text-white mb-1 md:mb-2">@{stats.username}</h4>
              <p className="text-[#39d353] font-mono text-sm md:text-base tracking-widest uppercase font-bold">{insights.archetype}</p>
            </div>
          </div>
          <div className="text-center md:text-right flex flex-col justify-center">
            <span className="text-[10px] md:text-[11px] font-mono text-[#484f58] uppercase tracking-[0.4em] md:tracking-[0.6em] mb-2 md:mb-3">Classification</span>
            <p className="text-base md:text-xl text-[#c9d1d9] font-light italic leading-relaxed max-w-sm mx-auto md:ml-auto">
              "{insights.archetypeDescription}"
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-24 relative z-10">
          <h5 className="text-[11px] font-mono text-[#58a6ff] uppercase tracking-[0.7em] mb-10 font-black">Executive Summary</h5>
          <div className="bg-[#161b22]/30 border border-[#30363d] p-8 md:p-12 rounded-[3rem]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[#58a6ff] font-mono text-[12px] pt-1 font-black">•</span>
                <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light">
                  Operates in focused, high-intensity development cycles with {stats.activeDays} active days
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#58a6ff] font-mono text-[12px] pt-1 font-black">•</span>
                <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light">
                  Demonstrates system-level thinking across {stats.reposContributed} repositories
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#58a6ff] font-mono text-[12px] pt-1 font-black">•</span>
                <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light">
                  Delivers peak output during {stats.mostActiveMonth} with sustained {stats.streak}-day streaks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section I */}
        <section className="mb-24 relative z-10">
          <h5 className="text-[11px] font-mono text-[#39d353] uppercase tracking-[0.7em] mb-10 font-black">Section I // The Narrative</h5>
          <div className="bg-[#161b22]/30 border border-[#30363d] p-12 rounded-[3rem]">
            <div 
              className="text-lg md:text-xl font-display text-[#f0f6fc] leading-relaxed font-light italic opacity-95"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-6">${highlightText(insights.narrative)}</p>`
              }}
            />
          </div>
        </section>

        {/* Section II & III */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 relative z-10">
          <section>
            <h5 className="text-[11px] font-mono text-purple-500 uppercase tracking-[0.7em] mb-10 font-black">Section II // Intelligence Observations</h5>
            <div className="space-y-6">
              {insights.insights.map((ins, i) => (
                <div key={i} className="flex gap-6 p-7 bg-white/5 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10">
                  <span className="text-purple-500 font-mono text-[12px] pt-1 font-black">0{i+1}</span>
                  <p 
                    className="text-base text-[#c9d1d9] leading-relaxed font-light"
                    dangerouslySetInnerHTML={{ __html: highlightText(ins) }}
                  />
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
                  <p 
                    className="text-base text-[#c9d1d9] leading-relaxed font-light"
                    dangerouslySetInnerHTML={{ __html: highlightText(pat) }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Strategic Outlook */}
        <section className="mb-24 relative z-10">
          <h5 className="text-[11px] font-mono text-[#ff7b72] uppercase tracking-[0.7em] mb-10 font-black">Strategic Outlook</h5>
          <div className="bg-[#161b22]/30 border border-[#30363d] p-8 md:p-12 rounded-[3rem]">
            <div className="space-y-8">
              <div className="flex gap-6">
                <span className="text-[#ff7b72] font-mono text-[14px] font-black">1.</span>
                <div>
                  <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light mb-2">
                    <span className="font-semibold">Sustainability Signal</span>
                  </p>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    Sprint-heavy execution with {stats.activeDays} active days suggests high throughput but may indicate need for sustainable pacing cycles.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <span className="text-[#ff7b72] font-mono text-[14px] font-black">2.</span>
                <div>
                  <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light mb-2">
                    <span className="font-semibold">Growth Opportunity</span>
                  </p>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    Strong {stats.topLanguages[0]?.name || 'technical'} dominance suggests readiness for deeper system ownership or platform leadership roles.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <span className="text-[#ff7b72] font-mono text-[14px] font-black">3.</span>
                <div>
                  <p className="text-base md:text-lg text-[#c9d1d9] leading-relaxed font-light mb-2">
                    <span className="font-semibold">Collaboration Vector</span>
                  </p>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    Multi-repo orchestration across {stats.reposContributed} repositories indicates high solo throughput; next leverage may come from visible team leadership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section IV - Mobile Optimized */}
        <section className="mb-16 md:mb-24 px-2 md:px-0">
          <h5 className="text-[11px] font-mono text-[#ff7b72] uppercase tracking-[0.5em] md:tracking-[0.7em] mb-8 md:mb-10 font-black">Section IV // Core Contribution Metrics</h5>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { label: 'Total Contributions', val: stats.totalCommits },
              { label: 'Active Cycle Days', val: stats.activeDays },
              { label: 'Longest Streak', val: `${stats.streak}d` },
              { label: 'Peak Cycle Month', val: stats.mostActiveMonth },
              { label: 'Total Stars', val: stats.totalStarsReceived },
              { label: 'Years Active', val: stats.accountAge ? `${stats.accountAge}y` : 'N/A' },
              { label: 'Followers', val: stats.followers },
              { label: 'Following', val: stats.following },
            ].map((m, i) => (
              <div key={i} className="p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-[#161b22]/40 border border-[#30363d] text-center shadow-xl hover:scale-105 transition-transform duration-500 flex flex-col justify-center items-center">
                <span className="block text-xl md:text-3xl lg:text-4xl font-display font-black text-white mb-2 md:mb-3 whitespace-nowrap">{m.val}</span>
                <span className="text-[8px] md:text-[10px] text-[#484f58] uppercase font-mono tracking-widest font-black leading-tight break-words max-w-[100px] md:max-w-[140px] text-center">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Profile Information Row - Mobile Optimized */}
          {(stats.bio || stats.company || stats.location) && (
            <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
              {stats.bio && (
                <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                  <h6 className="text-[9px] md:text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-2 md:mb-3 font-black">Bio</h6>
                  <p className="text-xs md:text-sm text-white leading-relaxed">{stats.bio}</p>
                </div>
              )}
              
              {stats.company && (
                <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                  <h6 className="text-[9px] md:text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-2 md:mb-3 font-black">Company</h6>
                  <p className="text-xs md:text-sm text-white font-medium">{stats.company}</p>
                </div>
              )}
              
              {stats.location && (
                <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                  <h6 className="text-[9px] md:text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-2 md:mb-3 font-black">Location</h6>
                  <p className="text-xs md:text-sm text-white font-medium">{stats.location}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section V */}
        <section className="mb-24">
          <h5 className="text-[11px] font-mono text-white uppercase tracking-[0.7em] mb-10 font-black">Section V // Technical DNA Landscape</h5>
          
          {/* Tech Stack Logo Cloud */}
          <div className="mb-12">
            <h6 className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-6 font-black text-center">Technology Stack</h6>
            <div className="flex flex-wrap justify-center items-center gap-4 p-8 bg-[#161b22]/20 rounded-2xl border border-[#30363d]/30">
              {stats.allLanguages.slice(0, 15).map((lang, i) => {
                // Map languages to colors and icons
                const getTechStyle = (language: string) => {
                  const techStyles: Record<string, { color: string; bg: string }> = {
                    'JavaScript': { color: '#f7df1e', bg: 'rgba(247, 223, 30, 0.1)' },
                    'TypeScript': { color: '#3178c6', bg: 'rgba(49, 120, 198, 0.1)' },
                    'Python': { color: '#3776ab', bg: 'rgba(55, 118, 171, 0.1)' },
                    'Java': { color: '#ed8b00', bg: 'rgba(237, 139, 0, 0.1)' },
                    'React': { color: '#61dafb', bg: 'rgba(97, 218, 251, 0.1)' },
                    'Vue': { color: '#4fc08d', bg: 'rgba(79, 192, 141, 0.1)' },
                    'Angular': { color: '#dd0031', bg: 'rgba(221, 0, 49, 0.1)' },
                    'Node.js': { color: '#339933', bg: 'rgba(51, 153, 51, 0.1)' },
                    'Go': { color: '#00add8', bg: 'rgba(0, 173, 216, 0.1)' },
                    'Rust': { color: '#000000', bg: 'rgba(0, 0, 0, 0.1)' },
                    'C++': { color: '#00599c', bg: 'rgba(0, 89, 156, 0.1)' },
                    'C#': { color: '#239120', bg: 'rgba(35, 145, 32, 0.1)' },
                    'PHP': { color: '#777bb4', bg: 'rgba(119, 123, 180, 0.1)' },
                    'Ruby': { color: '#cc342d', bg: 'rgba(204, 52, 45, 0.1)' },
                    'Swift': { color: '#fa7343', bg: 'rgba(250, 115, 67, 0.1)' },
                    'Kotlin': { color: '#7f52ff', bg: 'rgba(127, 82, 255, 0.1)' },
                    'HTML': { color: '#e34f26', bg: 'rgba(227, 79, 38, 0.1)' },
                    'CSS': { color: '#1572b6', bg: 'rgba(21, 114, 182, 0.1)' },
                    'Shell': { color: '#89e051', bg: 'rgba(137, 224, 81, 0.1)' },
                    'Dockerfile': { color: '#384d54', bg: 'rgba(56, 77, 84, 0.1)' },
                  };
                  
                  return techStyles[language] || { color: '#8b949e', bg: 'rgba(139, 148, 158, 0.1)' };
                };

                const style = getTechStyle(lang.name);
                const size = Math.max(12, Math.min(24, 12 + (lang.count * 2))); // Size based on usage

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-110 cursor-default"
                    style={{ backgroundColor: style.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 font-black text-xs"
                      style={{ backgroundColor: style.color, color: '#000' }}
                    >
                      {lang.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-mono text-white font-medium">{lang.name}</span>
                    <span className="text-[8px] font-mono text-[#8b949e]">{lang.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="col-span-1 space-y-5">
              <h6 className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-4 font-black">Top Languages</h6>
              {stats.topLanguages.map((lang, i) => (
                <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-base text-white font-bold">{lang.name}</span>
                  <span className="text-[12px] font-mono text-[#8b949e]">{lang.count} Repos</span>
                </div>
              ))}
            </div>
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <h6 className="col-span-full text-[10px] font-mono text-[#8b949e] uppercase tracking-widest mb-2 font-black">Recent Projects</h6>
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

        {/* Monthly Activity Section - Mobile Optimized */}
        <section className="mb-16 md:mb-24 px-2 md:px-0">
          <h5 className="text-sm md:text-base font-mono text-[#8b949e] uppercase tracking-[0.3em] md:tracking-[0.5em] mb-6 md:mb-8 font-black text-center">2025 Monthly Activity</h5>
          
          {/* Disclaimer */}
          <div className="mb-6 md:mb-8 text-center px-4">
            <p className="text-[10px] md:text-xs font-mono text-[#6e7681] italic max-w-2xl mx-auto leading-relaxed">
              ⚠️ Limited to public events from GitHub's API (~90 days). Actual GitHub contribution count may be higher due to private repos and older activity.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4 md:space-y-6">
            <div className="w-full max-w-sm md:max-w-2xl">
              {/* Simple Monthly Blocks */}
              <div className="p-3 md:p-4 bg-[#161b22]/20 rounded-xl">
                {stats.contributionGrid && stats.contributionGrid.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {/* Mobile: 2 rows of 6 blocks, Desktop: Single row of 12 blocks */}
                    <div className="grid grid-cols-6 md:flex md:justify-center md:items-center gap-1 md:gap-2 justify-items-center">
                      {stats.contributionGrid.map((month, i) => {
                        const getActivityColor = (level: number) => {
                          switch (level) {
                            case 0: return '#161b22'; // No activity
                            case 1: return '#0e4429'; // Low activity
                            case 2: return '#006d32'; // Medium-low activity  
                            case 3: return '#26a641'; // Medium-high activity
                            case 4: return '#39d353'; // High activity
                            default: return '#161b22';
                          }
                        };

                        return (
                          <div key={i} className="group relative">
                            {/* Monthly Block - Responsive sizing */}
                            <div
                              className="w-6 h-6 md:w-8 md:h-8 rounded cursor-pointer transition-all hover:scale-110 border border-[#30363d]/20"
                              style={{ backgroundColor: getActivityColor(month.level) }}
                              title={`${month.month}: ${month.count} contributions`}
                            >
                              {/* Tooltip on hover - Hidden on mobile */}
                              <div className="hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#21262d] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {month.month}: {month.count} contributions
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Month Labels Row - Responsive */}
                    <div className="grid grid-cols-6 md:flex md:justify-center md:items-center gap-1 md:gap-2 mt-2 md:mt-3 justify-items-center">
                      {stats.contributionGrid.map((month, i) => (
                        <div key={i} className="w-6 md:w-8 text-center">
                          <span className="text-[10px] md:text-xs font-mono text-[#8b949e] font-medium">
                            {month.month.charAt(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend - Mobile optimized */}
                    <div className="flex items-center justify-center mt-6 md:mt-8 space-x-2 md:space-x-3">
                      <span className="text-[10px] md:text-xs font-mono text-[#8b949e]">Less</span>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm" style={{ backgroundColor: '#161b22' }}></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm" style={{ backgroundColor: '#0e4429' }}></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm" style={{ backgroundColor: '#006d32' }}></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm" style={{ backgroundColor: '#26a641' }}></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm" style={{ backgroundColor: '#39d353' }}></div>
                      </div>
                      <span className="text-[10px] md:text-xs font-mono text-[#8b949e]">More</span>
                    </div>
                  </div>
                ) : (
                  // Fallback message if no activity data available
                  <div className="text-center py-4">
                    <p className="text-[#8b949e] text-sm font-mono">
                      Activity data not available
                    </p>
                  </div>
                )}
                
                {/* Activity Summary with Comparison - Mobile optimized */}
                {stats.contributionGrid && (
                  <div className="mt-4 md:mt-6 text-center space-y-1 md:space-y-2 px-2">
                    <p className="text-[10px] md:text-xs font-mono text-[#8b949e] leading-relaxed">
                      {stats.contributionGrid.filter(month => month.count > 0).length} active months • {stats.contributionGrid.reduce((sum, month) => sum + month.count, 0)} detected contributions
                    </p>
                    <p className="text-[9px] md:text-[10px] font-mono text-[#6e7681] opacity-60 leading-relaxed">
                      Peak: {stats.contributionGrid.reduce((max, month) => month.count > max.count ? month : max, stats.contributionGrid[0])?.month} ({stats.contributionGrid.reduce((max, month) => Math.max(max, month.count), 0)} contributions)
                    </p>
                    <p className="text-[8px] md:text-[9px] font-mono text-[#ff7b72] opacity-80 leading-relaxed">
                      Note: GitHub's official count may be higher due to private activity
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-20 pt-16 border-t border-[#30363d]/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="space-y-4">
              <h5 className="text-[11px] font-mono text-white/40 uppercase tracking-[0.5em] font-black">Reported by DevWrapped</h5>
              <div className="space-y-1">
                <p className="text-2xl font-display font-black text-white">Somesh Bhardwaj</p>
                <div className="flex gap-5">
                  <a 
                    href="https://github.com/Dev-Somesh" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => {
                      trackEvent('External Link Clicked', {
                        link_type: 'github_profile_dossier',
                        destination: 'github.com',
                        action: 'view_profile',
                        context: 'development_dossier',
                        user_id: stats.username,
                        page_url: window.location.href
                      });
                    }}
                    className="text-sm text-[#39d353] hover:underline font-mono"
                  >
                    GitHub
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/ersomeshbhardwaj/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => {
                      trackEvent('External Link Clicked', {
                        link_type: 'linkedin_profile_dossier',
                        destination: 'linkedin.com',
                        action: 'view_profile',
                        context: 'development_dossier',
                        user_id: stats.username,
                        page_url: window.location.href
                      });
                    }}
                    className="text-sm text-[#58a6ff] hover:underline font-mono"
                  >
                    LinkedIn
                  </a>
                  <a 
                    href="https://someshbhardwaj.me" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => {
                      trackEvent('External Link Clicked', {
                        link_type: 'portfolio_dossier',
                        destination: 'someshbhardwaj.me',
                        action: 'view_portfolio',
                        context: 'development_dossier',
                        user_id: stats.username,
                        page_url: window.location.href
                      });
                    }}
                    className="text-sm text-purple-400 hover:underline font-mono"
                  >
                    Portfolio
                  </a>
                </div>
              </div>
            </div>
            <div className="md:text-right space-y-2">
              <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Inquiries & Feedback</p>
              <a href="mailto:hello@someshbhardwaj.me" className="text-lg text-white hover:text-[#39d353] transition-colors font-mono font-medium">hello@someshbhardwaj.me</a>
            </div>
          </div>
        </section>

        <div className="mt-16 pt-12 border-t border-[#30363d]/30 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20">
           <div className="flex items-center gap-4">
             <svg height="28" viewBox="0 0 16 16" width="28" fill="white"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
             <span className="text-[12px] font-mono tracking-[1em] font-black uppercase">DEVWRAPPED // 2025</span>
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
