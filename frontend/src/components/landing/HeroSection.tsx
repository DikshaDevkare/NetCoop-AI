import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Share2,
  Play,
  Layers,
  Server,
  Clock,
  Radio,
} from 'lucide-react';
import { HeroRobotCanvas } from '../../scenes3d/HeroRobotCanvas';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onLaunchDiagnosisClick?: () => void;
}

export function HeroSection({
  onExploreClick,
  onLaunchDiagnosisClick,
}: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto z-10"
    >
      {/* --- UPPER 3-ZONE COMPOSITION: LEFT TEXT + CENTER 3D ROBOT & GLOBE + RIGHT CARDS --- */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 my-auto w-full">
        {/* ================= ZONE 1: LEFT COLUMN (TEXT & CTAs) ================= */}
        <div className="w-full lg:w-[38%] space-y-6 text-left">
          {/* Architecture Protocol Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel border border-[#FF8A24]/30"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF8A24] animate-pulse" />
            <span className="text-xs font-mono font-medium text-[#FFB45C] tracking-wide">
              MULTI-AGENT INTELLIGENCE PLATFORM // v1.0
            </span>
          </motion.div>

          {/* Main Reference Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#F4F6FA] uppercase leading-[1.08]">
              Intelligent Network
              <br />
              <span className="bg-gradient-to-r from-[#FF8A24] via-[#FFB45C] to-[#20D9FF] bg-clip-text text-transparent">
                Diagnosis &amp; Recovery
              </span>
            </h1>
          </motion.div>

          {/* Supporting Copy matching reference */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#A2ACBA] font-normal leading-relaxed max-w-lg"
          >
            An interoperable multi-agent AI platform that analyzes network telemetry,
            identifies probable faults, correlates evidence and recommends corrective actions.
          </motion.p>

          {/* Action CTAs: Launch Diagnosis & Live Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              onClick={() => {
                if (onLaunchDiagnosisClick) onLaunchDiagnosisClick();
                else navigate('/dashboard/diagnosis');
              }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-sm font-bold tracking-wide hover:shadow-xl hover:shadow-[#FF8A24]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-[#080B10]" />
              <span>Launch Diagnosis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/dashboard');
                }
              }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full glass-panel hover:bg-white/10 border border-white/10 text-sm font-semibold text-[#F4F6FA] hover:border-[#20D9FF]/40 hover:text-[#20D9FF] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#20D9FF]" />
              <span>Explore Platform</span>
            </button>
          </motion.div>
        </div>

        {/* ================= ZONE 2: CENTER COLUMN (3D ROBOT & HOLOGRAPHIC GLOBE) ================= */}
        <div className="w-full lg:w-[34%] flex items-center justify-center relative my-4 lg:my-0">
          <HeroRobotCanvas />
        </div>

        {/* ================= ZONE 3: RIGHT COLUMN (4 COMPACT FEATURE PANELS) ================= */}
        <div className="w-full lg:w-[28%] space-y-3 pointer-events-auto">
          {/* Panel 1: Real-time Telemetry Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#20D9FF]/30 shadow-xl flex items-start gap-3.5 hover:border-[#20D9FF]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#20D9FF]/15 border border-[#20D9FF]/40 flex items-center justify-center text-[#20D9FF] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F4F6FA] flex items-center gap-2">
                <span>Real-time Analysis</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#20D9FF]/10 text-[#20D9FF]">STREAM</span>
              </div>
              <p className="text-[11px] text-[#A2ACBA] mt-0.5 leading-snug">
                Sub-second telemetry ingestion and rolling window anomaly detection.
              </p>
            </div>
          </motion.div>

          {/* Panel 2: Multi-Agent AI */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#FF8A24]/30 shadow-xl flex items-start gap-3.5 hover:border-[#FF8A24]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF8A24]/15 border border-[#FF8A24]/40 flex items-center justify-center text-[#FF8A24] shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F4F6FA] flex items-center gap-2">
                <span>Multi-Agent AI</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FF8A24]/10 text-[#FF8A24]">5 CORES</span>
              </div>
              <p className="text-[11px] text-[#A2ACBA] mt-0.5 leading-snug">
                Distributed reasoning council eliminating monolithic single-model blindspots.
              </p>
            </div>
          </motion.div>

          {/* Panel 3: Root Cause Discovery */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#A855F7]/30 shadow-xl flex items-start gap-3.5 hover:border-[#A855F7]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/40 flex items-center justify-center text-[#A855F7] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F4F6FA] flex items-center gap-2">
                <span>Root Cause Discovery</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#A855F7]/10 text-[#A855F7]">BAYESIAN</span>
              </div>
              <p className="text-[11px] text-[#A2ACBA] mt-0.5 leading-snug">
                Empirical physical evidence weighting and cross-device topology correlation.
              </p>
            </div>
          </motion.div>

          {/* Panel 4: Automated Recovery */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#26D7A0]/30 shadow-xl flex items-start gap-3.5 hover:border-[#26D7A0]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#26D7A0]/15 border border-[#26D7A0]/40 flex items-center justify-center text-[#26D7A0] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#F4F6FA] flex items-center gap-2">
                <span>Automated Recovery</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#26D7A0]/10 text-[#26D7A0]">CLI PLAN</span>
              </div>
              <p className="text-[11px] text-[#A2ACBA] mt-0.5 leading-snug">
                Deterministic Cisco and Arista configuration scripts with zero hallucination.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- LOWER COMPOSITION: DEDICATED HORIZONTAL METRICS STRIP --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="mt-8 w-full glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch justify-between gap-4 text-left"
      >
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 px-3 py-1 border-r border-white/5">
            <div className="w-9 h-9 rounded-xl bg-[#FF8A24]/10 border border-[#FF8A24]/20 flex items-center justify-center text-[#FF8A24]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-[#F4F6FA]">5 AI Agents</div>
              <div className="text-[11px] font-mono text-[#A2ACBA]">Consensus Council Core</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-1 border-r border-white/5">
            <div className="w-9 h-9 rounded-xl bg-[#20D9FF]/10 border border-[#20D9FF]/20 flex items-center justify-center text-[#20D9FF]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-[#F4F6FA]">128 Devices</div>
              <div className="text-[11px] font-mono text-[#A2ACBA]">Campus Monitored Nodes</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-1 border-r border-white/5">
            <div className="w-9 h-9 rounded-xl bg-[#26D7A0]/10 border border-[#26D7A0]/20 flex items-center justify-center text-[#26D7A0]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-[#26D7A0]">94.2% Health</div>
              <div className="text-[11px] font-mono text-[#A2ACBA]">Operational Nominal</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#FFB45C]/10 border border-[#FFB45C]/20 flex items-center justify-center text-[#FFB45C]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-[#F4F6FA]">&lt; 120 ms</div>
              <div className="text-[11px] font-mono text-[#A2ACBA]">Average Core Latency</div>
            </div>
          </div>
        </div>

        {/* Small Demonstration Notice Tag */}
        <div className="hidden lg:flex items-center px-4 py-1 border-l border-white/10 text-[10px] font-mono text-[#A2ACBA] shrink-0">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#FF8A24] animate-pulse" />
            Demo Telemetry
          </span>
        </div>
      </motion.div>
    </section>
  );
}
