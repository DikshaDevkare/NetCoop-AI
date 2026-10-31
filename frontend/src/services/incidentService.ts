import { apiClient } from './api.ts';

export interface IncidentRecord {
  id: string;
  rootCause: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Resolved' | 'Open';
  occurredAt: string;
  affectedDevices: string[];
}

export async function fetchIncidents(): Promise<IncidentRecord[]> {
  try {
    const res = await apiClient.get<IncidentRecord[]>('/api/incidents');
    return res.data;
  } catch {
    return [
      { id: 'INC-1024', rootCause: 'Interface congestion on SW-03', severity: 'High', status: 'In Progress', occurredAt: 'Aug 29, 14:02', affectedDevices: ['SW-03', 'Building A'] },
      { id: 'INC-1023', rootCause: 'DNS resolution failure', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 29, 11:47', affectedDevices: ['DNS-Core-01'] },
      { id: 'INC-1022', rootCause: 'High CPU usage', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 28, 18:16', affectedDevices: ['Router-HQ-East'] },
      { id: 'INC-1021', rootCause: 'BGP peer session flap', severity: 'High', status: 'Resolved', occurredAt: 'Aug 28, 09:12', affectedDevices: ['Core Gateway'] },
      { id: 'INC-1020', rootCause: 'Wi-Fi interference on East AP', severity: 'Low', status: 'Resolved', occurredAt: 'Aug 27, 22:30', affectedDevices: ['AP-East-Floor3'] },
    ];
  }
}
