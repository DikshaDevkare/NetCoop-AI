import { create } from 'zustand';
import type {
  ConnectionStatus,
  DeviceItem,
  IncidentItem,
  SystemStatusResponse,
} from '../types/api';
import type {
  DashboardMetricSummary,
  TopologySettings,
  DashboardNotification,
} from '../types/dashboard';
import { healthService } from '../services/healthService';
import { deviceService } from '../services/deviceService';
import { incidentService } from '../services/incidentService';
import { CAMPUS_NODES } from '../utils/mockTopology';

// Demo fallback devices mapping if backend is offline
const DEMO_FALLBACK_DEVICES: DeviceItem[] = CAMPUS_NODES.map((node) => ({
  device_id: node.id,
  device_name: node.name,
  device_type: node.type,
  network_segment: node.id.includes('DORM')
    ? 'SEG-RESIDENTIAL-01'
    : node.id.includes('DIST-01')
    ? 'SEG-NORTH-DIST'
    : 'SEG-CORE-BACKBONE',
  location: node.id.includes('DORM')
    ? 'Dormitory Quad Hall B'
    : node.id.includes('LIB')
    ? 'Central Library Floor 2'
    : 'Datacenter Core Rack 04',
  created_at: new Date().toISOString(),
  status: node.status,
  ip_address: node.ip,
  mac_address: node.mac,
}));

// Demo fallback incidents
const DEMO_FALLBACK_INCIDENTS: IncidentItem[] = [
  {
    incident_id: 'INC-2026-1002',
    incident_type: 'NETWORK_CONGESTION',
    severity: 'critical',
    status: 'INVESTIGATING',
    start_time: '2026-10-31T14:32:00Z',
    end_time: null,
    affected_devices: ['SW-DIST-02', 'AP-DORM-01'],
    description: 'Egress buffer overflow and link saturation on Distribution Switch SW-DIST-02.',
  },
  {
    incident_id: 'INC-2026-0985',
    incident_type: 'WIRELESS_ATTENUATION',
    severity: 'warning',
    status: 'OPEN',
    start_time: '2026-10-31T12:15:00Z',
    end_time: null,
    affected_devices: ['AP-DORM-01'],
    description: 'RF attenuation below -85 dBm detected in Residential Hall B wireless coverage cell.',
  },
  {
    incident_id: 'INC-2026-0940',
    incident_type: 'HARDWARE_THERMAL_ALERT',
    severity: 'critical',
    status: 'RESOLVED',
    start_time: '2026-10-30T18:45:00Z',
    end_time: '2026-10-30T19:30:00Z',
    affected_devices: ['RTR-CORE-01'],
    description: 'Core router chassis thermal alert (80°C) with subsequent process core reload.',
  },
];

interface DashboardState {
  connectionStatus: ConnectionStatus;
  isLiveBackend: boolean;
  lastUpdated: string;
  systemStatus: SystemStatusResponse | null;
  devices: DeviceItem[];
  incidents: IncidentItem[];
  selectedDevice: DeviceItem | null;
  selectedAgentId: string;
  metrics: DashboardMetricSummary;
  topologySettings: TopologySettings;
  notifications: DashboardNotification[];
  isLoading: boolean;
  error: string | null;
  earthRotation: boolean;

  // Actions
  fetchData: () => Promise<void>;
  setSelectedDevice: (device: DeviceItem | null) => void;
  setSelectedAgentId: (agentId: string) => void;
  updateTopologySettings: (settings: Partial<TopologySettings>) => void;
  markNotificationRead: (id: string) => void;
  toggleEarthRotation: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  connectionStatus: 'connecting',
  isLiveBackend: false,
  lastUpdated: new Date().toLocaleTimeString(),
  systemStatus: null,
  devices: DEMO_FALLBACK_DEVICES,
  incidents: DEMO_FALLBACK_INCIDENTS,
  selectedDevice: DEMO_FALLBACK_DEVICES[0],
  selectedAgentId: 'telemetry-performance',
  metrics: {
    totalDevices: 9,
    healthyDevices: 7,
    warningDevices: 1,
    criticalDevices: 1,
    activeIncidents: 2,
    averageLatencyMs: 18.5,
    averagePacketLossPct: 1.2,
    networkUtilizationPct: 48.6,
    totalTelemetryCount: 7800,
    isLiveBackend: false,
  },
  topologySettings: {
    showLabels: true,
    animatePackets: true,
    filterType: 'all',
    filterStatus: 'all',
    cameraResetTrigger: 0,
  },
  notifications: [
    {
      id: 'notif-1',
      title: 'Active Congestion Detected',
      message: 'SW-DIST-02 reporting 98% bandwidth utilization and 140 queue drops.',
      severity: 'critical',
      timestamp: '2 min ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: '5-Agent Council Ready',
      message: 'Protocol v1.0 standard message envelope active across all agents.',
      severity: 'info',
      timestamp: '15 min ago',
      read: true,
    },
  ],
  isLoading: false,
  error: null,
  earthRotation: true,

  fetchData: async () => {
    set({ isLoading: true, connectionStatus: 'connecting' });
    try {
      // 1. Probe backend health
      await healthService.checkHealth();
      const statusRes = await healthService.getSystemStatus();

      // 2. Fetch live devices & incidents
      const devicesRes = await deviceService.getDevices(1, 50);
      const incidentsRes = await incidentService.getIncidents(1, 20);

      const liveDevices = devicesRes.devices && devicesRes.devices.length > 0
        ? devicesRes.devices
        : DEMO_FALLBACK_DEVICES;

      const liveIncidents = incidentsRes.incidents && incidentsRes.incidents.length > 0
        ? incidentsRes.incidents
        : DEMO_FALLBACK_INCIDENTS;

      set({
        connectionStatus: 'connected',
        isLiveBackend: true,
        lastUpdated: new Date().toLocaleTimeString(),
        systemStatus: statusRes,
        devices: liveDevices,
        incidents: liveIncidents,
        selectedDevice: liveDevices[0] || null,
        metrics: {
          totalDevices: liveDevices.length,
          healthyDevices: liveDevices.filter((d) => d.status !== 'warning' && d.status !== 'critical').length,
          warningDevices: liveDevices.filter((d) => d.status === 'warning').length,
          criticalDevices: liveDevices.filter((d) => d.status === 'critical').length,
          activeIncidents: liveIncidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
          averageLatencyMs: 14.2,
          averagePacketLossPct: 0.8,
          networkUtilizationPct: 52.4,
          totalTelemetryCount: 7800,
          isLiveBackend: true,
        },
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      // Backend offline: Switch to clearly labeled DEMO FALLBACK DATA
      console.warn('Backend unavailable at VITE_API_BASE_URL. Using interactive demo fallback data.', err?.message);
      set({
        connectionStatus: 'disconnected',
        isLiveBackend: false,
        lastUpdated: new Date().toLocaleTimeString(),
        devices: DEMO_FALLBACK_DEVICES,
        incidents: DEMO_FALLBACK_INCIDENTS,
        selectedDevice: DEMO_FALLBACK_DEVICES[0],
        isLoading: false,
        error: 'Backend is offline (http://127.0.0.1:8000). Operating in Demo Fallback Mode.',
      });
    }
  },

  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
  updateTopologySettings: (newSettings) =>
    set((state) => ({
      topologySettings: { ...state.topologySettings, ...newSettings },
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  toggleEarthRotation: () =>
    set((state) => ({ earthRotation: !state.earthRotation })),
}));
