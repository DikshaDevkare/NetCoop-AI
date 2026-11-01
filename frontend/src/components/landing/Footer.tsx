import { Network, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#080B10]/95 pt-16 pb-12 px-4 sm:px-6 lg:px-12 z-10 text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A24] to-[#20D9FF] p-[1.5px]">
              <div className="w-full h-full bg-[#080B10] rounded-[10px] flex items-center justify-center">
                <Network className="w-4 h-4 text-[#FF8A24]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-[#F4F6FA]">
                NETCOOP <span className="text-[#FF8A24]">AI</span>
              </span>
              <span className="text-[10px] text-[#A2ACBA] font-mono block">
                AUTONOMOUS NETWORK DIAGNOSIS
              </span>
            </div>
          </div>

          <p className="text-xs text-[#A2ACBA] leading-relaxed max-w-sm">
            An advanced multi-agent AI system for network fault diagnosis, root cause
            analysis, infrastructure monitoring, and intelligent network recommendations
            using standardized telemetry.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#26D7A0]">
            <span className="w-2 h-2 rounded-full bg-[#26D7A0] animate-pulse" />
            <span>FASTAPI BACKEND READY // VITE 8 FRONTEND</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA]">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs text-[#A2ACBA]">
            {['hero', 'globe', 'features', 'agents', 'how-it-works', 'about'].map((id) => (
              <li key={id}>
                <button
                  onClick={() => {
                    onNavigate?.(id);
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#FF8A24] transition-colors cursor-pointer capitalize"
                >
                  {id.replace('-', ' ')}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 Specialized Agents Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA]">
            AI Agent Council
          </h4>
          <ul className="space-y-2 text-xs text-[#A2ACBA]">
            <li>Telemetry &amp; Performance</li>
            <li>Infrastructure Health</li>
            <li>Connectivity Analysis</li>
            <li>Fault Correlation Engine</li>
            <li>Recommendation &amp; Report</li>
          </ul>
        </div>

        {/* Stack & Specification Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA]">
            Technology Stack
          </h4>
          <ul className="space-y-2 text-xs text-[#A2ACBA] font-mono">
            <li>Three.js / React Three Fiber</li>
            <li>GSAP ScrollTrigger</li>
            <li>Framer Motion &amp; Tailwind CSS</li>
            <li>FastAPI / Python 3.11</li>
            <li>Isolation Forest &amp; XGBoost</li>
            <li>SQLAlchemy Persistence</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Back to Top */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#A2ACBA]/70">
        <div>
          &copy; 2026 NetCoop AI. Hackathon Project. All rights reserved.
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel hover:text-[#FF8A24] hover:border-[#FF8A24]/30 transition-all cursor-pointer"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}
