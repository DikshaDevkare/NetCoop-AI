import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Global3DEnvironment } from '../../components/three/Global3DEnvironment.tsx';
import { GlowButton } from '../../components/ui/GlowButton.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';

export function SignupPage() {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('Elena Rostova');
  const [email, setEmail] = useState('elena.r@carrier-network.com');
  const [password, setPassword] = useState('••••••••••••');
  const [organization, setOrganization] = useState('Global Telecom Backbone ASN-1290');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in all required operational profile fields');
      return;
    }
    setError(null);
    await signup(name, email, password);
    navigate('/dashboard');
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
      <Global3DEnvironment preset="network" />

      {/* Atmospheric Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '20%',
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
          bottom: '20%',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 217, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}
      >
        <GlassCard
          variant="elevated"
          style={{
            padding: '38px 36px',
            border: '1px solid rgba(255, 122, 24, 0.3)',
            boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px -4px rgba(255, 122, 24, 0.2)',
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF9436, #FF7A18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(255, 122, 24, 0.6)',
                }}
              >
                <Activity size={22} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#F5F5F7' }}>
                NetCoop <span style={{ color: '#FF7A18' }}>AI</span>
              </span>
            </Link>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
              Provision Operator Credentials
            </h2>
            <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
              Register your organization to join the autonomous multi-agent quorum
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Engineer / Operator Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3A6B3' }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Corporate Infrastructure Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3A6B3' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.r@carrier-network.com"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Organization / Fabric Tenant */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Organization & Autonomous System (ASN)
              </label>
              <div style={{ position: 'relative' }}>
                <Building
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3A6B3' }}
                />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Global Telecom Backbone ASN-1290"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Cryptographic Passphrase
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A3A6B3' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    background: 'rgba(17, 19, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#F5F5F7',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              style={{ width: '100%', marginTop: '6px' }}
            >
              Provision & Enter Command Centre
            </GlowButton>
          </form>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: '#A3A6B3' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#FFB347', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
