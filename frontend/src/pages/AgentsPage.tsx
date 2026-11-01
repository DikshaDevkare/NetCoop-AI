import { useState } from 'react';
import { FIVE_AGENTS } from '../utils/mockTopology';
import { FiveAgentsOrbital3D } from '../scenes3d/FiveAgentsOrbital3D';
import type { AgentInfo } from '../types';
import {
  Share2,
  Activity,
  Cpu,
  Wifi,
  GitMerge,
  FileCheck,
  CheckCircle,
  Layers,
  Sparkles,
  MessageSquare,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Activity,
  Cpu,
  Wifi,
  GitMerge,
  FileCheck,
};

// Simulated inter-agent consensus message log for the selected agent
const AGENT_MESSAGES: Record<string, Array<{ from: string; to: string; type: string; message: string; time: string }>> = {
  'telemetry-agent': [
    { from: 'TelemetryAgent', to: 'FaultCorrelationAgent', type: 'FINDING', message: 'CRITICAL: Port Gi0/1 on SW-DIST-01 experiencing 8.4% packet drop rate above 2% threshold.', time: '10:42:01' },
    { from: 'TelemetryAgent', to: 'FaultCorrelationAgent', type: 'METRIC', message: 'Traffic ingress at 920 Mbps sustained on trunk Gi0/24.', time: '10:42:04' },
    { from: 'TelemetryAgent', to: 'InfrastructureAgent', type: 'QUERY', message: 'Requesting ASIC buffer utilization and queue drops for SW-DIST-01.', time: '10:42:05' },
  ],
  'infra-agent': [
    { from: 'InfrastructureAgent', to: 'FaultCorrelationAgent', type: 'FINDING', message: 'SW-DIST-01 CPU utilization reached 98% with process memory leak on lldp_worker.', time: '10:42:03' },
    { from: 'InfrastructureAgent', to: 'TelemetryAgent', type: 'CONFIRM', message: 'Confirmed output buffer exhaustion on Gi0/1 queue 3 (tail drops = 14,208).', time: '10:42:06' },
  ],
  'connectivity-agent': [
    { from: 'ConnectivityAgent', to: 'FaultCorrelationAgent', type: 'FINDING', message: 'DNS queries to SRV-DNS-01 latency spiked to 210ms due to downstream switch buffer delay.', time: '10:42:04' },
    { from: 'ConnectivityAgent', to: 'FaultCorrelationAgent', type: 'VERIFY', message: 'Gateway reachability 10.0.0.1 intact (ICMP RTT 2.1ms). L3 routing intact.', time: '10:42:07' },
  ],
  'correlation-agent': [
    { from: 'FaultCorrelationAgent', to: 'AllAgents', type: 'CORRELATION', message: 'Aggregated findings: SW-DIST-01 CPU saturation + queue drop confirms buffer exhaustion / congestion event.', time: '10:42:08' },
    { from: 'FaultCorrelationAgent', to: 'RecommendationAgent', type: 'HYPOTHESIS', message: 'Primary Root Cause: Hardware buffer congestion on SW-DIST-01 (Confidence: 94.2%).', time: '10:42:09' },
  ],
  'recommendation-agent': [
    { from: 'RecommendationAgent', to: 'Orchestrator', type: 'ACTION_PLAN', message: 'Generated 3-stage remediation: apply QoS queue map, bounce port Gi0/1, rebalance trunk vlan.', time: '10:42:11' },
    { from: 'RecommendationAgent', to: 'NOC_Operator', type: 'REPORT', message: 'Full incident diagnostic report compiled and signed under Protocol v1.0.', time: '10:42:12' },
  ],
};

