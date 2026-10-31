import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard.tsx';

export interface IncidentRecord {
  id: string;
  rootCause: string;
  severity: 'High' | 'Medium' | 'Low' | 'Critical';
  status: 'In-Progress' | 'Resolved' | 'Open';
  occurredAt: string;
}

const DEFAULT_INCIDENTS: IncidentRecord[] = [
  { id: 'INC-1024', rootCause: 'Interface congestion', severity: 'High', status: 'In-Progress', occurredAt: 'Aug 29, 14:02' },
  { id: 'INC-1023', rootCause: 'DNS resolution failure', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 29, 11:47' },
  { id: 'INC-1022', rootCause: 'High CPU usage', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 28, 16:12' },
  { id: 'INC-1021', rootCause: 'BGP flapping on Core-02', severity: 'High', status: 'Resolved', occurredAt: 'Aug 27, 09:30' },
  { id: 'INC-1020', rootCause: 'MTU mismatch on uplink', severity: 'Low', status: 'Resolved', occurredAt: 'Aug 26, 15:20' },
  { id: 'INC-1019', rootCause: 'DHCP pool exhaustion', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 25, 18:45' },
];

interface IncidentTableProps {
  searchQuery?: string;
  selectedSeverity?: string;
  onSelectIncident?: (incident: IncidentRecord) => void;
}

export function IncidentTable({
  searchQuery = '',
  selectedSeverity = 'all',
  onSelectIncident,
}: IncidentTableProps) {
  const navigate = useNavigate();

  const filtered = DEFAULT_INCIDENTS.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rootCause.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev =
      selectedSeverity === 'all' || item.severity.toLowerCase() === selectedSeverity.toLowerCase();
    return matchesSearch && matchesSev;
  });

  return (
    <GlassCard variant="default" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(25, 28, 38, 0.6)' }}>
              <th style={{ padding: '14px 20px', color: '#A3A6B3', fontWeight: 600, fontSize: '12px' }}>ID</th>
              <th style={{ padding: '14px 20px', color: '#A3A6B3', fontWeight: 600, fontSize: '12px' }}>Root Cause</th>
              <th style={{ padding: '14px 20px', color: '#A3A6B3', fontWeight: 600, fontSize: '12px' }}>Severity</th>
              <th style={{ padding: '14px 20px', color: '#A3A6B3', fontWeight: 600, fontSize: '12px' }}>Status</th>
              <th style={{ padding: '14px 20px', color: '#A3A6B3', fontWeight: 600, fontSize: '12px' }}>Occurred At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => (
              <tr
                key={inc.id}
                onClick={() => {
                  if (onSelectIncident) {
                    onSelectIncident(inc);
                  } else {
                    navigate('/incident-details');
                  }
                }}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 122, 24, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#38D9FF' }}>
                  {inc.id}
                </td>
                <td style={{ padding: '14px 20px', color: '#F5F5F7', fontWeight: 500 }}>
                  {inc.rootCause}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor:
                        inc.severity === 'High'
                          ? 'rgba(255, 77, 77, 0.15)'
                          : inc.severity === 'Medium'
                          ? 'rgba(255, 179, 71, 0.15)'
                          : 'rgba(56, 217, 255, 0.15)',
                      color:
                        inc.severity === 'High'
                          ? '#FF4D4D'
                          : inc.severity === 'Medium'
                          ? '#FFB347'
                          : '#38D9FF',
                      border: `1px solid ${
                        inc.severity === 'High'
                          ? 'rgba(255, 77, 77, 0.3)'
                          : inc.severity === 'Medium'
                          ? 'rgba(255, 179, 71, 0.3)'
                          : 'rgba(56, 217, 255, 0.3)'
                      }`,
                    }}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor:
                        inc.status === 'Resolved'
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(56, 217, 255, 0.12)',
                      color: inc.status === 'Resolved' ? '#10B981' : '#38D9FF',
                      border: `1px solid ${inc.status === 'Resolved' ? '#10B98150' : '#38D9FF50'}`,
                    }}
                  >
                    {inc.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: '#A3A6B3', fontSize: '12px' }}>
                  {inc.occurredAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
