import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Server,
  Share2,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/diagnosis', label: 'Run Diagnosis', icon: PlayCircle },
    { to: '/dashboard/topology', label: 'Network Topology', icon: Network },
    { to: '/dashboard/devices', label: 'Devices', icon: Server },
    { to: '/dashboard/incidents', label: 'Incidents', icon: AlertTriangle },
    { to: '/dashboard/reports', label: 'Reports', icon: FileText },
    { to: '/dashboard/agents', label: 'Agents', icon: Share2 },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const content = (
    <div
      className={`h-full flex flex-col justify-between bg-[#080B10]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A24] to-[#20D9FF] p-[1.5px] shrink-0">
              <div className="w-full h-full bg-[#080B10] rounded-[10px] flex items-center justify-center">
                <Network className="w-4 h-4 text-[#FF8A24]" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <span className="text-base font-extrabold tracking-wider text-[#F4F6FA]">
                  NETCOOP <span className="text-[#FF8A24]">AI</span>
                </span>
                <span className="text-[10px] text-[#A2ACBA] font-mono block -mt-0.5">
                  NOC COMMAND v1.0
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg glass-panel hover:text-[#FF8A24] text-[#A2ACBA] transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF8A24]/20 to-[#20D9FF]/10 border border-[#FF8A24]/40 text-[#FF8A24] font-bold shadow-sm'
                      : 'text-[#A2ACBA] hover:text-[#F4F6FA] hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Landing Page Shortcut */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#A2ACBA] hover:text-[#20D9FF] hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Landing Portal</span>}
        </Link>

        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-[#A2ACBA]">
            <div className="flex items-center justify-between text-[#26D7A0] mb-0.5">
              <span>PROTOCOL v1.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            </div>
            <span>5-Agent Consensus Core</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-30 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
}
