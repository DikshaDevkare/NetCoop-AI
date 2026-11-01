import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  RotateCw,
  Bell,
  Globe,
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const location = useLocation();
  const {
    isLiveBackend,
    lastUpdated,
    isLoading,
    fetchData,
    notifications,
    earthRotation,
    toggleEarthRotation,
  } = useDashboardStore();

  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb title
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle =
    pathParts.length > 1
      ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
      : 'Command Center';

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-[#05080D]/85 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl glass-panel text-[#A2ACBA] hover:text-[#F4F6FA] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A2ACBA]">
            <span>NetCoop AI</span>
            <span>/</span>
            <span className="text-[#FF8A24] font-semibold">{pageTitle}</span>
          </div>
          <h1 className="text-lg font-bold text-[#F4F6FA] leading-tight">
            {pageTitle === 'Command Center'
              ? 'Network Operations Command Center'
              : pageTitle === 'Topology'
              ? '3D Campus Infrastructure Topology'
              : pageTitle === 'Devices'
              ? 'Network Hardware Inventory & Telemetry'
              : pageTitle === 'Agents'
              ? 'Multi-Agent Intelligence Council'
              : pageTitle === 'Diagnosis'
              ? 'Run Multi-Agent Network Diagnosis'
              : pageTitle === 'Reports'
              ? 'NOC Diagnostic Reports & Analytics'
              : pageTitle === 'Telemetry'
              ? 'Time-Series Telemetry Analytics'
              : pageTitle === 'Incidents'
              ? 'Active Network Incidents & Anomalies'
              : 'Platform System Settings'}
          </h1>
        </div>
      </div>

      {/* Right: Earth Rotation Toggle, Operational Status, Backend Indicator & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Genuine 3D Earth Rotation Toggle */}
        <button
          onClick={toggleEarthRotation}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
            earthRotation
              ? 'bg-[#20D9FF]/10 text-[#20D9FF] border-[#20D9FF]/40 shadow-sm'
              : 'glass-panel text-[#A2ACBA] hover:text-[#F4F6FA]'
          }`}
          title="Toggle 3D Earth Background Continuous Rotation"
        >
          <Globe className={`w-3.5 h-3.5 ${earthRotation ? 'animate-spin' : ''}`} style={{ animationDuration: '12s' }} />
          <span className="hidden sm:inline">Rotation: {earthRotation ? 'ON' : 'OFF'}</span>
          <span className="sm:hidden">{earthRotation ? '3D ON' : '3D OFF'}</span>
        </button>

        {/* Live Backend vs Demo Mode Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
            isLiveBackend
              ? 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30'
              : 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30'
          }`}
          title={
            isLiveBackend
              ? 'FastAPI Backend Online at http://127.0.0.1:8000'
              : 'Backend is offline or unreachable. Using interactive demo fallback data.'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveBackend
                ? 'bg-[#26D7A0] animate-pulse'
                : 'bg-[#FFB547]'
            }`}
          />
          <span className="hidden lg:inline">
            {isLiveBackend ? 'LIVE BACKEND' : 'DEMO MODE'}
          </span>
          <span className="lg:hidden">
            {isLiveBackend ? 'LIVE' : 'DEMO'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchData()}
          disabled={isLoading}
          className="p-2 rounded-xl glass-panel text-[#A2ACBA] hover:text-[#FF8A24] hover:border-[#FF8A24]/30 transition-all cursor-pointer"
          title={`Last updated: ${lastUpdated}. Click to refresh.`}
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF8A24]' : ''}`} />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl glass-panel text-[#A2ACBA] hover:text-[#20D9FF] hover:border-[#20D9FF]/30 transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4D5A] ring-2 ring-[#05080D]" />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl z-50 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
                <span className="text-[#F4F6FA] font-bold">SYSTEM NOTIFICATIONS</span>
                <span className="text-[#A2ACBA]">{unreadCount} Unread</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-[#F4F6FA]">{notif.title}</span>
                      <span className="text-[10px] text-[#A2ACBA]">{notif.timestamp}</span>
                    </div>
                    <p className="text-[#A2ACBA] text-[11px] leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
