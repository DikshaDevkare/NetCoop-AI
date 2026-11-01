import { Link } from 'react-router-dom';
import { FIVE_AGENTS } from '../../utils/mockTopology';
import { Share2, ArrowRight } from 'lucide-react';

export function AgentCouncilStatus() {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Share2 className="w-4 h-4 text-[#FF8A24]" />
          <h3 className="text-sm font-mono font-bold text-[#F4F6FA] uppercase tracking-wider">
            5-Agent Intelligence Council
          </h3>
        </div>
        <Link
          to="/dashboard/agents"
          className="text-xs font-mono text-[#20D9FF] hover:underline flex items-center gap-1"
        >
          <span>Deep Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {FIVE_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all space-y-2 text-left"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${agent.accentColor}20`,
                  color: agent.accentColor,
                  border: `1px solid ${agent.accentColor}40`,
                }}
              >
                {agent.codename}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            </div>

            <div className="text-xs font-bold text-[#F4F6FA] truncate">
              {agent.name.split(' ')[0]} Agent
            </div>

            <div className="text-[10px] text-[#A2ACBA] line-clamp-2 leading-tight">
              {agent.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
