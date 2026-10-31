import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const TREND_DATA = [
  { date: 'Aug 1', count: 4 },
  { date: 'Aug 6', count: 6 },
  { date: 'Aug 11', count: 3 },
  { date: 'Aug 16', count: 9 },
  { date: 'Aug 21', count: 5 },
  { date: 'Aug 26', count: 7 },
  { date: 'Aug 29', count: 12 },
];

const DONUT_DATA = [
  { name: 'Congestion', value: 38, color: '#FF7A18' },
  { name: 'Interface Failure', value: 22, color: '#38D9FF' },
  { name: 'DNS/DHCP', value: 16, color: '#A855F7' },
  { name: 'Device Overload', value: 12, color: '#FFB347' },
  { name: 'Others', value: 12, color: '#6A6D7C' },
];

interface IncidentRow {
  id: string;
  rootCause: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Resolved' | 'Open';
  occurredAt: string;
}

const INCIDENTS_RAW: IncidentRow[] = [
  { id: 'INC-1024', rootCause: 'Interface congestion', severity: 'High', status: 'In Progress', occurredAt: 'Aug 29, 14:02' },
  { id: 'INC-1023', rootCause: 'DNS resolution failure', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 29, 11:47' },
  { id: 'INC-1022', rootCause: 'High CPU usage', severity: 'Medium', status: 'Resolved', occurredAt: 'Aug 28, 18:16' },
  { id: 'INC-1021', rootCause: 'BGP peer session flap', severity: 'High', status: 'Resolved', occurredAt: 'Aug 28, 09:12' },
  { id: 'INC-1020', rootCause: 'Wi-Fi interference on East AP', severity: 'Low', status: 'Resolved', occurredAt: 'Aug 27, 22:30' },
];

export function IncidentHistoryPage() {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = INCIDENTS_RAW.filter((inc) => {
    const matchesSev = severityFilter === 'All' || inc.severity === severityFilter;
    const matchesSearch =
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.rootCause.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Title Header with Filters Bar (Exact Reference Match) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              Incident History
            </h1>
            <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
              Search, filter and analyze past network incidents.
            </p>
          </div>

          {/* Filter Bar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Severity Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  padding: '8px 28px 8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(25, 28, 38, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F7',
                  fontSize: '12px',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Severity</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#A3A6B3' }} />
            </div>

            {/* Date Range Picker Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(25, 28, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#A3A6B3',
                fontSize: '12px',
              }}
            >
              <Calendar size={14} color="#FF7A18" />
              <span>Aug 1, 2025 - Aug 31, 2025</span>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6A6D7C' }} />
              <input
                type="text"
                placeholder="Search by ID, root cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: '8px',
                  background: 'rgba(25, 28, 38, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F7',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards (Exact Reference Match) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <GlassCard variant="default" style={{ padding: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#F5F5F7' }}>124</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Total Incidents</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>48%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Resolved</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#A855F7' }}>32%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3' }}>In Progress</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF7A18' }}>20%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Open</div>
          </GlassCard>
        </div>

        {/* 2 Charts Row: Incident Trend & Root Cause Donut (Exact Reference Match) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px' }}>
          {/* Incident Trend (Last 30 Days) */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Incident Trend (Last 30 Days)</h3>
              <span style={{ fontSize: '11px', color: '#A855F7' }}>Peak: Aug 29 (+12)</span>
            </div>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #A855F7', fontSize: '11px', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2.5} fill="url(#trend-fill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Root Cause Distribution Donut Chart */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '10px' }}>Root Cause Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Donut Canvas */}
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DONUT_DATA} innerRadius={42} outerRadius={60} dataKey="value" stroke="none">
                      {DONUT_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#F5F5F7' }}>124</span>
                  <span style={{ fontSize: '9px', color: '#A3A6B3', textTransform: 'uppercase' }}>Incidents</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {DONUT_DATA.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                    <span style={{ color: '#F5F5F7' }}>{item.name}</span>
                    <span style={{ color: '#A3A6B3', marginLeft: 'auto', fontWeight: 600 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Incident Table (Exact Reference Match) */}
        <GlassCard variant="default" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>Incident Registry</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#A3A6B3', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>ID</th>
                  <th style={{ padding: '10px 14px' }}>Root Cause</th>
                  <th style={{ padding: '10px 14px' }}>Severity</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Occurred At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#38D9FF', fontFamily: 'monospace' }}>
                      {row.id}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#F5F5F7', fontWeight: 500 }}>
                      {row.rootCause}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: row.severity === 'High' ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 179, 71, 0.15)',
                          color: row.severity === 'High' ? '#FF4D4D' : '#FFB347',
                          border: `1px solid ${row.severity === 'High' ? 'rgba(255, 77, 77, 0.4)' : 'rgba(255, 179, 71, 0.4)'}`,
                        }}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: row.status === 'Resolved' ? '#10B981' : '#A855F7',
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#A3A6B3', fontFamily: 'monospace', fontSize: '11px' }}>
                      {row.occurredAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
