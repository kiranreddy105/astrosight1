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
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MENU_ITEMS = [
  { id: 'portal', label: 'Mission Control', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze Image', icon: UploadCloud, badge: 'CORE' },
  { id: 'detect', label: 'Crater Detection', icon: Crosshair },
  { id: 'spatial', label: 'Spatial Analysis', icon: Ruler },
  { id: 'globe', label: '3D Planet View', icon: Globe2 },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'reports', label: 'Mission Reports', icon: FileText },
  { id: 'model', label: 'Model Performance', icon: Activity },
  { id: 'profile', label: 'Researcher Profile', icon: UserIcon },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
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

      {/* Footer Info / Researcher Card */}
      <div
        style={{
          borderTop: '1px solid rgba(56, 189, 248, 0.12)',
          paddingTop: '14px',
        }}
      >
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
