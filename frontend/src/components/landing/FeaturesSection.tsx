import { motion } from 'framer-motion';
import { PLATFORM_FEATURES } from '../../utils/mockTopology';
import {
  Radio,
  Server,
  Network,
  Share2,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Radio,
  Server,
  Network,
  Share2,
  ShieldAlert,
  Terminal,
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CAPABILITIES MATRIX // DEEP OBSERVABILITY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
          Engineered for Intermittent, Complex Network Anomalies
        </h2>

        <p className="text-base text-[#A2ACBA] leading-relaxed">
          From heterogeneous telemetry normalization to evidence-first multi-agent
          correlation, NetCoop AI delivers deterministic fault isolation and mitigation.
        </p>
      </div>

      {/* 6 Grid Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORM_FEATURES.map((feature, idx) => {
          const IconComponent = ICON_MAP[feature.icon] || Server;

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group glass-panel rounded-2xl p-7 border border-white/5 hover:border-[#FF8A24]/40 hover:shadow-2xl hover:shadow-[#FF8A24]/10 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Icon & Metric Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#141B25] border border-white/10 flex items-center justify-center text-[#FF8A24] group-hover:scale-110 group-hover:text-[#20D9FF] group-hover:border-[#20D9FF]/40 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#FFB45C]">
                    {feature.metricHighlight}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-bold text-[#F4F6FA] group-hover:text-[#FF8A24] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs font-mono text-[#20D9FF] mt-1 mb-3">
                  {feature.tagline}
                </p>

                {/* Description */}
                <p className="text-sm text-[#A2ACBA] leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Capabilities Checklist */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                {feature.capabilities.map((cap, cIdx) => (
                  <div
                    key={`cap-${cIdx}`}
                    className="flex items-center gap-2 text-xs text-[#F4F6FA]/80 font-mono"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#26D7A0] shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
