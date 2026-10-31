import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { IncidentTable } from '../../components/incident/IncidentTable.tsx';
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
  { name: 'Interface Failure', value: 24, color: '#38D9FF' },
  { name: 'DNS/DHCP', value: 16, color: '#A855F7' },
  { name: 'Device Overload', value: 12, color: '#FFB347' },
  { name: 'Other', value: 10, color: '#6A6D7C' },
];

export function IncidentHistoryPage() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
                <option value="all">All Severity</option>
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
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards (Exact Reference Match) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <GlassCard variant="default" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#F5F5F7', lineHeight: 1 }}>124</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3', marginTop: '6px' }}>Total Incidents</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>48%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3', marginTop: '6px' }}>Resolved</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#A855F7', lineHeight: 1 }}>32%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3', marginTop: '6px' }}>In-Progress</div>
          </GlassCard>

          <GlassCard variant="default" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF7A18', lineHeight: 1 }}>20%</div>
            <div style={{ fontSize: '12px', color: '#A3A6B3', marginTop: '6px' }}>Open</div>
          </GlassCard>
        </div>

        {/* Middle Row: Trend Chart & Donut Chart (Exact Reference Match) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '20px' }}>
          {/* Incident Trend (Last 30 Days) */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>
              Incident Trend (Last 30 Days)
            </h3>
            <div style={{ width: '100%', height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #A855F7', fontSize: '12px', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6A6D7C', marginTop: '4px' }}>
              <span>Aug 1</span>
              <span>Aug 8</span>
              <span>Aug 15</span>
              <span>Aug 22</span>
              <span>Aug 29</span>
            </div>
          </GlassCard>

          {/* Root Cause Distribution Donut Chart */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>
              Root Cause Distribution
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Donut Chart with Total Counter in Center */}
              <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DONUT_DATA} innerRadius={44} outerRadius={66} dataKey="value" stroke="none">
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#F5F5F7', lineHeight: 1 }}>124</span>
                  <span style={{ fontSize: '9px', color: '#A3A6B3' }}>Incidents</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', flex: 1 }}>
                {DONUT_DATA.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: item.color }} />
                      <span style={{ color: '#A3A6B3' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#F5F5F7' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Incident Table Component */}
        <IncidentTable searchQuery={searchQuery} selectedSeverity={severityFilter} />
      </div>
    </AppLayout>
  );
}
