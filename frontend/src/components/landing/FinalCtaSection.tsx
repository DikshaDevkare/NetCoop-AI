import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export function FinalCtaSection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-8 sm:p-14 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#FF8A24]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#20D9FF]/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START EXPERIENCING AUTONOMOUS DIAGNOSTICS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F6FA] uppercase leading-tight">
            Ready to Transform Your Network Operations?
          </h2>

          <p className="text-sm sm:text-base text-[#A2ACBA] leading-relaxed max-w-2xl mx-auto">
            Deploy autonomous multi-agent root cause analysis, eliminate cascading symptom
            alerts, and generate deterministic CLI remediation scripts in seconds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard/diagnosis')}
              className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-sm font-bold tracking-wide hover:shadow-xl hover:shadow-[#FF8A24]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Launch Live Diagnosis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 px-7 py-4 rounded-full glass-panel hover:bg-white/10 border border-white/10 text-sm font-semibold text-[#F4F6FA] hover:border-[#20D9FF]/40 hover:text-[#20D9FF] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#20D9FF]" />
              <span>Open Command Center</span>
            </button>
          </div>

          {/* Compliance & Readiness Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-white/5 text-xs font-mono text-[#A2ACBA]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#26D7A0]" />
              RFC 3339 Protocol Validated
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FF8A24]" />
              5-Agent Distributed Council
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#26D7A0] animate-pulse" />
              FastAPI Integration Ready
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
