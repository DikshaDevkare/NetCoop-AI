import { useState } from 'react';
import { Search, Bell, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function AppHeader({ mobileMenuOpen, onToggleMobileMenu }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
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
        onClick={onToggleMobileMenu}
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          color: '#F5F5F7',
          cursor: 'pointer',
          marginRight: 'auto',
        }}
        className="mobile-toggle"
        aria-label="Toggle Navigation"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Global Search Bar (Exact Reference Match) */}
      <div
        style={{
          position: 'relative',
          width: '280px',
        }}
        className="header-search"
      >
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
            padding: '7px 12px 7px 34px',
            borderRadius: '8px',
            backgroundColor: 'rgba(25, 28, 38, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#F5F5F7',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 122, 24, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 122, 24, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Notifications Button & Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileMenu(false);
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(25, 28, 38, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#A3A6B3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
          aria-label="View notifications"
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#FF7A18',
              boxShadow: '0 0 6px #FF7A18',
            }}
          />
        </button>

        {showNotifications && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '300px',
              background: '#11131A',
              border: '1px solid rgba(255, 122, 24, 0.25)',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 122, 24, 0.15)',
              padding: '14px',
              zIndex: 50,
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7', marginBottom: '10px' }}>
              Notifications (3)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A18' }}>INC-1024 Alert</div>
                <div style={{ fontSize: '11px', color: '#A3A6B3' }}>High congestion on SW-03 Building A</div>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(56, 217, 255, 0.08)', border: '1px solid rgba(56, 217, 255, 0.15)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#38D9FF' }}>Agent Quorum</div>
                <div style={{ fontSize: '11px', color: '#A3A6B3' }}>5 agents synchronized on mesh</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Avatar & Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowProfileMenu(!showProfileMenu);
            setShowNotifications(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF7A18, #A855F7)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              color: '#FFFFFF',
              boxShadow: '0 0 12px rgba(255, 122, 24, 0.3)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </button>

        {showProfileMenu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '210px',
              background: '#11131A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              padding: '12px',
              zIndex: 50,
            }}
          >
            <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>{user?.name || 'Network Operator'}</div>
              <div style={{ fontSize: '11px', color: '#6A6D7C' }}>{user?.email || 'admin@netcoop.ai'}</div>
              <div style={{ fontSize: '10px', color: '#FF7A18', fontWeight: 600, marginTop: '2px' }}>Role: {user?.role || 'Senior Analyst'}</div>
            </div>

            <button
              onClick={() => navigate('/design-system')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: '#A3A6B3',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#F5F5F7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#A3A6B3';
              }}
            >
              <Sparkles size={14} color="#A855F7" />
              <span>Design System Preview</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: '#FF4D4D',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
