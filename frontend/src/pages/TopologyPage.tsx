import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { NetworkTopology3D } from '../components/topology/NetworkTopology3D';
import { TopologyControls } from '../components/topology/TopologyControls';
import { DeviceInspectionDrawer } from '../components/topology/DeviceInspectionDrawer';
import type { DeviceItem } from '../types/api';
import { Network } from 'lucide-react';

export function TopologyPage() {
  const { devices, selectedDevice, setSelectedDevice } =
    useDashboardStore();
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleSelect = (device: DeviceItem) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Page Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24] mb-1">
            <Network className="w-4 h-4" />
            <span>3D SPATIAL MESH // HIERARCHICAL TOPOLOGY EXPLORER</span>
          </div>
          <h2 className="text-2xl font-black text-[#F4F6FA]">
            Campus Network Infrastructure Topology
          </h2>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Full 3D visualization of core routers, distribution switches, access layers,
            and wireless access points. Drag to orbit, wheel to zoom, click any device to inspect.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#20D9FF]">
            {devices.length} Devices Mapped
          </span>
        </div>
      </div>

      {/* Main 3D Topology Canvas */}
      <div className="relative w-full h-[720px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        <TopologyControls />

        <NetworkTopology3D
          onSelectDevice={handleSelect}
          selectedDeviceId={selectedDevice?.device_id}
        />

        {drawerOpen && selectedDevice && (
          <DeviceInspectionDrawer
            device={selectedDevice}
            onClose={() => setDrawerOpen(false)}
            onSelectNeighbor={(nbId) => {
              const target = devices.find((d) => d.device_id === nbId);
              if (target) setSelectedDevice(target);
            }}
          />
        )}
      </div>
    </div>
  );
}