export function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo>(FIVE_AGENTS[0]);

  const IconComponent = ICON_MAP[selectedAgent.iconName] || Activity;
  const messages = AGENT_MESSAGES[selectedAgent.id] || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24] mb-1">
            <Share2 className="w-4 h-4" />
            <span>AUTONOMOUS AGENT COUNCIL // DISTRIBUTED REASONING</span>
          </div>
          <h2 className="text-2xl font-black text-[#F4F6FA]">
            Multi-Agent AI Engine
          </h2>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Five specialized AI agents working together for accurate network diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30 text-xs font-mono text-[#26D7A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            5-Agent Consensus Core Active
          </span>
        </div>
      </div>

      {/* 3D Circular Council Visualization */}
      <div className="relative">
        <FiveAgentsOrbital3D
          selectedAgentId={selectedAgent.id}
          onSelectAgent={(agentId) => {
            const found = FIVE_AGENTS.find((a) => a.id === agentId);
            if (found) setSelectedAgent(found);
          }}
        />
      </div>

      {/* 5-Agent Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {FIVE_AGENTS.map((agent) => {
          const Icon = ICON_MAP[agent.iconName] || Activity;
          const isSelected = selectedAgent.id === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? 'glass-panel-glow border-[#FF8A24]/60 shadow-lg shadow-[#FF8A24]/10 scale-[1.02]'
                  : 'glass-panel border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: `${agent.accentColor}20`,
                    color: agent.accentColor,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#26D7A0] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#26D7A0]" />
                  ACTIVE
                </span>
              </div>

              <div className="text-xs font-bold text-[#F4F6FA] truncate">
                {agent.name.split(' ')[0]} Agent
              </div>
              <div className="text-[10px] font-mono text-[#A2ACBA] mt-0.5">
                {agent.codename}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent In-Depth Dossier Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${selectedAgent.accentColor}, transparent)`,
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${selectedAgent.accentColor}20`,
                border: `1px solid ${selectedAgent.accentColor}40`,
                color: selectedAgent.accentColor,
              }}
            >
              <IconComponent className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${selectedAgent.accentColor}20`,
                    color: selectedAgent.accentColor,
                  }}
                >
                  {selectedAgent.codename}
                </span>
                <span className="text-xs font-mono text-[#20D9FF]">
                  Protocol v1.0
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#F4F6FA]">
                {selectedAgent.name}
              </h3>
              <p className="text-xs font-mono text-[#A2ACBA]">
                {selectedAgent.role}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#A2ACBA] leading-relaxed max-w-3xl">
          {selectedAgent.description}
        </p>

        {/* Diagnostic Specialization */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIAGNOSTIC REASONING CAPABILITY</span>
          </div>
          <p className="text-xs text-[#F4F6FA] font-medium leading-relaxed">
            {selectedAgent.diagnosticCapability}
          </p>
        </div>

        {/* Monitored Metrics Tags */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#A2ACBA] uppercase">
            Audited Telemetry Metrics:
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedAgent.monitoredMetrics.map((metric) => (
              <span
                key={metric}
                className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-[#F4F6FA] flex items-center gap-2"
              >
                <CheckCircle className="w-3 h-3 text-[#26D7A0]" />
                <code>{metric}</code>
              </span>
            ))}
          </div>
        </div>

        {/* Inter-Agent Communication / Consensus Stream */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#F4F6FA] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF8A24]" />
              Agent Consensus Exchange &amp; Evidence Stream:
            </span>
            <span className="text-[10px] font-mono text-[#26D7A0] flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Real-time Ingress
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#A2ACBA]">{msg.time}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{
                      backgroundColor: `${selectedAgent.accentColor}20`,
                      color: selectedAgent.accentColor,
                    }}
                  >
                    {msg.type}
                  </span>
                  <span className="text-[#F4F6FA] font-bold">{msg.from} &rarr; {msg.to}:</span>
                </div>
                <div className="text-[#A2ACBA] text-xs flex-1 sm:text-right">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Agent Collaboration Architecture Flow */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#20D9FF]">
          <Layers className="w-4 h-4" />
          <span>COLLABORATIVE CONSENSUS &amp; CONFLICT RESOLUTION WORKFLOW</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[#20D9FF] font-bold block">1. Telemetry Ingress</span>
            <span className="text-[#A2ACBA]">Ingests &amp; normalizes RFC 3339 metrics</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[#FF8A24] font-bold block">2. Infra Health</span>
            <span className="text-[#A2ACBA]">Audits CPU, RAM, thermals &amp; CRC drops</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[#4A8DFF] font-bold block">3. Connectivity</span>
            <span className="text-[#A2ACBA]">Audits DNS, gateway loss &amp; Wi-Fi RSSI</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[#A855F7] font-bold block">4. Fault Correlation</span>
            <span className="text-[#A2ACBA]">Prioritizes empirical physical evidence</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[#26D7A0] font-bold block">5. Recommendations</span>
            <span className="text-[#A2ACBA]">Builds evidence-linked CLI action plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
