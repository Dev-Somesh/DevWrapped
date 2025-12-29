import React from 'react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const credits = [
    {
      category: "AI & Intelligence",
      items: [
        {
          name: "Google Gemini AI",
          description: "Powering intelligent insights and narrative generation",
          url: "https://ai.google.dev/",
          logo: "🤖",
          color: "#4285F4"
        }
      ]
    },
    {
      category: "Data & APIs",
      items: [
        {
          name: "GitHub API",
          description: "Comprehensive developer data and repository insights",
          url: "https://docs.github.com/en/rest",
          logo: "🐙",
          color: "#39d353"
        }
      ]
    },
    {
      category: "Infrastructure & Deployment",
      items: [
        {
          name: "Netlify",
          description: "Serverless functions and seamless deployment platform",
          url: "https://netlify.com",
          logo: "🌐",
          color: "#00C7B7"
        }
      ]
    },
    {
      category: "Frontend Technologies",
      items: [
        {
          name: "React",
          description: "Modern UI framework for interactive experiences",
          url: "https://react.dev",
          logo: "⚛️",
          color: "#61DAFB"
        },
        {
          name: "Tailwind CSS",
          description: "Utility-first CSS framework for rapid styling",
          url: "https://tailwindcss.com",
          logo: "🎨",
          color: "#06B6D4"
        },
        {
          name: "Vite",
          description: "Lightning-fast build tool and development server",
          url: "https://vitejs.dev",
          logo: "⚡",
          color: "#646CFF"
        }
      ]
    },
    {
      category: "Development Tools",
      items: [
        {
          name: "TypeScript",
          description: "Type-safe JavaScript for robust development",
          url: "https://typescriptlang.org",
          logo: "📘",
          color: "#3178C6"
        },
        {
          name: "html-to-image",
          description: "High-quality image export functionality",
          url: "https://github.com/bubkoo/html-to-image",
          logo: "📸",
          color: "#FF6B6B"
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d1117] border-b border-[#30363d] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-black text-white">Credits & Acknowledgments</h2>
            <p className="text-[#8b949e] text-sm mt-1">Gratitude to the technologies and services that make DevWrapped possible</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-white transition-colors p-2 hover:bg-[#21262d] rounded-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {credits.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-lg font-display font-bold text-[#f0f6fc] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#39d353] rounded-full"></span>
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#58a6ff]/50 hover:bg-[#0d1117] transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="text-2xl p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        {item.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono font-bold text-white group-hover:text-[#58a6ff] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#58a6ff] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Visit</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Special Thanks */}
          <div className="border-t border-[#30363d] pt-8">
            <h3 className="text-lg font-display font-bold text-[#f0f6fc] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#bc8cff] rounded-full"></span>
              Special Thanks
            </h3>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <p className="text-[#8b949e] leading-relaxed">
                DevWrapped 2025 exists because of the incredible open-source ecosystem and the generous APIs provided by these organizations. 
                Each technology contributes to creating a seamless, intelligent, and beautiful experience for developers worldwide.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#39d353]/10 text-[#39d353] rounded-full text-xs font-mono">Open Source</span>
                <span className="px-3 py-1 bg-[#58a6ff]/10 text-[#58a6ff] rounded-full text-xs font-mono">Developer First</span>
                <span className="px-3 py-1 bg-[#bc8cff]/10 text-[#bc8cff] rounded-full text-xs font-mono">Community Driven</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#30363d] p-6 text-center">
          <p className="text-[#484f58] text-xs font-mono">
            Built with ❤️ and gratitude • DevWrapped 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;