import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FIVE_AGENTS } from '../../utils/mockTopology';
import type { AgentInfo } from '../../types';
import {
  Activity,
  Cpu,
  Wifi,
  GitMerge,
  FileCheck,
  Check,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

const AGENT_ICON_MAP: Record<string, any> = {
  Activity,
  Cpu,
  Wifi,
  GitMerge,
  FileCheck,
};

interface FiveAgentsSectionProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  selectedAgentId?: string;
}

export function FiveAgentsSection({
  onSelectAgent,
  selectedAgentId = 'telemetry-performance',
}: FiveAgentsSectionProps) {
  const [activeId, setActiveId] = useState<string>(selectedAgentId);

  const activeAgent =
    FIVE_AGENTS.find((a) => a.id === activeId) || FIVE_AGENTS[0];

  const handleSelect = (agent: AgentInfo) => {
    setActiveId(agent.id);
    onSelectAgent?.(agent);
  };

  return (
    <section id="agents" className="relative py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20D9FF]/10 border border-[#20D9FF]/30 text-[#20D9FF] text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>MULTI-AGENT INTELLIGENCE // 5 SPECIALIZED DOMAIN CORES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
          Autonomous Collaborative Reasoning
        </h2>

        <p className="text-base text-[#A2ACBA] leading-relaxed">
          Rather than relying on a monolithic black-box model, NetCoop AI coordinates
          five domain-specialized agents. Each audits specific telemetry dimensions,
          emitting structured findings that merge in the central Fault Correlation Engine.
        </p>
      </div>

      {/* Agent Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        {FIVE_AGENTS.map((agent) => {
          const Icon = AGENT_ICON_MAP[agent.iconName] || Activity;
          const isSelected = agent.id === activeId;

          return (
            <button
              key={agent.id}
              onClick={() => handleSelect(agent)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] font-bold shadow-lg shadow-[#FF8A24]/20 scale-105'
                  : 'glass-panel text-[#A2ACBA] hover:text-[#F4F6FA] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{agent.name.split(' ')[0]} Agent</span>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Deep-Dive Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Agent Dossier Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAgent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Accent Glow Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${activeAgent.accentColor}, transparent)`,
                }}
              />

              {/* Agent Title & Codename */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${activeAgent.accentColor}20`,
                        color: activeAgent.accentColor,
                        border: `1px solid ${activeAgent.accentColor}40`,
                      }}
                    >
                      {activeAgent.codename}
                    </span>
                    <span className="text-xs text-[#26D7A0] font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
                      STANDARDIZED V1.0
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F4F6FA]">
                    {activeAgent.name}
                  </h3>
                  <p className="text-xs font-mono text-[#20D9FF] mt-1">
                    {activeAgent.role}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#A2ACBA] leading-relaxed">
                {activeAgent.description}
              </p>

              {/* Diagnostic Capability */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[11px] font-mono text-[#FF8A24] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DIAGNOSTIC SPECIALIZATION</span>
                </div>
                <p className="text-xs text-[#F4F6FA] font-medium">
                  {activeAgent.diagnosticCapability}
                </p>
              </div>

              {/* Monitored Metrics Tags */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#A2ACBA] block">
                  STANDARDIZED TELEMETRY AUDITED:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeAgent.monitoredMetrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-[#F4F6FA]/80 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-[#26D7A0]" />
                      <code>{metric}</code>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: 3D Visual Core Metaphor Explainer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24]">
              <Shield className="w-4 h-4" />
              <span>3D INTELLIGENCE CORE VISUALIZATION</span>
            </div>
            <p className="text-xs text-[#A2ACBA] leading-relaxed">
              In the 3D space above, each agent is embodied by an interactive spatial
              core orbiting the central consensus engine. Notice how the light trails
              pulse continuously, streaming structured diagnostic envelopes across the
              system bus.
            </p>

            <div className="pt-2 border-t border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#A2ACBA]">
                <span>Telemetry Ingress:</span>
                <span className="text-[#FF8A24]">Pulsating Signal Core</span>
              </div>
              <div className="flex justify-between text-[#A2ACBA]">
                <span>Hardware State:</span>
                <span className="text-[#FFB45C]">Mechanical Server Cage</span>
              </div>
              <div className="flex justify-between text-[#A2ACBA]">
                <span>Service Reachability:</span>
                <span className="text-[#20D9FF]">Interconnected Dodecahedron</span>
              </div>
              <div className="flex justify-between text-[#A2ACBA]">
                <span>Consensus Engine:</span>
                <span className="text-[#FF4D5A]">Central Merging Hyper-Torus</span>
              </div>
              <div className="flex justify-between text-[#A2ACBA]">
                <span>Mitigation Runbooks:</span>
                <span className="text-[#26D7A0]">Holographic Diamond Prism</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
