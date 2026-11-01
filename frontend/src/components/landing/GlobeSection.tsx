import { useState } from 'react';
import type { NetworkNode } from '../../types';
import { CAMPUS_NODES } from '../../utils/mockTopology';
import { Rotate3d, Info } from 'lucide-react';

interface GlobeSectionProps {
  onSelectNode?: (node: NetworkNode) => void;
  selectedNode?: NetworkNode | null;
}

export function GlobeSection({ onSelectNode, selectedNode }: GlobeSectionProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = CAMPUS_NODES.filter((n) =>
    filterType === 'all' ? true : n.type === filterType
  );

  return (
    <section id="globe" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10 flex flex-col justify-between">
      {/* Section Header */}
      <div className="max-w-2xl text-left space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20D9FF]/10 border border-[#20D9FF]/30 text-[#20D9FF] text-xs font-mono">
          <Rotate3d className="w-3.5 h-3.5" />
          <span>INTERACTIVE TOPOLOGY MESH // 3D SPATIAL GRAPH</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
          Autonomous Campus Network Fabric
        </h2>

        <p className="text-sm sm:text-base text-[#A2ACBA] leading-relaxed">
          Explore distributed campus network hardware in full 3D. Click or hover any
          infrastructure node to inspect real-time standardized telemetry feeds, queue
          drops, interface error counters, and diagnostic health classifications.
        </p>

        {/* Device Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All Hardware' },
            { id: 'router', label: 'Routers' },
            { id: 'switch', label: 'Switches' },
            { id: 'access_point', label: 'Access Points' },
            { id: 'server', label: 'IPAM / Core' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                filterType === btn.id
                  ? 'bg-[#FF8A24] text-[#080B10] font-bold shadow-md shadow-[#FF8A24]/30'
                  : 'glass-panel text-[#A2ACBA] hover:text-[#F4F6FA]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Instructions & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#20D9FF]">
            <Info className="w-4 h-4" />
            <span>INTERACTION GUIDE</span>
          </div>
          <p className="text-xs text-[#A2ACBA]">
            <strong className="text-[#F4F6FA]">Click &amp; Drag:</strong> Orbit network globe in 3D space.<br />
            <strong className="text-[#F4F6FA]">Click Any Node:</strong> Inspect live telemetry &amp; interface counters.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span>NODE HEALTH AUDIT</span>
            <span className="text-[#26D7A0]">88.9% NOMINAL</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono pt-1">
            <span className="flex items-center gap-1.5 text-[#26D7A0]">
              <span className="w-2 h-2 rounded-full bg-[#26D7A0]" />
              7 Healthy
            </span>
            <span className="flex items-center gap-1.5 text-[#FFB547]">
              <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
              1 Warning
            </span>
            <span className="flex items-center gap-1.5 text-[#FF4D5A]">
              <span className="w-2 h-2 rounded-full bg-[#FF4D5A]" />
              1 Critical
            </span>
          </div>
        </div>

        {/* Selected Node Quick Peek */}
        <div className="glass-panel p-4 rounded-2xl border border-[#FF8A24]/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#FF8A24]">ACTIVE INSPECTION</span>
            <span className="text-[#F4F6FA] font-bold">{selectedNode?.id || filteredNodes[0]?.id || 'AP-DORM-01'}</span>
          </div>
          <div className="text-xs text-[#A2ACBA]">
            {selectedNode ? (
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span>Loss: {selectedNode.metrics.packetLossPct}%</span>
                <span>Latency: {selectedNode.metrics.latencyMs}ms</span>
                <span className={selectedNode.status === 'critical' ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'}>
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>
            ) : (
              <button
                onClick={() => onSelectNode?.(filteredNodes[0])}
                className="text-[11px] font-mono text-[#20D9FF] hover:underline cursor-pointer"
              >
                Inspect {filteredNodes[0]?.name || 'Target Node'} ❯
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
