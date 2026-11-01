import { Compass, GitMerge, FileCode } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="relative py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Problem & Motivation */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>ORIGIN &amp; MOTIVATION // THE TELEMETRY CHALLENGE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
            Bridging Heterogeneous Telemetry and Deterministic Reasoning
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-[#A2ACBA] leading-relaxed">
            <p>
              In large campus and enterprise networks, telemetry is inherently
              distributed, inconsistent, and noisy. Network equipment from different
              vendors uses varying naming conventions, incompatible metric units, and
              sparse sampling intervals.
            </p>
            <p>
              When intermittent degradation strikes, operations teams are overwhelmed
              by cascading alarms—where a single saturated core link triggers symptom
              reports across dozens of downstream access switches and wireless points.
            </p>
            <p className="text-[#F4F6FA]">
              <strong>NetCoop AI</strong> was engineered to solve this through the
              <strong> Interoperability Standard Data Protocol (v1.0)</strong> and a
              collaborative council of specialized agents that resolve conflicts
              through empirical physical evidence rather than blind heuristics.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24]">
                <FileCode className="w-4 h-4" />
                <span>INTEROPERABILITY FIRST</span>
              </div>
              <p className="text-xs text-[#A2ACBA]">
                Unifies heterogeneous vendor fields into canonical schemas with UTC
                timestamps and metric bounds.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#20D9FF]">
                <GitMerge className="w-4 h-4" />
                <span>EVIDENCE-LINKED ACTIONS</span>
              </div>
              <p className="text-xs text-[#A2ACBA]">
                Every single corrective recommendation links explicitly to empirical
                supporting evidence IDs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Architecture Blueprint Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#FF8A24]" />
                <span className="text-xs font-mono font-bold text-[#F4F6FA]">
                  NETCOOP PLATFORM SPECIFICATION
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#26D7A0] px-2 py-0.5 rounded bg-[#26D7A0]/10 border border-[#26D7A0]/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#A2ACBA]">Architecture:</span>
                <span className="text-[#F4F6FA]">5-Agent Collaborative Reasoning</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#A2ACBA]">Unsupervised Outlier:</span>
                <span className="text-[#FF8A24]">Isolation Forest (18 Features)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#A2ACBA]">Root-Cause Classifier:</span>
                <span className="text-[#20D9FF]">XGBoost 7-Class Ensemble</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#A2ACBA]">Temporal Trajectories:</span>
                <span className="text-[#FFB45C]">Deterministic ROC Gradients</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#A2ACBA]">Topology Scoping:</span>
                <span className="text-[#F4F6FA]">Local / Segment / Shared Core</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#A2ACBA]">Persistence:</span>
                <span className="text-[#26D7A0]">SQLAlchemy 8-Entity Store</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-[#A2ACBA]">
              Developed for the NetCoop AI Hackathon. Fully compliant with Protocol v1.0 specifications.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
