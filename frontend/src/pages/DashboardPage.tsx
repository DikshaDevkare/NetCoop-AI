import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../store/useDashboardStore';
import { MetricCard } from '../components/dashboard/MetricCard';
import { CommandCenterTopology3D } from '../components/topology/CommandCenterTopology3D';
import { TopologyControls } from '../components/topology/TopologyControls';
import { DeviceInspectionDrawer } from '../components/topology/DeviceInspectionDrawer';
import { RecentIncidentsWidget } from '../components/dashboard/RecentIncidentsWidget';
import type { DeviceItem } from '../types/api';
import {
  Server,
  AlertTriangle,
  Activity,
  Gauge,
  Radio,
  Share2,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Play,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { metrics, devices, incidents, selectedDevice, setSelectedDevice } = useDashboardStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectDevice = (device: DeviceItem) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
  };

  // Calculate overall network health score (out of 100)
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 - metrics.criticalDevices * 12 - metrics.warningDevices * 4 - metrics.activeIncidents * 5
    )
  );

  const isHealthy = healthScore >= 85;
  const isCritical = healthScore < 70;
  const healthColor = isCritical ? '#FF4D5A' : isHealthy ? '#26D7A0' : '#FFB547';

  // Active or top incident
  const primaryIncident = incidents.find((inc) => inc.status === 'active' || inc.status === 'open') || incidents[0];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* --- TOP OPERATIONAL HEADER BAR --- */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#F4F6FA] uppercase">
              Network Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#26D7A0]/10 text-[#26D7A0] border border-[#26D7A0]/30">
              <span className="w-2 h-2 rounded-full bg-[#26D7A0] animate-pulse" />
              ORCHESTRATOR ONLINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A2ACBA] font-mono mt-1">
            Real-time network intelligence and fault monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/dashboard/diagnosis')}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#05080D] shadow-lg shadow-[#FF8A24]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Diagnosis
          </button>
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#F4F6FA] glass-panel border border-white/10 hover:border-[#FF8A24]/40 hover:text-[#FF8A24] transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* --- PRIMARY DISPLAY: DOMINANT 3D SCENE (70%) + OPERATIONAL HEALTH PANEL (30%) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Dominant 3D Infrastructure Viewport */}
        <div className="xl:col-span-8 relative h-[620px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col">
          {/* Top floating HUD controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#080B10]/85 backdrop-blur-md border border-white/10 text-xs font-mono text-[#F4F6FA] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span>SPATIAL NOC TOPOLOGY</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-[#080B10]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#A2ACBA]">
              {devices.length} Nodes Monitored
            </div>
          </div>

          <TopologyControls />

          {/* 3D Scene */}
          <div className="w-full h-full">
            <CommandCenterTopology3D
              onSelectDevice={handleSelectDevice}
              selectedDeviceId={selectedDevice?.device_id}
            />
          </div>

          {/* Device Inspection Drawer */}
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

        {/* Right Side: Operational Status & Intelligence Column */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Radial Health Score Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF8A24]" />
                <span className="text-xs font-mono font-bold tracking-wider text-[#F4F6FA] uppercase">
                  System Health Score
                </span>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${healthColor}20`,
                  color: healthColor,
                  border: `1px solid ${healthColor}40`,
                }}
              >
                {isCritical ? 'CRITICAL FAULT' : isHealthy ? 'OPTIMAL' : 'DEGRADED'}
              </span>
            </div>

            <div className="flex items-center gap-6 my-2">
              {/* Circular SVG Gauge */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#101A25"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={healthColor}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-[#F4F6FA]">
                    {healthScore.toFixed(0)}%
                  </span>
                  <span className="text-[9px] font-mono text-[#A2ACBA] uppercase">HEALTH</span>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="flex-1 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#A2ACBA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#26D7A0]" />
                    Healthy Nodes:
                  </span>
                  <span className="font-bold text-[#F4F6FA]">{metrics.healthyDevices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A2ACBA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
                    Degraded:
                  </span>
                  <span className="font-bold text-[#FFB547]">{metrics.warningDevices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A2ACBA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF4D5A]" />
                    Critical Faults:
                  </span>
                  <span className="font-bold text-[#FF4D5A]">{metrics.criticalDevices}</span>
                </div>
                <div className="w-full bg-[#101A25] h-1.5 rounded-full overflow-hidden flex mt-1">
                  <div
                    style={{ width: `${(metrics.healthyDevices / metrics.totalDevices) * 100}%` }}
                    className="bg-[#26D7A0] h-full"
                  />
                  <div
                    style={{ width: `${(metrics.warningDevices / metrics.totalDevices) * 100}%` }}
                    className="bg-[#FFB547] h-full"
                  />
                  <div
                    style={{ width: `${(metrics.criticalDevices / metrics.totalDevices) * 100}%` }}
                    className="bg-[#FF4D5A] h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Incident Quick Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-[#F4F6FA] uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF4D5A]" />
                Primary Active Incident
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF4D5A]/20 text-[#FF4D5A] border border-[#FF4D5A]/40 font-bold">
                {primaryIncident ? primaryIncident.incident_id : 'NO ALERTS'}
              </span>
            </div>

            {primaryIncident ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-[#F4F6FA]">
                    {primaryIncident.probable_cause || 'Network Congestion Event'}
                  </div>
                  <div className="text-[11px] text-[#A2ACBA] font-mono flex items-center justify-between">
                    <span>Node: <strong className="text-[#20D9FF]">{primaryIncident.device_id || 'SW-DIST-01'}</strong></span>
                    <span>Confidence: <strong className="text-[#26D7A0]">{((primaryIncident.confidence_score ?? 0.94) * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard/diagnosis')}
                  className="w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF8A24]/10 hover:bg-[#FF8A24]/20 border border-[#FF8A24]/40 text-[#FF8A24] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Analyze Root Cause
                </button>
              </div>
            ) : (
              <div className="py-4 text-center text-xs font-mono text-[#A2ACBA]">
                All network devices operating within normal parameters.
              </div>
            )}
          </div>

          {/* Network Traffic & Bandwidth Monitor */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#F4F6FA] uppercase flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#20D9FF]" />
                Network Traffic &amp; Transit
              </span>
              <span className="text-[10px] font-mono text-[#26D7A0] px-2 py-0.5 rounded bg-[#26D7A0]/10 border border-[#26D7A0]/30 font-semibold">
                74.2 Gbps
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#A2ACBA]">
                <span>Trunk Utilization:</span>
                <span className="font-bold text-[#F4F6FA]">{metrics.networkUtilizationPct}%</span>
              </div>
              <div className="w-full bg-[#101A25] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#20D9FF] via-[#FFB45C] to-[#FF8A24] h-full rounded-full transition-all duration-700"
                  style={{ width: `${metrics.networkUtilizationPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A2ACBA] pt-1">
                <span>Packet Rate: <strong className="text-[#F4F6FA]">1.42 Mpps</strong></span>
                <span>Active Trunks: <strong className="text-[#20D9FF]">24 / 24</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- OPERATIONAL METRICS ROW --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Total Devices"
          value={metrics.totalDevices}
          subtitle={`${metrics.healthyDevices} healthy, ${metrics.warningDevices + metrics.criticalDevices} abnormal`}
          status={metrics.criticalDevices > 0 ? 'warning' : 'healthy'}
          icon={Server}
        />

        <MetricCard
          title="Active Incidents"
          value={metrics.activeIncidents}
          subtitle="Cross-agent correlation active"
          status={metrics.activeIncidents > 0 ? 'critical' : 'healthy'}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Avg Latency"
          value={metrics.averageLatencyMs}
          unit="ms"
          subtitle="L3/L4 core transit baseline"
          status="healthy"
          trend="-2.1ms"
          icon={Activity}
        />

        <MetricCard
          title="Packet Loss"
          value={metrics.averagePacketLossPct}
          unit="%"
          subtitle="Trunk error floor: 0.1%"
          status={metrics.averagePacketLossPct > 2 ? 'critical' : 'healthy'}
          icon={Radio}
        />

        <MetricCard
          title="Core Bandwidth"
          value={metrics.networkUtilizationPct}
          unit="%"
          subtitle="Trunk aggregation capacity"
          status="warning"
          trend="+4.2%"
          icon={Gauge}
        />

        <MetricCard
          title="Telemetry Feeds"
          value={metrics.totalTelemetryCount.toLocaleString()}
          subtitle="Standardized RFC 3339"
          status="healthy"
          icon={Share2}
        />
      </div>

      {/* --- LOWER ROW: RECENT INCIDENTS TABLE --- */}
      <RecentIncidentsWidget />
    </div>
  );
}
