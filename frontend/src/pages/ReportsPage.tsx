import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  FileText,
  Download,
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Share2,
} from 'lucide-react';

const WEEKLY_INCIDENTS_DATA = [
  { day: 'Mon', congestion: 4, wifi: 6, hardware: 1, dns: 2 },
  { day: 'Tue', congestion: 7, wifi: 4, hardware: 2, dns: 1 },
  { day: 'Wed', congestion: 12, wifi: 5, hardware: 0, dns: 3 },
  { day: 'Thu', congestion: 8, wifi: 7, hardware: 3, dns: 1 },
  { day: 'Fri', congestion: 15, wifi: 9, hardware: 2, dns: 4 },
  { day: 'Sat', congestion: 3, wifi: 2, hardware: 1, dns: 0 },
  { day: 'Sun', congestion: 2, wifi: 3, hardware: 0, dns: 1 },
];

const FAULT_DISTRIBUTION_DATA = [
  { name: 'Buffer Congestion', value: 38, color: '#FF8A24' },
  { name: 'Wi-Fi Coverage & Signal', value: 26, color: '#20D9FF' },
  { name: 'Hardware / CRC Errors', value: 18, color: '#FF4D5A' },
  { name: 'DNS / DHCP Services', value: 12, color: '#4A8DFF' },
  { name: 'Cable Degradation', value: 6, color: '#A855F7' },
];

const AGENT_CONTRIBUTION_DATA = [
  { agent: 'Telemetry', findings: 142, accuracy: 96.4, color: '#20D9FF' },
  { agent: 'Infra Health', findings: 118, accuracy: 94.8, color: '#FF8A24' },
  { agent: 'Connectivity', findings: 104, accuracy: 92.1, color: '#4A8DFF' },
  { agent: 'Correlation', findings: 148, accuracy: 95.9, color: '#A855F7' },
  { agent: 'Recommendation', findings: 148, accuracy: 98.2, color: '#26D7A0' },
];

