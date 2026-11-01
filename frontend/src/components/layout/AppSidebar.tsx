import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  TriangleAlert,
  Users,
  FileText,
  Clock3,
  Layers3,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface AppSidebarProps {
  backendConnected?: boolean;
  backendVersion?: string;
  mobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  backendConnected = false,
  backendVersion,
  mobileMenuOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Diagnosis', path: '/new-diagnosis', icon: FilePlus2 },
    { label: 'Incident Details', path: '/incident-details', icon: TriangleAlert },
    { label: 'Agent Monitor', path: '/agent-monitor', icon: Users },
    { label: 'Diagnosis Report', path: '/diagnosis-report', icon: FileText },
    { label: 'Incident History', path: '/incident-history', icon: Clock3 },
    { label: 'Interop Lab', path: '/interop-lab', icon: Layers3 },
  ];

  return (
    <aside
      style={{
        width: '230px',
        flexShrink: 0,
        backgroundColor: '#0A0C12',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
      }}
      className={cn('app-sidebar', mobileMenuOpen && 'sidebar-open')}
    >
      <div>
        {/* Brand Header: NETCOOP AI with small orange rounded-square emblem */}
        <Link
          to="/"
          onClick={onCloseMobile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '22px 20px',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF9A24, #FF6A16)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(255, 106, 22, 0.45)',
            }}
          >
            <Activity size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#F4F4F7', letterSpacing: '-0.02em' }}>
              NETCOOP <span style={{ color: '#FF9A24' }}>AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Items (Exact 7 reference screens) */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive: linkActive }) => {
                  const active = linkActive || isActive;
                  return {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#FFFFFF' : '#A0A3B1',
                    background: active
                      ? 'linear-gradient(135deg, #FF9A24 0%, #FF6A16 60%, #C94C0A 100%)'
                      : 'transparent',
                    border: active ? '1px solid rgba(255, 154, 36, 0.5)' : '1px solid transparent',
                    boxShadow: active
                      ? '0 0 18px -2px rgba(255, 106, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                      : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  };
                }}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith(item.path)) {
                    e.currentTarget.style.color = '#F4F4F7';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith(item.path)) {
                    e.currentTarget.style.color = '#A0A3B1';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: System Online Status & Quorum */}
      <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#21D69A',
              boxShadow: '0 0 8px #21D69A',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#F4F4F7' }}>
            System Online
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#6A6D7C', marginTop: '4px', letterSpacing: '0.02em' }}>
          {backendConnected && backendVersion
            ? `FastAPI v${backendVersion} • Quorum 5/5`
            : 'Multi-Agent Quorum 5/5 Active'}
        </div>
      </div>
    </aside>
  );
}
