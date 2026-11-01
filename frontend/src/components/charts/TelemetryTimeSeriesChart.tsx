import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface TelemetryDataPoint {
  time: string;
  value: number;
  baseline?: number;
}

interface TelemetryTimeSeriesChartProps {
  data: TelemetryDataPoint[];
  metricName: string;
  metricLabel: string;
  unit: string;
  color?: string;
  height?: number;
}

export function TelemetryTimeSeriesChart({
  data,
  metricName,
  metricLabel,
  unit,
  color = '#FF8A24',
  height = 280,
}: TelemetryTimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-[#A2ACBA]"
        style={{ height }}
      >
        <span>No historical telemetry records available for this observation window.</span>
      </div>
    );
  }

  const gradientId = `gradient-${metricName}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

          <XAxis
            dataKey="time"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            fontFamily="monospace"
          />

          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            fontFamily="monospace"
            tickFormatter={(val) => `${val}${unit}`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#10151D',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#F4F6FA',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            formatter={(value: any) => [`${value} ${unit}`, metricLabel]}
            labelStyle={{ color: '#A2ACBA', marginBottom: '4px' }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
