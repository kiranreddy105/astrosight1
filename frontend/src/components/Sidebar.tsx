import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Crosshair,
  Ruler,
  Globe2,
  History,
  FileText,
  Activity,
  User as UserIcon,
  Settings,
  Database,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MENU_ITEMS = [
  { id: 'portal', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Image Analysis', icon: UploadCloud, badge: 'CORE' },
  { id: 'detect', label: 'Crater Detection', icon: Crosshair },
  { id: 'spatial', label: 'Spatial Analysis', icon: Ruler },
  { id: 'globe', label: 'Planetary Map 3D', icon: Globe2 },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'model', label: 'Model Performance', icon: Activity },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'profile', label: 'Researcher Profile', icon: UserIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'rgba(8, 12, 20, 0.95)',
        borderRight: '1px solid rgba(56, 189, 248, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        height: 'calc(100vh - 65px)',
        position: 'sticky',
        top: '65px',
        zIndex: 30,
      }}
    >
      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: '#64748b',
            letterSpacing: '0.1em',
            padding: '8px 12px 4px 12px',
            textTransform: 'uppercase',
          }}
        >
          Telemetry Modules
        </div>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
                backgroundColor: isActive ? 'rgba(0, 141, 218, 0.16)' : 'transparent',
                color: isActive ? '#00e5ff' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(20, 30, 48, 0.6)';
                  e.currentTarget.style.color = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#00e5ff' : '#64748b'} />
                <span style={{ fontSize: '0.86rem', fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(0, 229, 255, 0.15)',
                    color: '#00e5ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info & System Status (Section 3) */}
      <div
        style={{
          borderTop: '1px solid rgba(56, 189, 248, 0.12)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* System & AI Telemetry Indicators */}
        <div
          style={{
            backgroundColor: 'rgba(10, 16, 28, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.1)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>SYSTEM:</span>
            <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              ONLINE
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>AI MODEL:</span>
            <span style={{ color: '#00e5ff', fontWeight: 600 }}>CraterNet v2.4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>STATUS:</span>
            <span style={{ color: '#38bdf8' }}>READY</span>
          </div>
        </div>

        {user ? (
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(14, 21, 35, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                FAV: {user.favorite_planet.toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            AstroSight v2.4 Active
          </div>
        )}
      </div>
    </aside>
  );
};
