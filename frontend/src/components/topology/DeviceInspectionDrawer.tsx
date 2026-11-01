import { useNavigate } from 'react-router-dom';
import {
  X,
  Activity,
  ExternalLink,
} from 'lucide-react';
import type { DeviceItem } from '../../types/api';
import { CAMPUS_NODES } from '../../utils/mockTopology';

interface DeviceInspectionDrawerProps {
  device: DeviceItem | null;
  onClose: () => void;
  onSelectNeighbor?: (neighborId: string) => void;
}

export function DeviceInspectionDrawer({
  device,
  onClose,
  onSelectNeighbor,
}: DeviceInspectionDrawerProps) {
  const navigate = useNavigate();

  if (!device) return null;

  // Retrieve mock telemetry stats for this device if not present on backend response
  const mockNode = CAMPUS_NODES.find((n) => n.id === device.device_id);
  const metrics = mockNode?.metrics || {
    latencyMs: 12.0,
    packetLossPct: 0.0,
    cpuUsagePct: 24.0,
    memoryUsagePct: 38.0,
    bandwidthUtilPct: 35.0,
    queueDrops: 0,
  };

  const status = device.status || mockNode?.status || 'healthy';

  let statusBg = 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30';
  if (status === 'warning') {
    statusBg = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
  } else if (status === 'critical') {
    statusBg = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
  }

  const neighbors = mockNode?.connectedTo || [];

  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between z-20 pointer-events-auto overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusBg}`}>
                {status.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono uppercase text-[#A2ACBA]">
                {device.device_type}
              </span>
            </div>
            <h3 className="text-xl font-black text-[#F4F6FA]">
              {device.device_id}
            </h3>
            <p className="text-xs text-[#A2ACBA] font-medium">
              {device.device_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl glass-panel hover:text-[#FF8A24] text-[#A2ACBA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Network & Physical Location */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[#A2ACBA]">IP Address:</span>
            <span className="text-[#20D9FF]">{device.ip_address || mockNode?.ip || '10.0.0.1'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A2ACBA]">Segment:</span>
            <span className="text-[#F4F6FA]">{device.network_segment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A2ACBA]">Location:</span>
            <span className="text-[#A2ACBA]">{device.location || 'Core Datacenter'}</span>
          </div>
        </div>

        {/* Latest Telemetry Metrics */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span className="flex items-center gap-1.5 text-[#FF8A24]">
              <Activity className="w-3.5 h-3.5" />
              <span>LIVE TELEMETRY</span>
            </span>
            <span className="text-[10px]">Standardized</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#A2ACBA] block">LATENCY</span>
              <span className="text-sm font-bold text-[#F4F6FA]">
                {metrics.latencyMs} <span className="text-[10px] text-[#A2ACBA]">ms</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#A2ACBA] block">PACKET LOSS</span>
              <span
                className={`text-sm font-bold ${
                  metrics.packetLossPct > 1 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'
                }`}
              >
                {metrics.packetLossPct} <span className="text-[10px] text-[#A2ACBA]">%</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#A2ACBA] block">CPU UTIL</span>
              <span className="text-sm font-bold text-[#F4F6FA]">
                {metrics.cpuUsagePct} <span className="text-[10px] text-[#A2ACBA]">%</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#A2ACBA] block">BANDWIDTH</span>
              <span className="text-sm font-bold text-[#FF8A24]">
                {metrics.bandwidthUtilPct} <span className="text-[10px] text-[#A2ACBA]">%</span>
              </span>
            </div>

            {metrics.queueDrops !== undefined && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#A2ACBA] block">QUEUE DROPS</span>
                <span
                  className={`text-sm font-bold ${
                    metrics.queueDrops > 0 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'
                  }`}
                >
                  {metrics.queueDrops}
                </span>
              </div>
            )}

            {metrics.signalStrengthDbm !== undefined && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#A2ACBA] block">WI-FI RSSI</span>
                <span
                  className={`text-sm font-bold ${
                    metrics.signalStrengthDbm < -80 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'
                  }`}
                >
                  {metrics.signalStrengthDbm} <span className="text-[10px] text-[#A2ACBA]">dBm</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Connected Topology Neighbors */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-[#A2ACBA]">
            CONNECTED TOPOLOGY NEIGHBORS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {neighbors.map((nbId) => (
              <button
                key={nbId}
                onClick={() => onSelectNeighbor?.(nbId)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#FF8A24]/10 hover:text-[#FF8A24] border border-white/10 text-xs font-mono text-[#20D9FF] transition-colors cursor-pointer"
              >
                {nbId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => navigate(`/dashboard/telemetry?device=${device.device_id}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[#FF8A24]/20"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>View Telemetry History</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
