import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export function RecentIncidentsWidget() {
  const { incidents } = useDashboardStore();

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#FF4D5A]" />
          <h3 className="text-sm font-mono font-bold text-[#F4F6FA] uppercase tracking-wider">
            Active Incidents &amp; Anomalies
          </h3>
        </div>
        <Link
          to="/dashboard/incidents"
          className="text-xs font-mono text-[#20D9FF] hover:underline flex items-center gap-1"
        >
          <span>All Incidents ({incidents.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {incidents.slice(0, 3).map((inc) => {
          let severityBadge = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
          if (inc.severity === 'warning') {
            severityBadge = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
          } else if (inc.severity === 'informational') {
            severityBadge = 'bg-[#20D9FF]/10 text-[#20D9FF] border-[#20D9FF]/30';
          }

          return (
            <div
              key={inc.incident_id}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${severityBadge}`}>
                    {inc.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F4F6FA]">
                    {inc.incident_id}
                  </span>
                  <span className="text-[10px] font-mono text-[#A2ACBA]">
                    {inc.incident_type}
                  </span>
                </div>
                <p className="text-xs text-[#A2ACBA] line-clamp-1">
                  {inc.description || 'Elevated packet loss and buffer queue drops.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <span className="text-[#A2ACBA]">
                  Impact: <strong className="text-[#20D9FF]">{inc.affected_devices.join(', ')}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-[#A2ACBA]">
                  {inc.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
