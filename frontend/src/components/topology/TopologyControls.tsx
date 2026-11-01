import { useDashboardStore } from '../../store/useDashboardStore';
import {
  Activity,
  Layers,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';

export function TopologyControls() {
  const { topologySettings, updateTopologySettings } = useDashboardStore();

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
      {/* Toggle Labels */}
      <button
        onClick={() =>
          updateTopologySettings({ showLabels: !topologySettings.showLabels })
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono glass-panel transition-all cursor-pointer ${
          topologySettings.showLabels
            ? 'text-[#20D9FF] border-[#20D9FF]/40 bg-[#20D9FF]/10'
            : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
        }`}
      >
        {topologySettings.showLabels ? (
          <Eye className="w-3.5 h-3.5" />
        ) : (
          <EyeOff className="w-3.5 h-3.5" />
        )}
        <span>Labels</span>
      </button>

      {/* Toggle Data Packets */}
      <button
        onClick={() =>
          updateTopologySettings({
            animatePackets: !topologySettings.animatePackets,
          })
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono glass-panel transition-all cursor-pointer ${
          topologySettings.animatePackets
            ? 'text-[#FF8A24] border-[#FF8A24]/40 bg-[#FF8A24]/10'
            : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Packets</span>
      </button>

      {/* Device Type Filter Dropdown */}
      <div className="flex items-center gap-1 glass-panel px-2.5 py-1 rounded-xl text-xs font-mono">
        <Layers className="w-3.5 h-3.5 text-[#A2ACBA]" />
        <select
          value={topologySettings.filterType}
          onChange={(e) => updateTopologySettings({ filterType: e.target.value })}
          className="bg-transparent text-[#F4F6FA] focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-[#10151D] text-[#F4F6FA]">
            All Devices
          </option>
          <option value="router" className="bg-[#10151D] text-[#F4F6FA]">
            Routers
          </option>
          <option value="switch" className="bg-[#10151D] text-[#F4F6FA]">
            Switches
          </option>
          <option value="access_point" className="bg-[#10151D] text-[#F4F6FA]">
            Access Points
          </option>
          <option value="server" className="bg-[#10151D] text-[#F4F6FA]">
            Core Servers
          </option>
        </select>
      </div>

      {/* Health Status Filter Dropdown */}
      <div className="flex items-center gap-1 glass-panel px-2.5 py-1 rounded-xl text-xs font-mono">
        <Filter className="w-3.5 h-3.5 text-[#A2ACBA]" />
        <select
          value={topologySettings.filterStatus}
          onChange={(e) =>
            updateTopologySettings({ filterStatus: e.target.value })
          }
          className="bg-transparent text-[#F4F6FA] focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-[#10151D] text-[#F4F6FA]">
            All Statuses
          </option>
          <option value="healthy" className="bg-[#10151D] text-[#26D7A0]">
            Healthy Only
          </option>
          <option value="warning" className="bg-[#10151D] text-[#FFB547]">
            Warning Only
          </option>
          <option value="critical" className="bg-[#10151D] text-[#FF4D5A]">
            Critical Only
          </option>
        </select>
      </div>
    </div>
  );
}
