import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDashboardStore } from '../store/useDashboardStore';
import { deviceService } from '../services/deviceService';
import {
  TelemetryTimeSeriesChart,
} from '../components/charts/TelemetryTimeSeriesChart';
import type { TimeRangeOption } from '../types/dashboard';
import {
  Activity,
  Server,
} from 'lucide-react';

export function TelemetryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { devices, isLiveBackend } = useDashboardStore();

  const initialDeviceId = searchParams.get('device') || devices[0]?.device_id || 'SW-DIST-01';
  const [selectedDeviceId, setSelectedDeviceId] = useState(initialDeviceId);
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1h');
  const [selectedCategory, setSelectedCategory] = useState<
    'performance' | 'infrastructure' | 'connectivity'
  >('performance');

  const [liveTelemetry, setLiveTelemetry] = useState<any[]>([]);

  // Update URL param when device changes
  useEffect(() => {
    setSearchParams({ device: selectedDeviceId });
  }, [selectedDeviceId, setSearchParams]);

  // Fetch telemetry from backend if available
  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      if (!isLiveBackend) return;
      try {
        const res = await deviceService.getDeviceTelemetry(selectedDeviceId, 1, 50);
        if (isMounted && res.telemetry && res.telemetry.length > 0) {
          setLiveTelemetry(res.telemetry);
        }
      } catch (err) {
        console.warn('Could not fetch live telemetry:', err);
      }
    }
    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, [selectedDeviceId, isLiveBackend]);

  // Format chart time-series data
  const chartData = useMemo(() => {
    if (liveTelemetry.length > 0) {
      return {
        latency: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.latency_ms || 12.0,
        })),
        packetLoss: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.packet_loss_pct || 0.0,
        })),
        bandwidth: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.bandwidth_utilization_pct || 35.0,
        })),
        cpu: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.cpu_usage_pct || 25.0,
        })),
        memory: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.memory_usage_pct || 40.0,
        })),
        queueDrops: liveTelemetry.map((t) => ({
          time: t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 5) || t.timestamp : '12:00',
          value: t.queue_drops || 0,
        })),
      };
    }

    // Demo Fallback 10-step series
    const times = ['14:00', '14:05', '14:10', '14:15', '14:20', '14:25', '14:30', '14:35', '14:40', '14:45'];
    const isProblemDevice = selectedDeviceId.includes('DIST-02') || selectedDeviceId.includes('DORM');

    return {
      latency: times.map((t, i) => ({
        time: t,
        value: isProblemDevice ? Math.round(180 + i * 8.5) : Math.round(12 + (i % 3) * 1.5),
      })),
      packetLoss: times.map((t, i) => ({
        time: t,
        value: isProblemDevice ? Number((2.5 + i * 0.4).toFixed(1)) : 0.0,
      })),
      bandwidth: times.map((t, i) => ({
        time: t,
        value: isProblemDevice ? Math.round(85 + i * 1.5) : Math.round(35 + (i % 4) * 2.0),
      })),
      cpu: times.map((t, i) => ({
        time: t,
        value: isProblemDevice ? Math.round(62 + i * 1.2) : Math.round(22 + (i % 3) * 1.0),
      })),
      memory: times.map((t, i) => ({
        time: t,
        value: Math.round(42 + (i % 2) * 1.5),
      })),
      queueDrops: times.map((t, i) => ({
        time: t,
        value: isProblemDevice ? Math.round(40 + i * 12) : 0,
      })),
    };
  }, [liveTelemetry, selectedDeviceId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#20D9FF] mb-1">
            <Activity className="w-4 h-4" />
            <span>TIME-SERIES TELEMETRY OBSERVATIONS // RECHARTS ANALYTICS</span>
          </div>
          <h2 className="text-2xl font-black text-[#F4F6FA]">
            Network Metric Trajectories &amp; Trends
          </h2>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Analyze historical and real-time performance telemetry across 18 standardized
            RFC 3339 features to isolate rate-of-change degradation slopes.
          </p>
        </div>

        {/* Live vs Demo Notice */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-mono border ${
            isLiveBackend
              ? 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30'
              : 'bg-[#FF8A24]/10 text-[#FF8A24] border-[#FF8A24]/30'
          }`}
        >
          {isLiveBackend ? 'LIVE API TELEMETRY' : 'DEMO FALLBACK DATA'}
        </span>
      </div>

      {/* Control Bar: Device Selector, Category Tabs & Time Range */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Device Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Server className="w-4 h-4 text-[#A2ACBA] shrink-0" />
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#F4F6FA] focus:outline-none focus:border-[#FF8A24] cursor-pointer"
          >
            {devices.map((d) => (
              <option key={d.device_id} value={d.device_id} className="bg-[#10151D]">
                {d.device_id} — {d.device_name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('performance')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedCategory === 'performance'
                ? 'bg-[#FF8A24] text-[#080B10] font-bold'
                : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
            }`}
          >
            Performance &amp; Transit
          </button>
          <button
            onClick={() => setSelectedCategory('infrastructure')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedCategory === 'infrastructure'
                ? 'bg-[#FF8A24] text-[#080B10] font-bold'
                : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
            }`}
          >
            Compute &amp; Hardware
          </button>
          <button
            onClick={() => setSelectedCategory('connectivity')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedCategory === 'connectivity'
                ? 'bg-[#FF8A24] text-[#080B10] font-bold'
                : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
            }`}
          >
            Queues &amp; Egress
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl text-xs font-mono">
          {(['15m', '1h', '6h', '24h', '7d'] as TimeRangeOption[]).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === tr
                  ? 'bg-white/15 text-[#20D9FF] font-bold border border-[#20D9FF]/40'
                  : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedCategory === 'performance' && (
          <>
            {/* Latency Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">Round-Trip Latency</span>
                <span className="text-[#FF8A24]">Threshold: 150ms</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.latency}
                metricName="latency"
                metricLabel="Latency"
                unit="ms"
                color="#FF8A24"
              />
            </div>

            {/* Packet Loss Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">Packet Loss Percentage</span>
                <span className="text-[#FF4D5A]">Floor: 0.1%</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.packetLoss}
                metricName="packetLoss"
                metricLabel="Loss"
                unit="%"
                color="#FF4D5A"
              />
            </div>
          </>
        )}

        {selectedCategory === 'infrastructure' && (
          <>
            {/* CPU Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">CPU Utilization</span>
                <span className="text-[#FFB547]">Threshold: 85%</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.cpu}
                metricName="cpu"
                metricLabel="CPU Usage"
                unit="%"
                color="#FFB547"
              />
            </div>

            {/* Memory Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">Memory Allocation</span>
                <span className="text-[#20D9FF]">Threshold: 90%</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.memory}
                metricName="memory"
                metricLabel="RAM Usage"
                unit="%"
                color="#20D9FF"
              />
            </div>
          </>
        )}

        {selectedCategory === 'connectivity' && (
          <>
            {/* Bandwidth Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">Trunk Bandwidth Utilization</span>
                <span className="text-[#FF8A24]">Capacity: 100%</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.bandwidth}
                metricName="bandwidth"
                metricLabel="Utilization"
                unit="%"
                color="#FF8A24"
              />
            </div>

            {/* Queue Drops Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F4F6FA]">Egress Buffer Queue Drops</span>
                <span className="text-[#FF4D5A]">Limit: 50 drops</span>
              </div>
              <TelemetryTimeSeriesChart
                data={chartData.queueDrops}
                metricName="queueDrops"
                metricLabel="Queue Drops"
                unit=" drops"
                color="#FF4D5A"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
