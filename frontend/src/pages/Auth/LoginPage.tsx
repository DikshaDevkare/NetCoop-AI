import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Global3DEnvironment } from '../../components/three/Global3DEnvironment.tsx';
import { GlowButton } from '../../components/ui/GlowButton.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.vance@netcoop.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid operator email address');
      return;
    }
    setError(null);
    await login(email, password);
    navigate('/dashboard');
  };

  const handleDemoFill = () => {
    setEmail('ops.director@netcoop.internal');
    setPassword('autonomous-quorum-2026');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#08090D',
        color: '#F5F5F7',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* 3D Ambient Canvas in background */}
      <Global3DEnvironment preset="orchestration" />

      {/* Atmospheric Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 122, 24, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}
      >
        <GlassCard
          variant="elevated"
          style={{
            padding: '40px 36px',
            border: '1px solid rgba(255, 122, 24, 0.3)',
            boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px -4px rgba(255, 122, 24, 0.2)',
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF9436, #FF7A18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(255, 122, 24, 0.6)',
                }}
              >
                <Activity size={24} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#F5F5F7' }}>
                NetCoop <span style={{ color: '#FF7A18' }}>AI</span>
              </span>
            </Link>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F5F5F7', marginBottom: '6px' }}>
              Operator Authentication
            </h2>
            <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
              Access the multi-agent network diagnosis command centre
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(255, 77, 77, 0.15)',
                border: '1px solid rgba(255, 77, 77, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#FF7A18',
                marginBottom: '18px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Operator Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#A3A6B3',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 122, 24, 0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3' }}>
                  Cryptographic Token / Key
                </label>
                <span
                  style={{ fontSize: '11px', color: '#FFB347', cursor: 'pointer' }}
                  onClick={handleDemoFill}
                >
                  Fill Demo Key
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#A3A6B3',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 122, 24, 0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#A3A6B3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              style={{ width: '100%', marginTop: '6px' }}
            >
              Sign In to Command Centre
            </GlowButton>
          </form>

          {/* Quick Demo Switcher */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#10B981' }}>
              <ShieldCheck size={14} />
              <span>Simulated Multi-Agent JWT Quorum Active</span>
            </div>

            <div style={{ fontSize: '13px', color: '#A3A6B3' }}>
              New operator node?{' '}
              <Link to="/signup" style={{ color: '#FFB347', textDecoration: 'none', fontWeight: 600 }}>
                Provision Access
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
