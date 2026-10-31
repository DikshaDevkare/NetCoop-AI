import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Layers } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton.tsx';

export function LandingHeader() {
  const headerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 36px',
    background: 'rgba(8, 9, 13, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: '5-Agent Architecture', href: '#architecture' },
    { label: 'Platform Capabilities', href: '#capabilities' },
    { label: 'Use Cases', href: '#use-cases' },
  ];

  return (
    <header style={headerStyle}>
      {/* Brand Identity */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF9436 0%, #FF7A18 50%, #E65A00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 0 20px -2px rgba(255, 122, 24, 0.65)',
          }}
        >
          <Activity size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#F5F5F7' }}>
              NetCoop <span style={{ color: '#FF7A18' }}>AI</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 122, 24, 0.15)',
                color: '#FFB347',
                border: '1px solid rgba(255, 122, 24, 0.3)',
              }}
            >
              AUTONOMOUS
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#A3A6B3', letterSpacing: '0.02em' }}>
            Multi-Agent Network Intelligence
          </span>
        </div>
      </Link>

      {/* Navigation Pill Menu */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(25, 28, 38, 0.6)',
          padding: '4px 8px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#A3A6B3',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '9999px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5F5F7';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A3A6B3';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right Action CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/design-system" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              color: '#A3A6B3',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5F5F7';
              e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.4)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A3A6B3';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Layers size={14} />
            <span>Design System</span>
          </button>
        </Link>

        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <GlowButton variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
            Launch Command Centre
          </GlowButton>
        </Link>
      </div>
    </header>
  );
}
