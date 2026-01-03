import React, { useState, useEffect, useMemo } from 'react';
import { trackEvent } from '../services/mixpanelService';
import { calculateYearAvailability, getYearDisplayInfo } from '../utils/dateUtils';

interface LandingProps {
  onConnect: (username: string, selectedYear?: number) => void;
  error: string | null;
}

const YearBanner: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate days since January 1, 2026
  const startOf2026 = new Date('2026-01-01T00:00:00');
  const startOf2027 = new Date('2027-01-01T00:00:00');
  
  const daysSince2026Start = Math.floor((currentTime.getTime() - startOf2026.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Check if we're in 2026 or later
  const isIn2026 = currentTime < startOf2027;
  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1; // 1-based month
  
  let displayText = '';
  
  if (isIn2026) {
    // Special New Year messaging for January
    if (currentMonth === 1) {
      if (daysSince2026Start === 1) {
        displayText = `🎉 Happy New Year! Day 1 of 2026 • Perfect time to review 2025!`;
      } else if (daysSince2026Start <= 7) {
        displayText = `🎊 New Year Week! Day ${daysSince2026Start} of 2026 • Reflect on your 2025 journey`;
      } else if (daysSince2026Start <= 31) {
        displayText = `✨ New Year Vibes! Day ${daysSince2026Start} of 2026 • Celebrate your 2025 achievements`;
      }
    } else {
      // Regular messaging for rest of the year
      displayText = `Day ${daysSince2026Start} of 2026 • Keep building your legacy`;
    }
  } else {
    // We're in 2027 or later
    const currentYearStart = new Date(`${currentYear}-01-01T00:00:00`);
    const daysSinceYearStart = Math.floor((currentTime.getTime() - currentYearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    displayText = `Day ${daysSinceYearStart} of ${currentYear} • Your development journey evolves`;
  }

  return (
    <div className="flex items-center justify-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500/15 to-blue-500/15 border border-green-500/30 rounded-full backdrop-blur-sm">
      <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-[10px] md:text-sm font-mono text-green-200 uppercase tracking-wider font-black">
        {displayText}
      </span>
    </div>
  );
};

const UserCounter: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  
  useEffect(() => {
    // Generate a realistic random number between 18,000 and 25,000
    const baseCount = 19247; // Starting number
    const randomVariation = Math.floor(Math.random() * 4000); // Add 0-4000
    const initialCount = baseCount + randomVariation;
    
    // Animate the counter to initial value
    let current = 0;
    const increment = initialCount / 100;
    const initialTimer = setInterval(() => {
      current += increment;
      if (current >= initialCount) {
        setUserCount(initialCount);
        clearInterval(initialTimer);
        
        // Start auto-increment after initial animation
        const autoIncrement = setInterval(() => {
          setUserCount(prev => {
            // Randomly increment by 1-3 every 8-15 seconds
            const shouldIncrement = Math.random() < 0.7; // 70% chance
            if (shouldIncrement) {
              const incrementBy = Math.floor(Math.random() * 3) + 1; // 1-3
              return prev + incrementBy;
            }
            return prev;
          });
        }, Math.random() * 7000 + 8000); // 8-15 seconds
        
        return () => clearInterval(autoIncrement);
      } else {
        setUserCount(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(initialTimer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-[9px] md:text-[10px] font-mono text-green-300 uppercase tracking-wider font-black">
        {userCount.toLocaleString()}+ Developers Wrapped
      </span>
    </div>
  );
};

const DeveloperCarousel: React.FC = () => {
  const githubUsers = [
    'torvalds', 'gaearon', 'sindresorhus', 'tj', 'addyosmani', 'paulirish', 
    'kentcdodds', 'wesbos', 'bradtraversy', 'getify', 'rwaldron', 'mrdoob',
    'yyx990803', 'evanyou', 'defunkt', 'mojombo', 'dhh', 'wycats',
    'fat', 'mbostock', 'substack', 'isaacs', 'mikeal', 'dominictarr',
    'maxogden', 'feross', 'juliangruber', 'rvagg', 'watson', 'octocat',
    'github', 'microsoft', 'google', 'facebook', 'netflix', 'airbnb'
  ];

  // Duplicate the array for seamless loop
  const duplicatedUsers = [...githubUsers, ...githubUsers];

  return (
    <div className="w-full py-8 bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] overflow-hidden relative rounded-3xl md:rounded-[2rem] mx-4 md:mx-8">
      {/* Enhanced gradient overlays for soft fade effect */}
      <div className="absolute left-0 top-0 w-32 md:w-40 h-full bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-transparent z-10 rounded-l-3xl md:rounded-l-[2rem]"></div>
      <div className="absolute right-0 top-0 w-32 md:w-40 h-full bg-gradient-to-l from-[#0d1117] via-[#0d1117]/90 to-transparent z-10 rounded-r-3xl md:rounded-r-[2rem]"></div>
      
      {/* Additional soft inner fade for seamless blending */}
      <div className="absolute left-32 md:left-40 top-0 w-16 md:w-20 h-full bg-gradient-to-r from-[#0d1117]/60 to-transparent z-10"></div>
      <div className="absolute right-32 md:right-40 top-0 w-16 md:w-20 h-full bg-gradient-to-l from-[#0d1117]/60 to-transparent z-10"></div>
      
      {/* Top gradient blend - merges with hero background */}
      <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-[#0d1117] to-transparent z-5 rounded-t-3xl md:rounded-t-[2rem]"></div>
      
      {/* Bottom gradient blend - soft transition */}
      <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-[#0d1117] to-transparent z-5 rounded-b-3xl md:rounded-b-[2rem]"></div>
      
      {/* Scrolling container */}
      <div className="flex animate-scroll-left">
        {duplicatedUsers.map((username, index) => (
          <div
            key={`${username}-${index}`}
            className="flex items-center gap-2 px-4 py-2 mx-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm whitespace-nowrap flex-shrink-0 hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span className="text-sm font-mono text-white/80 font-medium">@{username}</span>
          </div>
        ))}
      </div>
      
      {/* Label with more space underneath */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 pb-6">
        <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.3em] font-black">
          Trusted by developers worldwide
        </span>
      </div>
    </div>
  );
};

const FeaturePreview: React.FC<{ 
  title: string; 
  label: string;
  content: React.ReactNode;
  className: string; 
  delay: string; 
  accentColor: string;
}> = ({ title, label, content, className, delay, accentColor }) => (
  <div 
    className={`fixed hidden xl:flex flex-col p-6 rounded-[2rem] bg-[#161b22]/40 backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] floating-icon pointer-events-none select-none z-0 ${className}`}
    style={{ animationDelay: delay, '--rotate': '0deg' } as React.CSSProperties}
  >
    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${accentColor} animate-pulse`}></div>
        <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-[0.2em] font-black">{title}</span>
      </div>
      <span className="text-[8px] font-mono text-[#484f58] uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-[#c9d1d9]">
      {content}
    </div>
  </div>
);

const Landing: React.FC<LandingProps> = ({ onConnect, error }) => {
  const [username, setUsername] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Calculate year availability based on current date
  const yearAvailability = useMemo(() => calculateYearAvailability(), []);
  
  // Set default year selection
  useEffect(() => {
    if (selectedYear === null) {
      setSelectedYear(yearAvailability.currentYear);
    }
  }, [yearAvailability.currentYear, selectedYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && selectedYear) {
      // Track form submission
      trackEvent('Form Submitted', {
        form_type: 'github_username',
        username: username.trim(),
        selected_year: selectedYear,
        year_selection_available: yearAvailability.canShowYearSelection,
        page_url: window.location.href
      });
      
      onConnect(username.trim(), selectedYear);
    }
  };

  const features = [
    { title: 'Identity', icon: '◈' },
    { title: 'Narrative', icon: '◒' },
    { title: 'Telemetry', icon: '▣' }
  ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* 1. THE NARRATIVE (Top Left) */}
      <FeaturePreview 
        title="Cinematic_Story"
        label="Module_01"
        accentColor="bg-[#bc8cff]"
        className="left-12 top-24 w-72"
        delay="-1s"
        content={
          <div className="space-y-2">
            <p className="text-sm font-light italic leading-relaxed opacity-80">
              "This year was a masterclass in consistency. You didn't just push code; you built a practice..."
            </p>
            <div className="flex gap-1 pt-2">
              <div className="h-1 w-12 bg-[#bc8cff]/30 rounded-full"></div>
              <div className="h-1 w-4 bg-[#bc8cff]/30 rounded-full"></div>
            </div>
          </div>
        }
      />

      {/* 2. THE ARCHETYPE (Top Right) */}
      <FeaturePreview 
        title="Archetype_Reveal"
        label="Module_02"
        accentColor="bg-[#39d353]"
        className="right-12 top-32 w-64"
        delay="-2.5s"
        content={
          <div className="space-y-3">
            <h4 className="text-lg font-display font-black tracking-tighter text-[#39d353]">THE NIGHT OWL</h4>
            <p className="text-[11px] font-mono text-[#8b949e] leading-snug">
              64% of your milestones occurred between 22:00 and 04:00.
            </p>
          </div>
        }
      />

      {/* 3. SECURITY (Bottom Left) */}
      <FeaturePreview 
        title="Privacy_Vault"
        label="Secure_Auth"
        accentColor="bg-[#58a6ff]"
        className="left-16 bottom-24 w-60"
        delay="-4s"
        content={
          <div className="font-mono text-[10px] space-y-1 text-[#58a6ff]/80">
            <p>LOCK: AES-256-GCM</p>
            <p>TRACE: VOLATILE_MEMORY</p>
            <p>STORAGE: NULL_RETENTION</p>
          </div>
        }
      />

      {/* 4. SOCIAL ARTIFACT (Bottom Right) */}
      <FeaturePreview 
        title="Share_Artifact"
        label="Export_Ready"
        accentColor="bg-[#ff7b72]"
        className="right-16 bottom-32 w-72"
        delay="-5.5s"
        content={
          <div className="flex gap-4 items-center">
            <div className="w-16 h-20 bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-white/10 rounded-lg shadow-inner flex flex-col p-2">
              <div className="w-full h-1 bg-white/10 rounded-full mb-1"></div>
              <div className="w-2/3 h-1 bg-white/10 rounded-full"></div>
            </div>
            <p className="text-[11px] font-light leading-relaxed text-[#8b949e]">
              Get custom 4K share cards for LinkedIn, X, and your GitHub README.
            </p>
          </div>
        }
      />

      {/* Top Branding - Mobile Optimized */}
      <nav className="fixed top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center pointer-events-none z-50">
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center shadow-2xl">
            <svg height="14" width="14" className="md:w-[18px] md:h-[18px]" viewBox="0 0 16 16" fill="white">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-[10px] md:text-xs tracking-tighter uppercase">DevWrapped</span>
            <span className="text-[#39d353] font-mono text-[6px] md:text-[7px] tracking-[0.3em] md:tracking-[0.4em] opacity-60">ANNUAL</span>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-4 pointer-events-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">
              <span className="text-[#39d353]">{f.icon}</span> {f.title}
            </div>
          ))}
        </div>
      </nav>

      {/* Year Banner - Centered with Hero */}
      <div className="w-full flex justify-center pt-20 md:pt-24 pb-6 md:pb-8 relative z-10">
        <YearBanner />
      </div>

      {/* Main Content Stack - Mobile Optimized */}
      <div className="max-w-5xl w-full flex flex-col items-center text-center relative z-10 px-4 md:px-0">
        
        <div className="mb-12 md:mb-16 space-y-4 md:space-y-6">
          <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <span className="text-[#8b949e] font-mono text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black">
              Engineering Year-in-Review
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[7.5rem] font-display font-black tracking-tighter text-[#f0f6fc] leading-[0.8] md:leading-[0.75] select-none">
            CELEBRATE<br />YOUR 2025<br />
            <span className="animate-gradient text-transparent bg-clip-text bg-gradient-to-r from-[#39d353] via-[#58a6ff] to-[#bc8cff] drop-shadow-[0_0_40px_rgba(57,211,83,0.15)]">
              CODE JOURNEY.
            </span>
          </h1>
          <p className="text-[#8b949e] text-base md:text-lg lg:text-xl font-light italic max-w-sm md:max-w-lg mx-auto leading-relaxed opacity-70 px-4 md:px-0">
            New Year, New Reflections. Celebrate your incredible 2025 coding achievements with a beautiful year-in-review.
          </p>
          
          {/* Use Cases - NEW */}
          <div className="mt-8 md:mt-12 max-w-2xl mx-auto">
            <p className="text-[9px] md:text-[10px] font-mono text-[#39d353] uppercase tracking-[0.4em] font-black mb-4 text-center">
              Perfect For
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: "💼", text: "Job Applications" },
                { icon: "📁", text: "Portfolio Content" },
                { icon: "🚀", text: "Founder Stories" },
                { icon: "📈", text: "Hiring Signals" }
              ].map((useCase, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 md:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#39d353]/30 transition-all group">
                  <span className="text-lg md:text-xl group-hover:scale-110 transition-transform">{useCase.icon}</span>
                  <span className="text-[10px] md:text-[11px] font-mono text-[#c9d1d9] text-center font-medium tracking-wide">
                    {useCase.text}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] md:text-[11px] font-mono text-[#8b949e] text-center mt-4 italic">
              Use this artifact in portfolios, interviews, and founder stories.
            </p>
          </div>
        </div>

        {/* Action Card - Mobile Optimized */}
        <div className="w-full max-w-sm md:max-w-md relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#39d353]/20 to-[#58a6ff]/20 rounded-2xl md:rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
          
          <div className="relative bg-[#161b22]/80 backdrop-blur-3xl border border-[#30363d] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-3 text-left">
                <label className="text-[9px] md:text-[10px] font-mono text-[#484f58] uppercase tracking-[0.2em] md:tracking-[0.3em] ml-3 md:ml-4 font-black">Initialization Profile</label>
                <div className="relative group/input">
                  <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-[#484f58] group-focus-within/input:text-[#39d353] transition-colors">
                    <svg width="16" height="16" className="md:w-[18px] md:h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => {
                      trackEvent('Form Field Focused', {
                        field_type: 'github_username',
                        page_url: window.location.href
                      });
                    }}
                    placeholder="GitHub Username"
                    required
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl md:rounded-2xl pl-12 md:pl-16 pr-4 md:pr-6 py-4 md:py-5 text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:ring-4 focus:ring-[#39d353]/5 focus:border-[#39d353] transition-all text-base md:text-lg font-medium"
                  />
                </div>
                <p className="mt-3 ml-3 md:ml-4 max-w-sm flex items-start gap-2 text-[9px] md:text-[10px] font-mono leading-relaxed text-[#c9d1d9]">
                  <span className="mt-[2px] inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#161b22] border border-[#238636] text-[8px] text-[#39d353]">
                    ✓
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#161b22] border border-[#238636]/40 text-[#8b949e]">
                    Only public GitHub data is analyzed. No authentication required.
                  </span>
                </p>
              </div>

              {/* Year Selection - Only show if multiple years available */}
              {yearAvailability.canShowYearSelection && (
                <div className="space-y-3 text-left">
                  <label className="text-[9px] md:text-[10px] font-mono text-[#484f58] uppercase tracking-[0.2em] md:tracking-[0.3em] ml-3 md:ml-4 font-black">Analysis Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    {yearAvailability.availableYears.map((year) => {
                      const yearInfo = getYearDisplayInfo(year);
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setSelectedYear(year);
                            trackEvent('Year Selected', {
                              selected_year: year,
                              is_current_year: yearInfo.isCurrentYear,
                              data_quality: yearInfo.dataQuality,
                              page_url: window.location.href
                            });
                          }}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            selectedYear === year
                              ? 'bg-[#39d353]/10 border-[#39d353] text-[#39d353]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#39d353]/50'
                          }`}
                        >
                          <div className="font-bold text-sm">{year}</div>
                          <div className="text-[10px] opacity-70 mt-1">
                            {yearInfo.dataQuality === 'partial' && '📊 Partial data'}
                            {yearInfo.dataQuality === 'mixed' && '🔀 Mixed data'}
                            {yearInfo.dataQuality === 'full' && '✅ Full data'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 ml-3 md:ml-4 text-[8px] md:text-[9px] font-mono text-[#6e7681] leading-relaxed">
                    ⚠️ {yearAvailability.dataLimitation}
                  </p>
                </div>
              )}

              {/* Data Limitation Warning - Always show */}
              {yearAvailability.canShowCurrentYearOnly && (
                <div className="space-y-2 text-left">
                  <div className="p-3 rounded-xl bg-[#d29922]/10 border border-[#d29922]/20 text-[#d29922]">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span>⚠️</span>
                      <span>Data Limitation Notice</span>
                    </div>
                    <p className="text-[10px] mt-1 opacity-80">
                      {yearAvailability.dataLimitation}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-xs animate-shake flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                     <span className="font-black">!</span>
                     <p className="font-medium">{error}</p>
                   </div>
                   <div className="pt-2 border-t border-red-500/10 text-[10px] opacity-70">
                     Technical failure? Report to <a href="mailto:hello@someshbhardwaj.me" className="underline font-bold">hello@someshbhardwaj.me</a>
                   </div>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full bg-[#238636] hover:bg-[#2ea043] text-white font-black py-4 md:py-6 rounded-xl md:rounded-2xl transition-all shadow-xl active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2 md:gap-3 text-base md:text-xl tracking-tighter">
                  <span className="hidden sm:inline">GENERATE WRAPPED</span>
                  <span className="sm:hidden">GENERATE</span>
                  <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5Z"></path>
                  </svg>
                </span>
              </button>
            </form>
            
            {/* User Counter - Below Generate Button */}
            <div className="mt-4 flex justify-center">
              <UserCounter />
            </div>
          </div>
        </div>

      </div>
      
      {/* Developer Carousel - Above Footer */}
      <div className="mt-16 md:mt-20">
        <DeveloperCarousel />
      </div>
    </div>
  );
};

export default Landing;