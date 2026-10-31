import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { GlowButton } from '../ui/GlowButton.tsx';

export function CtaSection() {
  return (
    <section
      style={{
        padding: '60px 24px 100px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <GlassCard
        variant="elevated"
        style={{
          padding: '56px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 122, 24, 0.35)',
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 36px -4px rgba(255, 122, 24, 0.25)',
        }}
      >
        {/* Radial Warm Glow Backing */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(255, 122, 24, 0.18) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 122, 24, 0.15)',
              border: '1px solid rgba(255, 122, 24, 0.35)',
              color: '#FFB347',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} />
            <span>Phase 2 • Cinematic Foundation Live</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#F5F5F7',
              marginBottom: '16px',
            }}
          >
            Step into the Future of{' '}
            <span className="gradient-ember-text">Autonomous Network Operations</span>
          </h2>

          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#A3A6B3',
              maxWidth: '680px',
              margin: '0 auto 36px',
            }}
          >
            Deploy cooperative multi-agent intelligence across your network. Eliminate alert fatigue,
            accelerate root-cause isolation by 10x, and safeguard carrier-grade uptime.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/design-system" style={{ textDecoration: 'none' }}>
              <GlowButton variant="primary" size="lg" icon={Layers} iconPosition="left">
                Explore Design System
              </GlowButton>
            </Link>

            <a href="#overview" style={{ textDecoration: 'none' }}>
              <GlowButton variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
                Back to Top
              </GlowButton>
            </a>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
