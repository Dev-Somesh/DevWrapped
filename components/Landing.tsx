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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onConnect(username.trim(), token.trim() || undefined);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* Branding - Top Left Corner */}
      <div className="fixed top-12 left-12 z-50 hidden md:block select-none">
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.8em] font-black">
          Dev-Somesh
        </span>
      </div>

      {/* Decorative Previews */}
      <FeaturePreview 
        title="Identity" 
        label="Trace_01" 
        accentColor="bg-[#39d353]"
        delay="0s"
        className="top-24 left-24 w-64"
        content={
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded"></div>
            <div className="h-2 w-3/4 bg-white/5 rounded"></div>
            <div className="text-[10px] font-mono text-[#39d353] mt-2">ARCHETYPE: ARCHITECT</div>
          </div>
        }
      />

      <FeaturePreview 
        title="Momentum" 
        label="Trace_02" 
        accentColor="bg-[#58a6ff]"
        delay="-2s"
        className="bottom-24 right-24 w-72"
        content={
          <div className="flex items-end gap-1 h-12">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-[#58a6ff]/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        }
      />

      {/* Top Branding Nav */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center pointer-events-none z-50">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center shadow-2xl">
            <svg height="18" viewBox="0 0 16 16" width="18" fill="white">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-xs tracking-tighter uppercase">Dev-Wrapped</span>
            <span className="text-[#39d353] font-mono text-[7px] tracking-[0.4em] opacity-60">MMXXV</span>
          </div>
        </div>
      </nav>

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
          <p className="text-[#8b949e] text-lg md:text-xl font-light italic max-w-lg mx-auto leading-relaxed opacity-70 mt-8">
            Relive your 2025 coding milestones through a cinematic lens.
          </p>
        </div>

        <div className="w-full max-w-md relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#39d353]/20 to-[#58a6ff]/20 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
          
          <div className="relative bg-[#161b22]/80 backdrop-blur-3xl border border-[#30363d] p-8 md:p-10 rounded-[3rem] shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-mono text-[#484f58] uppercase tracking-[0.3em] ml-4 font-black">Initialization Profile</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GitHub Username"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl pl-6 pr-6 py-5 text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:ring-4 focus:ring-[#39d353]/5 focus:border-[#39d353] transition-all text-lg font-medium"
                />
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Auth Token (Optional)"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl pl-6 pr-6 py-5 text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:ring-4 focus:ring-[#58a6ff]/5 focus:border-[#58a6ff] transition-all text-base font-medium"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-xs animate-shake flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                     <span className="font-black text-lg">!</span>
                     <p className="font-medium text-left">{error}</p>
                   </div>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full bg-[#238636] hover:bg-[#2ea043] text-white font-black py-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] overflow-hidden"
              >
                <span className="relative flex items-center justify-center gap-3 text-xl tracking-tighter">
                  GENERATE WRAPPED
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;