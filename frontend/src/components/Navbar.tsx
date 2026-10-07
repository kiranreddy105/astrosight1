import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Orbit, Compass, User as UserIcon, LogOut, Sparkles, HelpCircle, Shield } from 'lucide-react';

interface Props {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenTour: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ onOpenAuth, onOpenTour, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(6, 9, 14, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
      }}
    >
      {/* Brand & Mission Logo */}
      <div
        onClick={() => setActiveTab && setActiveTab('portal')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #008dda 0%, #00e5ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#040810',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)',
          }}
        >
          <Orbit size={22} />
        </div>
        <div>
          <span
            className="font-display"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ASTROSIGHT
          </span>
          <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Planetary Surface Intelligence
          </div>
        </div>
      </div>

      {/* Telemetry Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(14, 21, 35, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#94a3b8',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span>ORBITAL NODE: <strong style={{ color: '#38bdf8' }}>ONLINE</strong></span>
          <span style={{ color: '#475569' }}>|</span>
          <span>LATENCY: <strong style={{ color: '#f8fafc' }}>18ms</strong></span>
        </div>

        {/* Tour Briefing Button */}
        <button
          onClick={onOpenTour}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Mission Briefing & Guide"
        >
          <HelpCircle size={14} /> Mission Guide
        </button>

        {/* User Account Controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onClick={() => setActiveTab && setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #00e5ff)',
                  color: '#050a12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#f87171' }}
              title="End Mission Session"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              Researcher Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="btn-primary"
              style={{ padding: '7px 18px', fontSize: '0.82rem' }}
            >
              Join Mission &rarr;
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
