import { useState, useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { CAMPUS_NODES } from '../utils/mockTopology';
import {
  Server,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DevicesPage() {
  const { devices, setSelectedDevice } = useDashboardStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'latency' | 'cpu' | 'loss'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Enrich device objects with mock metrics if not already on device item
  const enrichedDevices = useMemo(() => {
    return devices.map((dev) => {
      const mock = CAMPUS_NODES.find((m) => m.id === dev.device_id);
      return {
        ...dev,
        metrics: mock?.metrics || {
          latencyMs: 12.0,
          packetLossPct: 0.0,
          cpuUsagePct: 24.0,
          memoryUsagePct: 38.0,
          bandwidthUtilPct: 35.0,
        },
        status: dev.status || mock?.status || 'healthy',
        ip: dev.ip_address || mock?.ip || '10.0.0.1',
      };
    });
  }, [devices]);

  // Filtering & Sorting
  const filteredDevices = useMemo(() => {
    return enrichedDevices
      .filter((dev) => {
        const matchesSearch =
          dev.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dev.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dev.ip.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || dev.device_type === typeFilter;
        const matchesStatus = statusFilter === 'all' || dev.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.device_name.localeCompare(b.device_name);
        if (sortBy === 'latency') return b.metrics.latencyMs - a.metrics.latencyMs;
        if (sortBy === 'cpu') return b.metrics.cpuUsagePct - a.metrics.cpuUsagePct;
        if (sortBy === 'loss') return b.metrics.packetLossPct - a.metrics.packetLossPct;
        return 0;
      });
  }, [enrichedDevices, searchQuery, typeFilter, statusFilter, sortBy]);

  const handleDeviceClick = (dev: any) => {
    setSelectedDevice(dev);
    navigate(`/dashboard/telemetry?device=${dev.device_id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#20D9FF] mb-1">
            <Server className="w-4 h-4" />
            <span>HARDWARE INVENTORY // DISTRIBUTED DEVICE AUDIT</span>
          </div>
          <h2 className="text-2xl font-black text-[#F4F6FA]">
            Network Hardware &amp; Telemetry State
          </h2>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Real-time operating telemetry, interface statistics, and health classifications
            across all registered campus routers, switches, and edge access points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center glass-panel p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FF8A24] text-[#080B10]'
                  : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FF8A24] text-[#080B10]'
                  : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A2ACBA] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#F4F6FA] placeholder-[#A2ACBA]/60 focus:outline-none focus:border-[#FF8A24]"
          />
        </div>

        {/* Device Type Filter */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-[#A2ACBA]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-[#F4F6FA] w-full focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#10151D]">
              All Device Types
            </option>
            <option value="router" className="bg-[#10151D]">
              Routers
            </option>
            <option value="switch" className="bg-[#10151D]">
              Switches
            </option>
            <option value="access_point" className="bg-[#10151D]">
              Access Points
            </option>
            <option value="server" className="bg-[#10151D]">
              Servers / IPAM
            </option>
          </select>
        </div>

        {/* Health Status Filter */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-[#A2ACBA]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-[#F4F6FA] w-full focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#10151D]">
              All Statuses
            </option>
            <option value="healthy" className="bg-[#10151D]">
              Healthy Only
            </option>
            <option value="warning" className="bg-[#10151D]">
              Warning Only
            </option>
            <option value="critical" className="bg-[#10151D]">
              Critical Only
            </option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#A2ACBA]" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-[#F4F6FA] w-full focus:outline-none cursor-pointer"
          >
            <option value="name" className="bg-[#10151D]">
              Sort: Name
            </option>
            <option value="latency" className="bg-[#10151D]">
              Sort: Highest Latency
            </option>
            <option value="cpu" className="bg-[#10151D]">
              Sort: Highest CPU
            </option>
            <option value="loss" className="bg-[#10151D]">
              Sort: Packet Loss
            </option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((dev) => {
            let statusBadge = 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30';
            if (dev.status === 'warning') {
              statusBadge = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
            } else if (dev.status === 'critical') {
              statusBadge = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
            }

            return (
              <div
                key={dev.device_id}
                onClick={() => handleDeviceClick(dev)}
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-[#FF8A24]/40 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {dev.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#A2ACBA]">
                      {dev.device_type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F4F6FA] group-hover:text-[#FF8A24] transition-colors">
                    {dev.device_id}
                  </h3>
                  <p className="text-xs text-[#A2ACBA] line-clamp-1">
                    {dev.device_name}
                  </p>

                  <div className="mt-2 text-[11px] font-mono text-[#20D9FF]">
                    <code>{dev.ip}</code>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center font-mono">
                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-[9px] text-[#A2ACBA] block">LATENCY</span>
                    <span className="text-xs font-bold text-[#F4F6FA]">
                      {dev.metrics.latencyMs}ms
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-[9px] text-[#A2ACBA] block">LOSS</span>
                    <span
                      className={`text-xs font-bold ${
                        dev.metrics.packetLossPct > 1 ? 'text-[#FF4D5A]' : 'text-[#26D7A0]'
                      }`}
                    >
                      {dev.metrics.packetLossPct}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-[9px] text-[#A2ACBA] block">CPU</span>
                    <span className="text-xs font-bold text-[#F4F6FA]">
                      {dev.metrics.cpuUsagePct}%
                    </span>
                  </div>
                </div>

                {/* Footer Segment */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A2ACBA] pt-2">
                  <span className="truncate">{dev.network_segment}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF8A24] shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/50 text-[#A2ACBA] uppercase text-[10px] border-b border-white/5">
                <tr>
                  <th className="p-3.5">Device ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Packet Loss</th>
                  <th className="p-3.5">CPU Usage</th>
                  <th className="p-3.5">Bandwidth</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDevices.map((dev) => {
                  let statusBadge = 'text-[#26D7A0]';
                  if (dev.status === 'warning') statusBadge = 'text-[#FFB547]';
                  if (dev.status === 'critical') statusBadge = 'text-[#FF4D5A]';

                  return (
                    <tr
                      key={dev.device_id}
                      onClick={() => handleDeviceClick(dev)}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-bold text-[#F4F6FA]">
                        {dev.device_id}
                      </td>
                      <td className="p-3.5 uppercase text-[#A2ACBA]">
                        {dev.device_type}
                      </td>
                      <td className="p-3.5 text-[#20D9FF]">{dev.ip}</td>
                      <td className={`p-3.5 font-bold ${statusBadge}`}>
                        {dev.status.toUpperCase()}
                      </td>
                      <td className="p-3.5">{dev.metrics.latencyMs}ms</td>
                      <td className="p-3.5">{dev.metrics.packetLossPct}%</td>
                      <td className="p-3.5">{dev.metrics.cpuUsagePct}%</td>
                      <td className="p-3.5">{dev.metrics.bandwidthUtilPct}%</td>
                      <td className="p-3.5">
                        <span className="text-[#FF8A24] hover:underline flex items-center gap-1">
                          Inspect ❯
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
