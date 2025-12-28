import React, { useState } from 'react';

interface LandingProps {
  onConnect: (username: string, token?: string) => void;
  error: string | null;
}

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
  const [token, setToken] = useState('');
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onConnect(username.trim(), token.trim() || undefined);
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
              "2025 was a masterclass in consistency. You didn't just push code; you built a practice..."
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

      {/* Top Branding */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center pointer-events-none z-50">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center shadow-2xl">
            <svg height="18" viewBox="0 0 16 16" width="18" fill="white">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-xs tracking-tighter uppercase">DevWrapped</span>
            <span className="text-[#39d353] font-mono text-[7px] tracking-[0.4em] opacity-60">MMXXV</span>
          </div>
        </div>
        <div className="hidden md:flex gap-4 pointer-events-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-mono text-[#8b949e] uppercase tracking-widest">
              <span className="text-[#39d353]">{f.icon}</span> {f.title}
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content Stack */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10">
        
        <div className="mb-16 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <span className="text-[#8b949e] font-mono text-[9px] uppercase tracking-[0.5em] font-black">
              Engineering Year-in-Review
            </span>
          </div>
          <h1 className="text-6xl md:text-[9rem] font-display font-black tracking-tighter text-[#f0f6fc] leading-[0.75] select-none">
            CELEBRATE<br />YOUR<br />
            <span className="animate-gradient text-transparent bg-clip-text bg-gradient-to-r from-[#39d353] via-[#58a6ff] to-[#bc8cff] drop-shadow-[0_0_40px_rgba(57,211,83,0.15)]">
              JOURNEY.
            </span>
          </h1>
          <p className="text-[#8b949e] text-lg md:text-xl font-light italic max-w-lg mx-auto leading-relaxed opacity-70">
            Relive your 2025 coding milestones through a cinematic lens.
            One commit at a time.
          </p>
        </div>

        {/* Action Card */}
        <div className="w-full max-w-md relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#39d353]/20 to-[#58a6ff]/20 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
          
          <div className="relative bg-[#161b22]/80 backdrop-blur-3xl border border-[#30363d] p-8 md:p-10 rounded-[3rem] shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-mono text-[#484f58] uppercase tracking-[0.3em] ml-4 font-black">Initialization Profile</label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#484f58] group-focus-within/input:text-[#39d353] transition-colors">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="GitHub Username"
                    required
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl pl-16 pr-6 py-5 text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:ring-4 focus:ring-[#39d353]/5 focus:border-[#39d353] transition-all text-lg font-medium"
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#484f58] group-focus-within/input:text-[#58a6ff] transition-colors">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                  </div>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Auth Token (Optional)"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl pl-16 pr-14 py-5 text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:ring-4 focus:ring-[#58a6ff]/5 focus:border-[#58a6ff] transition-all text-base font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowTokenInfo(!showTokenInfo)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#58a6ff] transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

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
                className="group relative w-full bg-[#238636] hover:bg-[#2ea043] text-white font-black py-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-3 text-xl tracking-tighter">
                  GENERATE WRAPPED
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5Z"></path>
                  </svg>
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-20 flex flex-col items-center gap-4 opacity-20 relative z-10">
          <div className="flex items-center gap-6">
            <span className="h-px w-8 bg-white"></span>
            <p className="text-[9px] font-mono uppercase tracking-[1em] text-white font-black">Secure_Core_Trace</p>
            <span className="h-px w-8 bg-white"></span>
          </div>
          <p className="text-[10px] font-mono font-medium max-w-xs leading-relaxed text-white">
            Powered by Google Gemini AI & GitHub Telemetry
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;