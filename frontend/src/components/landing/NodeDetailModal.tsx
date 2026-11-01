import type { NetworkNode } from '../../types';
import { X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeDetailModalProps {
  node: NetworkNode | null;
  onClose: () => void;
}

export function NodeDetailModal({ node, onClose }: NodeDetailModalProps) {
  if (!node) return null;

  let statusBg = 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30';
  if (node.status === 'warning') {
    statusBg = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
  } else if (node.status === 'critical') {
    statusBg = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 z-10 text-left"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusBg}`}>
                  {node.status.toUpperCase()}
                </span>
                <span className="text-xs font-mono uppercase text-[#A2ACBA]">
                  {node.type}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#F4F6FA]">
                {node.id}
              </h3>
              <p className="text-xs text-[#A2ACBA] font-medium">
                {node.name}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full glass-panel hover:bg-white/10 text-[#A2ACBA] hover:text-[#F4F6FA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Device Identifiers */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/50 border border-white/5 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#A2ACBA] block">IP ADDRESS</span>
              <span className="text-[#20D9FF] font-semibold">{node.ip}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A2ACBA] block">MAC ADDRESS</span>
              <span className="text-[#F4F6FA]/80">{node.mac}</span>
            </div>
          </div>

          {/* Real-time Telemetry Metrics Grid */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#A2ACBA] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span>CURRENT TELEMETRY SNAPSHOT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono text-[#A2ACBA]">LATENCY</div>
                <div className="text-base font-bold text-[#F4F6FA]">
                  {node.metrics.latencyMs} <span className="text-xs font-normal text-[#A2ACBA]">ms</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono text-[#A2ACBA]">PACKET LOSS</div>
                <div className={`text-base font-bold ${node.metrics.packetLossPct > 1 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'}`}>
                  {node.metrics.packetLossPct} <span className="text-xs font-normal text-[#A2ACBA]">%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono text-[#A2ACBA]">CPU USAGE</div>
                <div className={`text-base font-bold ${node.metrics.cpuUsagePct > 70 ? 'text-[#FFB547]' : 'text-[#F4F6FA]'}`}>
                  {node.metrics.cpuUsagePct} <span className="text-xs font-normal text-[#A2ACBA]">%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono text-[#A2ACBA]">MEMORY</div>
                <div className="text-base font-bold text-[#F4F6FA]">
                  {node.metrics.memoryUsagePct} <span className="text-xs font-normal text-[#A2ACBA]">%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono text-[#A2ACBA]">BANDWIDTH</div>
                <div className="text-base font-bold text-[#FF8A24]">
                  {node.metrics.bandwidthUtilPct} <span className="text-xs font-normal text-[#A2ACBA]">%</span>
                </div>
              </div>

              {node.metrics.queueDrops !== undefined && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-[#A2ACBA]">QUEUE DROPS</div>
                  <div className={`text-base font-bold ${node.metrics.queueDrops > 0 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'}`}>
                    {node.metrics.queueDrops}
                  </div>
                </div>
              )}

              {node.metrics.signalStrengthDbm !== undefined && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-mono text-[#A2ACBA]">WI-FI RSSI</div>
                  <div className={`text-base font-bold ${node.metrics.signalStrengthDbm < -80 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'}`}>
                    {node.metrics.signalStrengthDbm} <span className="text-xs font-normal text-[#A2ACBA]">dBm</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connected Peers */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-[#A2ACBA] uppercase">
              Connected Topology Neighbors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {node.connectedTo.map((peerId) => (
                <span
                  key={peerId}
                  className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-[#20D9FF]"
                >
                  {peerId}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
