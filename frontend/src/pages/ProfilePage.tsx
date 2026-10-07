import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Layers,
  Globe2,
  Lock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [favoritePlanet, setFavoritePlanet] = useState(user?.favorite_planet || 'Moon');

  // Change Password States
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        name,
        role,
        favorite_planet: favoritePlanet,
      });
      updateUser(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(`Profile update failed: ${err.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPassSuccess('Passcode updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err: any) {
      setPassError(err.message);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="telemetry-badge">
            <Sparkles size={12} /> MISSION PERSONNEL
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
          Researcher Profile & Credentials
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Main Identity Card */}
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #008dda 0%, #00e5ff 100%)',
              color: '#050a12',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              fontWeight: 800,
              boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)',
              marginBottom: '16px',
            }}
          >
            {user.name.charAt(0)}
          </div>

          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
            {user.name}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '4px' }}>
            {user.role}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
            {user.email}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '16px',
              backgroundColor: 'rgba(10, 16, 28, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TOTAL ANALYSES</div>
              <div className="font-display glow-cyan" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00e5ff' }}>
                {user.analyses_count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>FAVORITE BODY</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                {user.favorite_planet}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem' }}
            >
              <Edit3 size={14} /> Edit Profile
            </button>
            <button
              onClick={() => setShowPassModal(true)}
              className="btn-secondary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem' }}
            >
              <Lock size={14} /> Change Passcode
            </button>
          </div>
        </div>

        {/* Telemetry Information Details */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>
            Account Specifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>RESEARCHER ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>ASTRO-USR-{user.id.toString().padStart(4, '0')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>MISSION REGISTRATION DATE</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{user.created_at.slice(0, 19)} UTC</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>CLEARANCE LEVEL</div>
              <div style={{ color: '#4ade80', fontWeight: 600 }}>ORBITAL FLIGHT DIRECTOR (TIER 1)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>DATA ISOLATION</div>
              <div style={{ color: '#38bdf8' }}>ENCRYPTED & USER-ISOLATED SQLITE DB</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(56, 189, 248, 0.12)', marginTop: '24px', paddingTop: '20px' }}>
            <button onClick={logout} className="btn-danger" style={{ width: '100%', padding: '10px' }}>
              <LogOut size={16} /> Disconnect Mission Session
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 6, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Edit Researcher Profile
            </h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(9, 14, 25, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Role / Title</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(9, 14, 25, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Favorite Planetary Body</label>
                <select
                  value={favoritePlanet}
                  onChange={(e) => setFavoritePlanet(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(9, 14, 25, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="Moon">Moon</option>
                  <option value="Mars">Mars</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPassModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 6, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Change Security Passcode
            </h3>
            {passError && <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '12px' }}>{passError}</div>}
            {passSuccess && <div style={{ color: '#4ade80', fontSize: '0.8rem', marginBottom: '12px' }}>{passSuccess}</div>}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Current Passcode</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(9, 14, 25, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>New Passcode</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(9, 14, 25, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowPassModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Update Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
