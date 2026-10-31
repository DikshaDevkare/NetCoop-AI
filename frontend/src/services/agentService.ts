import { apiClient } from './api.ts';

export interface AgentStatusInfo {
  id: string;
  name: string;
  status: 'done' | 'processing' | 'running' | 'idle';
  message: string;
  lastActive: string;
}

export async function fetchAgentStatuses(): Promise<AgentStatusInfo[]> {
  try {
    const res = await apiClient.get<AgentStatusInfo[]>('/api/agents/status');
    return res.data;
  } catch {
    return [
      { id: 'perf', name: 'Performance Agent', status: 'done', message: 'High CPU on SW-03 flagged', lastActive: '14:02:18' },
      { id: 'infra', name: 'Infrastructure Health Agent', status: 'done', message: 'Memory 64%, CPU 78%, Uplink saturated', lastActive: '14:02:24' },
      { id: 'conn', name: 'Connectivity Analysis Agent', status: 'processing', message: 'BGP session stable, RTT +18ms delay', lastActive: '14:02:29' },
      { id: 'corr', name: 'Fault Correlation Agent', status: 'running', message: 'Correlating evidence across Building A...', lastActive: '14:02:35' },
      { id: 'rec', name: 'Recommendation & Reporting Agent', status: 'running', message: 'Synthesizing mitigation runbook...', lastActive: '14:02:40' },
    ];
  }
}
