export type DeviceType = 'router' | 'switch' | 'server' | 'access_point' | 'gateway';

export type NodeStatus = 'healthy' | 'warning' | 'critical';

export interface NetworkNode {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  position: [number, number, number];
  status: NodeStatus;
  metrics: {
    latencyMs: number;
    packetLossPct: number;
    cpuUsagePct: number;
    memoryUsagePct: number;
    bandwidthUtilPct: number;
    queueDrops?: number;
    signalStrengthDbm?: number;
  };
  connectedTo: string[]; // Node IDs
}

export interface AgentInfo {
  id: string;
  name: string;
  codename: string;
  role: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  iconName: string;
  monitoredMetrics: string[];
  diagnosticCapability: string;
  status: 'active' | 'analyzing' | 'standby';
}

export interface FeatureCard {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  category: 'ingestion' | 'intelligence' | 'remediation';
  capabilities: string[];
  metricHighlight: string;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  input: string;
  output: string;
  agentInvolved?: string;
}
