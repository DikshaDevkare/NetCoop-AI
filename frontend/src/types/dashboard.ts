export type TimeRangeOption = '15m' | '1h' | '6h' | '24h' | '7d';

export interface DashboardMetricSummary {
  totalDevices: number;
  healthyDevices: number;
  warningDevices: number;
  criticalDevices: number;
  activeIncidents: number;
  averageLatencyMs: number;
  averagePacketLossPct: number;
  networkUtilizationPct: number;
  totalTelemetryCount: number;
  isLiveBackend: boolean;
}

export interface TopologySettings {
  showLabels: boolean;
  animatePackets: boolean;
  filterType: string;
  filterStatus: string;
  cameraResetTrigger: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
}
