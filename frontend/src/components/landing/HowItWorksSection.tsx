import { motion } from 'framer-motion';
import { WORKFLOW_STEPS } from '../../utils/mockTopology';
import { ArrowDown, GitBranch } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono">
          <GitBranch className="w-3.5 h-3.5" />
          <span>DIAGNOSTIC PIPELINE // STEP-BY-STEP REASONING</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
          From Dirty Telemetry to Evidence-Linked Remediation
        </h2>

        <p className="text-base text-[#A2ACBA] leading-relaxed">
          See how multi-vendor campus telemetry flows through normalization,
          dual-model ML inference, 5-agent parallel evaluation, and deterministic
          correlation.
        </p>
      </div>

      {/* 6 Connected Workflow Steps */}
      <div className="space-y-6 relative max-w-4xl mx-auto">
        {WORKFLOW_STEPS.map((step, idx) => (
          <motion.div
            key={`step-${step.stepNumber}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="group glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 hover:border-[#FF8A24]/40 hover:shadow-xl transition-all relative"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {/* Step Circle Indicator */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8A24] to-[#FFB45C] text-[#080B10] flex items-center justify-center font-black text-sm shadow-md shadow-[#FF8A24]/20 group-hover:scale-110 transition-transform">
                  0{step.stepNumber}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F4F6FA] group-hover:text-[#FF8A24] transition-colors">
                    {step.title}
                  </h3>
                  <span className="text-xs font-mono text-[#20D9FF]">
                    {step.subtitle}
                  </span>
                </div>
              </div>

              {step.agentInvolved && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#FFB45C]">
                  {step.agentInvolved}
                </div>
              )}
            </div>

            <p className="text-sm text-[#A2ACBA] leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Input / Output Data Envelope Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-[#A2ACBA] tracking-wider block">
                  Input Stream:
                </span>
                <span className="text-[#F4F6FA]/90">{step.input}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#20D9FF]/5 border border-[#20D9FF]/20 space-y-1">
                <span className="text-[10px] uppercase text-[#20D9FF] tracking-wider block">
                  Output Synthesis:
                </span>
                <span className="text-[#20D9FF]">{step.output}</span>
              </div>
            </div>

            {/* Downward Connector Arrow between steps */}
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className="hidden sm:flex justify-center -mb-10 mt-4 relative z-20">
                <div className="w-8 h-8 rounded-full bg-[#10151D] border border-white/10 flex items-center justify-center text-[#A2ACBA]">
                  <ArrowDown className="w-4 h-4 text-[#FF8A24]" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
