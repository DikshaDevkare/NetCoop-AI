import type { CSSProperties } from 'react';
import { Activity, Layers, Sparkles } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge.tsx';

export function Header() {
  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
    background: 'rgba(8, 9, 13, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
  };

  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Brand Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF9436 0%, #FF7A18 50%, #E65A00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 0 16px -2px rgba(255, 122, 24, 0.6)',
          }}
        >
          <Activity size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F5F5F7' }}>
              NETCOOP AI
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 179, 71, 0.15)',
                color: '#FFB347',
                border: '1px solid rgba(255, 179, 71, 0.3)',
              }}
            >
              PHASE 1
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#A3A6B3', letterSpacing: '0.01em' }}>
            Multi-Agent Neural Diagnostics Platform
          </span>
        </div>
      </div>

      {/* Center Nav Pill */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(25, 28, 38, 0.6)',
          padding: '4px 8px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <a
          href="#design-tokens"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#A3A6B3',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '9999px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F5F5F7';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#A3A6B3';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Tokens
        </a>
        <a
          href="#components"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#A3A6B3',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '9999px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F5F5F7';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#A3A6B3';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Components
        </a>
        <a
          href="#3d-environment"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFB347',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(255, 179, 71, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Sparkles size={12} />
          3D Canvas
        </a>
      </nav>

      {/* Right Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <StatusBadge status="active" label="Obsidian Ember" size="sm" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#A3A6B3',
          }}
        >
          <Layers size={14} />
          <span>v0.1.0-alpha</span>
        </div>
      </div>
    </header>
  );
}
