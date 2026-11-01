import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'healthy' | 'warning' | 'critical' | 'neutral';
  icon: LucideIcon;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  status = 'neutral',
  icon: Icon,
}: MetricCardProps) {
  let statusColor = 'text-[#F4F6FA]';
  let badgeColor = 'bg-white/5 text-[#A2ACBA] border-white/10';

  if (status === 'healthy') {
    statusColor = 'text-[#26D7A0]';
    badgeColor = 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30';
  } else if (status === 'warning') {
    statusColor = 'text-[#FFB547]';
    badgeColor = 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30';
  } else if (status === 'critical') {
    statusColor = 'text-[#FF4D5A]';
    badgeColor = 'bg-[#FF4D5A]/10 text-[#FF4D5A] border-[#FF4D5A]/30';
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[#A2ACBA]">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FF8A24]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${statusColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[#A2ACBA] font-normal">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
        <span className="text-[#A2ACBA] truncate">{subtitle || 'Nominal telemetry'}</span>
        {trend && (
          <span className={`px-2 py-0.5 rounded-md border ${badgeColor}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
