// Canonical backend API response types

export type Severity = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface HealthCheckResponse {
  status: string;
  application: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ModelStatusInfo {
  name: string;
  type?: string;
  status?: string;
  available: boolean;
  version?: string;
  notes?: string;
  threshold?: number;
  feature_count?: number;
}

export interface AgentStatusInfo {
  agent_id: string;
  name: string;
  description: string;
  status: string;
  protocol_version: string;
}

export interface SystemStatusResponse {
  api_status: string;
  database_status: string;
  protocol_version: string;
  backend_version: string;
  environment: string;
  models: ModelStatusInfo[];
  agents: AgentStatusInfo[];
  timestamp: string;
}

export interface DeviceItem {
  device_id: string;
  device_name: string;
  device_type: 'router' | 'switch' | 'server' | 'access_point' | 'gateway';
  network_segment: string;
  location?: string | null;
  created_at?: string;
  status?: 'healthy' | 'warning' | 'critical';
  ip_address?: string;
  mac_address?: string;
}

export interface DevicesListResponse {
  total: number;
  page: number;
  page_size: number;
  devices: DeviceItem[];
}

export interface TelemetryItem {
  record_id?: number;
  device_id: string;
  incident_id?: string | null;
  timestamp: string;
  latency_ms?: number | null;
  packet_loss_pct?: number | null;
  jitter_ms?: number | null;
  throughput_mbps?: number | null;
  bandwidth_utilization_pct?: number | null;
  cpu_usage_pct?: number | null;
  memory_usage_pct?: number | null;
  temperature_celsius?: number | null;
  device_uptime_seconds?: number | null;
  dns_response_time_ms?: number | null;
  queue_drops?: number | null;
  interface_errors?: number | null;
  retransmissions?: number | null;
  wireless_signal_strength_dbm?: number | null;
}

export interface DeviceTelemetryResponse {
  device_id: string;
  total: number;
  page: number;
  page_size: number;
  telemetry: TelemetryItem[];
}

export interface IncidentItem {
  incident_id: string;
  incident_type: string;
  severity: string;
  status: string;
  start_time: string;
  end_time?: string | null;
  affected_devices: string[];
  description?: string;
  probable_cause?: string;
  device_id?: string;
  confidence_score?: number;
}

export interface IncidentsListResponse {
  total: number;
  page: number;
  page_size: number;
  incidents: IncidentItem[];
}

export interface FindingItem {
  finding_id: string;
  incident_id: string;
  agent_name: string;
  finding_type: string;
  severity: string;
  confidence: string;
  title: string;
  description: string;
  suspected_cause?: string | null;
  evidence_ids: string[];
  created_at: string;
}

export interface RecommendationItem {
  recommendation_id: string;
  diagnosis_id?: string;
  priority: string;
  action: string;
  rationale: string;
  target_devices: string[];
  step_order?: number;
  supporting_evidence_ids?: string[];
  automated?: boolean;
}
