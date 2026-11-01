import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import type { IncidentItem } from '../types/api';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export function IncidentsPage() {
  const { incidents } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(
    incidents[0] || null
  );

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incident_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.affected_devices.some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSeverity =
      severityFilter === 'all' || inc.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF4D5A] mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>INCIDENT OBSERVATIONS // CORRELATION LEDGER</span>
          </div>
          <h2 className="text-2xl font-black text-[#F4F6FA]">
            Active &amp; Historical Network Incidents
          </h2>
          <p className="text-xs text-[#A2ACBA] mt-1">
            Track multi-agent incident detections, impacted network segments, and
            correlated root cause timelines across campus hardware.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#FFB45C]">
            {filteredIncidents.length} Records Tracked
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A2ACBA] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search incident ID, type, device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#F4F6FA] placeholder-[#A2ACBA]/60 focus:outline-none focus:border-[#FF8A24]"
          />
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-[#A2ACBA]" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-[#F4F6FA] w-full focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#10151D]">
              All Severities
            </option>
            <option value="critical" className="bg-[#10151D] text-[#FF4D5A]">
              Critical Only
            </option>
            <option value="warning" className="bg-[#10151D] text-[#FFB547]">
              Warning Only
            </option>
            <option value="informational" className="bg-[#10151D] text-[#20D9FF]">
              Informational Only
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[#A2ACBA]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-[#F4F6FA] w-full focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#10151D]">
              All Statuses
            </option>
            <option value="INVESTIGATING" className="bg-[#10151D]">
              Investigating
            </option>
            <option value="OPEN" className="bg-[#10151D]">
              Open
            </option>
            <option value="RESOLVED" className="bg-[#10151D]">
              Resolved
            </option>
          </select>
        </div>
      </div>

      {/* Main Content Split: Incident Ledger List + Incident Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredIncidents.map((inc) => {
            const isSelected = selectedIncident?.incident_id === inc.incident_id;
            let severityBadge = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
            if (inc.severity === 'warning') {
              severityBadge = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
            } else if (inc.severity === 'informational') {
              severityBadge = 'bg-[#20D9FF]/10 text-[#20D9FF] border-[#20D9FF]/30';
            }

            return (
              <div
                key={inc.incident_id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'glass-panel-glow border-[#FF8A24]/60 shadow-xl'
                    : 'glass-panel border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${severityBadge}`}>
                      {inc.severity.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#F4F6FA]">
                      {inc.incident_id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A2ACBA]">
                    {inc.start_time.replace('T', ' ').slice(0, 16)}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-[#FF8A24]">
                  {inc.incident_type}
                </div>

                <p className="text-xs text-[#A2ACBA] leading-relaxed">
                  {inc.description || 'Degradation detected across campus aggregation tier.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-[#A2ACBA]">
                    Impacted: <code className="text-[#20D9FF]">{inc.affected_devices.join(', ')}</code>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-[#A2ACBA]">
                    {inc.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Incident Detail Dossier */}
        <div className="lg:col-span-5">
          {selectedIncident ? (
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF4D5A]/10 text-[#FF4D5A] border border-[#FF4D5A]/30">
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-[#26D7A0] px-2 py-0.5 rounded bg-[#26D7A0]/10 border border-[#26D7A0]/30">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#F4F6FA]">
                    {selectedIncident.incident_id}
                  </h3>
                  <p className="text-xs font-mono text-[#FF8A24]">
                    {selectedIncident.incident_type}
                  </p>
                </div>
              </div>

              {/* Timestamp Audit */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#A2ACBA]">Detection Time:</span>
                  <span className="text-[#F4F6FA]">{selectedIncident.start_time}</span>
                </div>
                {selectedIncident.end_time && (
                  <div className="flex justify-between">
                    <span className="text-[#A2ACBA]">Resolved Time:</span>
                    <span className="text-[#26D7A0]">{selectedIncident.end_time}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A2ACBA]">Topology Scope:</span>
                  <span className="text-[#20D9FF]">device_local</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#A2ACBA] block">
                  INCIDENT SUMMARY:
                </span>
                <p className="text-xs text-[#F4F6FA]/90 leading-relaxed">
                  {selectedIncident.description || 'Elevated traffic volume exceeding configured bandwidth threshold.'}
                </p>
              </div>

              {/* Affected Hardware */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-[#A2ACBA] block">
                  IMPACTED CAMPUS NODES:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.affected_devices.map((dev) => (
                    <span
                      key={dev}
                      className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#20D9FF]"
                    >
                      {dev}
                    </span>
                  ))}
                </div>
              </div>

              {/* Phase 3 Scope Notice */}
              <div className="p-3.5 rounded-2xl bg-[#FF8A24]/10 border border-[#FF8A24]/20 text-[11px] font-mono text-[#FFB45C] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF8A24]" />
                  <span>DIAGNOSTIC PIPELINE NOTE</span>
                </div>
                <p>
                  Interactive execution of full 5-agent diagnosis, ML inference replay,
                  and automated runbook generation will be introduced in Phase 3.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl glass-panel border border-white/5 text-center text-xs font-mono text-[#A2ACBA]">
              Select an incident from the ledger to view correlation details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
