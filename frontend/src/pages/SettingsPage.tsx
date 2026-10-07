import React, { useState } from 'react';
import { Settings, Sliders, Moon, Eye, Monitor, Sparkles, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [defaultPlanet, setDefaultPlanet] = useState<'Moon' | 'Mars'>('Moon');
  const [defaultResolution, setDefaultResolution] = useState<number>(10);
  const [units, setUnits] = useState<'km' | 'm'>('km');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="telemetry-badge">
            <Sparkles size={12} /> CONFIGURATION
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
          Platform Settings & Mission Preferences
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Configure default planetary targets, orthorectified spatial scale, and accessibility preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '32px' }}>
        {saved && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontSize: '0.88rem',
            }}
          >
            <CheckCircle2 size={16} /> Preferences successfully updated in local telemetry cache.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Default Target Planet */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              Default Target Celestial Body
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDefaultPlanet('Moon')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: defaultPlanet === 'Moon' ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
                  backgroundColor: defaultPlanet === 'Moon' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(10, 16, 28, 0.6)',
                  color: defaultPlanet === 'Moon' ? '#00e5ff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                🌕 Lunar Surface (Earth's Moon)
              </button>
              <button
                type="button"
                onClick={() => setDefaultPlanet('Mars')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: defaultPlanet === 'Mars' ? '#ef4444' : 'rgba(56, 189, 248, 0.2)',
                  backgroundColor: defaultPlanet === 'Mars' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(10, 16, 28, 0.6)',
                  color: defaultPlanet === 'Mars' ? '#f87171' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                🔴 Martian Surface (Mars)
              </button>
            </div>
          </div>

          {/* Default Ground Sampling Resolution */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              Default Ground Sampling Distance (GSD)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min={1}
                max={5000}
                value={defaultResolution}
                onChange={(e) => setDefaultResolution(Number(e.target.value) || 10)}
                style={{
                  width: '120px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(9, 14, 25, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>meters per pixel (m/px)</span>
            </div>
          </div>

          {/* Unit Metric */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              Distance Units Preference
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setUnits('km')}
                className={units === 'km' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Kilometers (KM)
              </button>
              <button
                type="button"
                onClick={() => setUnits('m')}
                className={units === 'm' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Meters (M)
              </button>
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div style={{ borderTop: '1px solid rgba(56, 189, 248, 0.12)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '14px' }}>
              Accessibility & Visual Ergonomics
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                />
                <span>Enable Reduced Motion (disables 3D camera idle drift and scanlines)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                />
                <span>Enhanced Contrast Overlays for technical telemetry grids</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
              Save Platform Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