const HISTORICAL_REPORTS = [
  {
    id: 'INC-1002',
    date: '2026-10-31 10:42:00',
    device: 'SW-DIST-01',
    cause: 'Core Distribution Switch Output Buffer Congestion',
    severity: 'critical',
    confidence: '94.2%',
    status: 'Resolved',
    mttr: '2.8m',
  },
  {
    id: 'INC-1003',
    date: '2026-10-30 16:15:22',
    device: 'AP-DORM-01',
    cause: 'Dormitory Weak Wi-Fi Coverage & Co-Channel Interference',
    severity: 'warning',
    confidence: '88.7%',
    status: 'Resolved',
    mttr: '4.1m',
  },
  {
    id: 'INC-1004',
    date: '2026-10-29 08:30:11',
    device: 'SW-ACCESS-01',
    cause: 'Access Switch Hardware CRC & Transceiver Error Storm',
    severity: 'critical',
    confidence: '96.1%',
    status: 'Resolved',
    mttr: '3.5m',
  },
  {
    id: 'INC-1005',
    date: '2026-10-28 14:02:45',
    device: 'SRV-DNS-01',
    cause: 'Internal DNS Worker Socket Exhaustion',
    severity: 'warning',
    confidence: '91.4%',
    status: 'Resolved',
    mttr: '1.9m',
  },
  {
    id: 'INC-1001',
    date: '2026-10-27 11:20:00',
    device: 'RTR-CORE-01',
    cause: 'Nominal Core Traffic Baseline Verification',
    severity: 'healthy',
    confidence: '99.1%',
    status: 'Nominal',
    mttr: '0.5m',
  },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredReports = HISTORICAL_REPORTS.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cause.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const [timeRange, setTimeRange] = useState('7d');

  const handleExportCSV = () => {
    const headers = ['INCIDENT_ID', 'TIMESTAMP', 'TARGET_NODE', 'DIAGNOSED_ROOT_CAUSE', 'CONFIDENCE', 'MTTR', 'STATUS'];
    const rows = filteredReports.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.device}"`,
      `"${r.cause.replace(/"/g, '""')}"`,
      `"${r.confidence}"`,
      `"${r.mttr}"`,
      `"${r.status}"`,
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetCoop_NOC_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Top Header matching SCREEN 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24] mb-1">
            <FileText className="w-4 h-4" />
            <span>NOC INTELLIGENCE &amp; AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-black text-[#F4F6FA]">
            Reports &amp; Analytics
          </h1>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Diagnosis reports, trends and network insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-[#F4F6FA] focus:outline-none focus:border-[#FF8A24] cursor-pointer"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#F4F6FA] glass-panel border border-white/10 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/dashboard/diagnosis')}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#05080D] shadow-lg shadow-[#FF8A24]/20 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            Run Diagnosis
          </button>
        </div>
      </div>

      {/* Top Row: Four Compact Metric Cards matching SCREEN 7 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Diagnoses */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span>Total Diagnoses</span>
            <Activity className="w-4 h-4 text-[#20D9FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F6FA]">148</div>
          <div className="text-[10px] font-mono text-[#26D7A0] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18% from last week
          </div>
        </div>

        {/* Card 2: Critical Incidents */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span>Critical Incidents</span>
            <ShieldCheck className="w-4 h-4 text-[#FF4D5A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF4D5A]">12</div>
          <div className="text-[10px] font-mono text-[#A2ACBA]">
            All isolated autonomously
          </div>
        </div>

        {/* Card 3: Average Confidence */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span>Average Confidence</span>
            <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F6FA]">93.4%</div>
          <div className="text-[10px] font-mono text-[#26D7A0]">
            5-agent Bayesian consensus
          </div>
        </div>

        {/* Card 4: Recovery Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2ACBA]">
            <span>Recovery Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#26D7A0]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#26D7A0]">95.9%</div>
          <div className="text-[10px] font-mono text-[#A2ACBA]">
            142 resolved autonomously
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Incidents Stacked Area Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
                Weekly Incident Trends by Category
              </h3>
              <p className="text-xs text-[#A2ACBA] font-mono mt-0.5">
                Distribution of network anomalies detected across campus devices
              </p>
            </div>
            <span className="text-xs font-mono text-[#FF8A24] px-2.5 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_INCIDENTS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A24" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#FF8A24" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWifi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20D9FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#20D9FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#A2ACBA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A2ACBA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080B10',
                    border: '1px solid #ffffff20',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="congestion" stroke="#FF8A24" fillOpacity={1} fill="url(#colorCongestion)" name="Congestion" />
                <Area type="monotone" dataKey="wifi" stroke="#20D9FF" fillOpacity={1} fill="url(#colorWifi)" name="Wi-Fi Signal" />
                <Area type="monotone" dataKey="hardware" stroke="#FF4D5A" fillOpacity={0.3} fill="#FF4D5A" name="Hardware" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Distribution Donut Chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
              Fault Root Cause Breakdown
            </h3>
            <p className="text-xs text-[#A2ACBA] font-mono mt-0.5">
              Historical distribution percentage
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FAULT_DISTRIBUTION_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {FAULT_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080B10',
                    border: '1px solid #ffffff20',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {FAULT_DISTRIBUTION_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#A2ACBA]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[#F4F6FA]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance & Consensus Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="text-sm font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
              Agent Diagnostic Accuracy &amp; Findings Volume
            </h3>
          </div>
          <span className="text-xs font-mono text-[#26D7A0] px-2.5 py-0.5 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30">
            5 Domains Audited
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={AGENT_CONTRIBUTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="agent" stroke="#A2ACBA" fontSize={11} tickLine={false} />
              <YAxis stroke="#A2ACBA" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#080B10',
                  border: '1px solid #ffffff20',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="findings" fill="#FF8A24" name="Audited Findings" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Diagnosis Reports Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#20D9FF]" />
            <h3 className="text-sm font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
              Diagnostic Audit Log &amp; Verified Reports
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A2ACBA]" />
              <input
                type="text"
                placeholder="Search incident, node..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#F4F6FA] placeholder-[#A2ACBA]/50 focus:outline-none focus:border-[#FF8A24]"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs font-mono">
              {['all', 'critical', 'warning', 'healthy'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-[#FF8A24]/20 text-[#FF8A24] font-bold'
                      : 'text-[#A2ACBA] hover:text-[#F4F6FA]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#A2ACBA] text-[11px]">
                <th className="py-3 px-3">INCIDENT</th>
                <th className="py-3 px-3">TIMESTAMP</th>
                <th className="py-3 px-3">TARGET NODE</th>
                <th className="py-3 px-3">DIAGNOSED ROOT CAUSE</th>
                <th className="py-3 px-3">CONFIDENCE</th>
                <th className="py-3 px-3">MTTR</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.map((row) => {
                const badgeColor =
                  row.severity === 'critical'
                    ? '#FF4D5A'
                    : row.severity === 'warning'
                    ? '#FFB547'
                    : '#26D7A0';

                return (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#FF8A24]">{row.id}</td>
                    <td className="py-3 px-3 text-[#A2ACBA]">{row.date}</td>
                    <td className="py-3 px-3 text-[#20D9FF] font-semibold">{row.device}</td>
                    <td className="py-3 px-3 text-[#F4F6FA] max-w-xs truncate">{row.cause}</td>
                    <td className="py-3 px-3 text-[#26D7A0] font-bold">{row.confidence}</td>
                    <td className="py-3 px-3 text-[#A2ACBA]">{row.mttr}</td>
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${badgeColor}20`,
                          color: badgeColor,
                          border: `1px solid ${badgeColor}40`,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/dashboard/diagnosis/${row.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#FF8A24]/20 border border-white/10 hover:border-[#FF8A24]/40 text-[#A2ACBA] hover:text-[#FF8A24] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
