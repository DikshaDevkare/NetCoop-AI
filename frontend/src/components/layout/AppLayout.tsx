import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  Layers,
  Search,
  Bell,
  LogOut,
  Activity,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { checkBackendHealth } from '../../services/healthService.ts';
import { cn } from '../../lib/utils.ts';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; version?: string }>({
    connected: false,
  });

  useEffect(() => {
    checkBackendHealth().then((res) => {
      if (res.connected && res.data) {
        setBackendStatus({ connected: true, version: res.data.version });
      }
    });
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Diagnosis', path: '/new-diagnosis', icon: FilePlus },
    { label: 'Incident Details', path: '/incident-details', icon: AlertTriangle },
    { label: 'Agent Monitor', path: '/agent-monitor', icon: Users },
    { label: 'Diagnosis Report', path: '/diagnosis-report', icon: FileText },
    { label: 'Incident History', path: '/incident-history', icon: Clock },
    { label: 'Interop Lab', path: '/interop-lab', icon: Layers },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#08090D',
        color: '#F5F5F7',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ATMOSPHERIC BACKGROUND EFFECTS (Purple reflections & Orange Horizon Light Trails) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '420px',
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(168, 85, 247, 0.16) 0%, rgba(255, 122, 24, 0.08) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle at 100% 100%, rgba(255, 122, 24, 0.1) 0%, rgba(168, 85, 247, 0.06) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* LEFT NAVIGATION SIDEBAR (EXACT MATCH TO REFERENCE) */}
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
          {/* Brand Header */}
          <Link
            to="/"
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
                background: 'linear-gradient(135deg, #FF9436, #FF7A18)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(255, 122, 24, 0.5)',
              }}
            >
              <Activity size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#F5F5F7', letterSpacing: '-0.02em' }}>
                NetCoop <span style={{ color: '#FF7A18' }}>AI</span>
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
                      color: active ? '#FFFFFF' : '#A3A6B3',
                      background: active
                        ? 'linear-gradient(135deg, #FF9436 0%, #FF7A18 60%, #E65A00 100%)'
                        : 'transparent',
                      border: active ? '1px solid rgba(255, 179, 71, 0.5)' : '1px solid transparent',
                      boxShadow: active
                        ? '0 0 18px -2px rgba(255, 122, 24, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                        : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    };
                  }}
                  onMouseEnter={(e) => {
                    if (!location.pathname.startsWith(item.path)) {
                      e.currentTarget.style.color = '#F5F5F7';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!location.pathname.startsWith(item.path)) {
                      e.currentTarget.style.color = '#A3A6B3';
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

        {/* Sidebar Footer: System Online Status & Backend Indicator */}
        <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: backendStatus.connected ? '#10B981' : '#38D9FF',
                boxShadow: `0 0 8px ${backendStatus.connected ? '#10B981' : '#38D9FF'}`,
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F7' }}>
              {backendStatus.connected ? `FastAPI v${backendStatus.version}` : 'System Online'}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#6A6D7C', marginTop: '4px', letterSpacing: '0.02em' }}>
            {backendStatus.connected ? 'Connected to /api/health' : 'Multi-Agent Quorum 5/5 Active'}
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT (HEADER + CONTENT) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* TOP HEADER BAR (EXACT REFERENCE MATCH) */}
        <header
          style={{
            height: '64px',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
            backgroundColor: 'rgba(8, 9, 13, 0.75)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#F5F5F7',
              cursor: 'pointer',
              marginRight: 'auto',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search Network Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6A6D7C',
              }}
            />
            <input
              type="text"
              placeholder="Search network, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 34px',
                borderRadius: '8px',
                background: 'rgba(25, 28, 38, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#F5F5F7',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 122, 24, 0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            />
          </div>

          {/* Notification Icon Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(25, 28, 38, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#A3A6B3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Bell size={16} />
              {/* Incident Alert Pill */}
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#FF7A18',
                  boxShadow: '0 0 6px #FF7A18',
                }}
              />
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  background: 'rgba(17, 19, 26, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 122, 24, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                  padding: '16px',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F7' }}>Open Incidents</span>
                  <span style={{ fontSize: '11px', color: '#FF7A18', fontWeight: 600 }}>1 Active</span>
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 122, 24, 0.1)',
                    border: '1px solid rgba(255, 122, 24, 0.25)',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F7', marginBottom: '2px' }}>
                    Incident #INC-1024 • High
                  </div>
                  <div style={{ fontSize: '11px', color: '#A3A6B3' }}>
                    Network congestion on SW-03 (Building A) detected.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Status Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(25, 28, 38, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '4px 10px 4px 4px',
                borderRadius: '9999px',
                cursor: 'pointer',
              }}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name || 'Operator'}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F7' }}>
                {user?.name || 'Alex Vance'}
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '240px',
                  background: 'rgba(17, 19, 26, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                  padding: '16px',
                  zIndex: 50,
                }}
              >
                <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F7' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#A3A6B3' }}>{user?.email}</div>
                  <div style={{ fontSize: '10px', color: '#FFB347', marginTop: '4px' }}>{user?.role}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to="/design-system"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#A3A6B3',
                      textDecoration: 'none',
                      padding: '6px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Sparkles size={14} color="#FFB347" />
                    <span>Design System Tokens</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#FF7A18',
                      background: 'transparent',
                      border: 'none',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Disconnect Operator</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
