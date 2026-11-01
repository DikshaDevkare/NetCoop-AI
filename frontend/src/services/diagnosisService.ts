import { apiClient } from './apiClient';

export interface TelemetryRecordPayload {
  timestamp: string;
  device_id: string;
  interface?: string;
  packet_loss_pct?: number;
  latency_ms?: number;
  throughput_mbps?: number;
  cpu_utilization_pct?: number;
  memory_utilization_pct?: number;
  temperature_celsius?: number;
  queue_drop_count?: number;
  dns_latency_ms?: number;
  dhcp_success_rate?: number;
  rssi_dbm?: number;
  [key: string]: any;
}

export interface DiagnosisRequestPayload {
  incident_id?: string;
  context?: Record<string, any>;
  telemetry_records: TelemetryRecordPayload[];
}

export interface DiagnosisResponseData {
  incident_id: string;
  status: string;
  severity: string;
  target_device?: string;
  confidence_score: number;
  probable_cause: string;
  executive_summary?: string;
  findings: Array<{
    agent_id: string;
    finding_type: string;
    description: string;
    confidence: number;
    evidence?: any;
  }>;
  recommendations: Array<{
    action_type: string;
    target: string;
    command?: string;
    commands?: string[];
    priority: number;
    description: string;
  }>;
  blast_radius?: {
    affected_devices?: string[];
    affected_segments?: string[];
    packet_loss_pct?: number;
    latency_increase_ms?: number;
  };
  agent_contributions?: Record<string, any>;
  model_predictions?: Record<string, any>;
  created_at: string;
}

export const diagnosisService = {
  /**
   * Triggers the full 5-agent multi-agent diagnosis pipeline on the FastAPI backend
   */
  async analyze(payload: DiagnosisRequestPayload): Promise<DiagnosisResponseData> {
    const response = await apiClient.post<DiagnosisResponseData>('/api/diagnosis/analyze', payload);
    return response.data;
  },

  /**
   * Fetches historical diagnoses from the backend database
   */
  async getHistory(page: number = 1, pageSize: number = 20, status?: string, severity?: string) {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const response = await apiClient.get('/api/diagnosis/history', { params });
    return response.data;
  },

  /**
   * Fetches registered agent council statuses
   */
  async getAgents() {
    const response = await apiClient.get('/api/diagnosis/agents');
    return response.data;
  },

  /**
   * Inspects ML models operational readiness (Isolation Forest, XGBoost, etc.)
   */
  async getModels() {
    const response = await apiClient.get('/api/diagnosis/models');
    return response.data;
  },
};
