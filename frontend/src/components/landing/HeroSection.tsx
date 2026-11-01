import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck, Share2, Terminal, Layers } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onLaunchDiagnosisClick?: () => void;
}

export function HeroSection({
  onExploreClick,
  onLaunchDiagnosisClick,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Left Column: Hero Content */}
      <div className="w-full lg:w-7/12 space-y-8 text-left">
        {/* Architecture Protocol Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel border border-[#FF8A24]/30"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF8A24] animate-pulse" />
          <span className="text-xs font-mono font-medium text-[#FFB45C] tracking-wide">
            STANDARD DATA PROTOCOL v1.0 // 5-AGENT ARCHITECTURE
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F4F6FA] uppercase leading-none">
            INTELLIGENT NETWORKS.
            <br />
            <span className="bg-gradient-to-r from-[#FF8A24] via-[#FFB45C] to-[#20D9FF] bg-clip-text text-transparent">
              UNDERSTOOD.
            </span>{' '}
            <span className="text-[#F4F6FA]">REIMAGINED.</span>
          </h1>
        </motion.div>

        {/* Subtitle / Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-[#A2ACBA] font-normal leading-relaxed max-w-2xl"
        >
          An interoperable multi-agent AI platform that transforms distributed, noisy
          network telemetry into explainable fault diagnosis, root cause insights,
          and intelligent recovery recommendations.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-sm font-bold tracking-wide hover:shadow-lg hover:shadow-[#FF8A24]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchDiagnosisClick}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full glass-panel hover:bg-white/10 border border-white/10 text-sm font-semibold text-[#F4F6FA] hover:border-[#20D9FF]/40 hover:text-[#20D9FF] transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#20D9FF]" />
            <span>Simulate Diagnosis</span>
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF8A24]/10 border border-[#FF8A24]/20 flex items-center justify-center text-[#FF8A24]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F6FA]">Multi-Agent Core</div>
              <div className="text-[11px] text-[#A2ACBA]">5 Domain Specialists</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#20D9FF]/10 border border-[#20D9FF]/20 flex items-center justify-center text-[#20D9FF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F6FA]">Evidence-Based</div>
              <div className="text-[11px] text-[#A2ACBA]">Empirical Verification</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#26D7A0]/10 border border-[#26D7A0]/20 flex items-center justify-center text-[#26D7A0]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F6FA]">Dual ML Engines</div>
              <div className="text-[11px] text-[#A2ACBA]">IsoForest + XGBoost</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Transparent viewport area framing the 3D robot */}
      <div className="hidden lg:flex w-5/12 h-[600px] items-center justify-center relative pointer-events-none">
        {/* Soft Ambient Radial Glow Behind Robot */}
        <div className="absolute w-80 h-80 rounded-full bg-[#FF8A24]/15 blur-3xl pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-[#20D9FF]/10 blur-3xl translate-x-12 translate-y-12 pointer-events-none" />

        {/* Small Floating Telemetry HUD Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute -top-4 right-2 glass-panel p-3 rounded-xl border border-white/10 shadow-xl pointer-events-auto max-w-[210px]"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A2ACBA] mb-1">
            <span>CORE INGRESS</span>
            <span className="text-[#26D7A0]">99.8% OK</span>
          </div>
          <div className="text-xs font-bold text-[#F4F6FA]">18 Telemetry Feeds</div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#FF8A24] h-full w-[88%]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute bottom-8 left-2 glass-panel p-3 rounded-xl border border-[#20D9FF]/20 shadow-xl pointer-events-auto max-w-[220px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-3.5 h-3.5 text-[#20D9FF]" />
            <span className="text-[11px] font-mono text-[#20D9FF]">ANOMALY DETECTOR</span>
          </div>
          <div className="text-xs font-medium text-[#F4F6FA]">
            Baseline Isolation Forest active
          </div>
        </motion.div>
      </div>
    </section>
  );
}
