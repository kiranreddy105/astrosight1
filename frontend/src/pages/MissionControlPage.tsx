import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PortalStats, AnalysisRecord } from '../types';
import {
  Activity,
  Crosshair,
  Ruler,
  FileCheck2,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string, analysis?: AnalysisRecord) => void;
}

export const MissionControlPage: React.FC<Props> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalStats();
  }, []);

  const loadPortalStats = async () => {
    try {
      setLoading(true);
      const data = await api.getPortalStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load portal telemetry stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px 36px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(14, 25, 45, 0.85) 0%, rgba(9, 14, 24, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="telemetry-badge">
              <Sparkles size={12} /> ASTROSIGHT MISSION PORTAL
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              NODE ID: ASTRO-ORBIT-2026
            </span>
          </div>

          <h1 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            Welcome back, {user?.name || 'Researcher'}.
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px' }}>
            Telemetry feeds operational. You are monitoring autonomous crater intelligence, spatial measurements, and high-precision terrain orthorectification.
          </p>
        </div>

        <div>
          <button
            onClick={() => onNavigateTab('analyze')}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
          >
            <UploadCloud size={18} /> New Specimen Analysis &rarr;
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards from Spec */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        {/* Total Analyses */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              TOTAL ANALYSES
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              <Layers size={18} />
            </div>
          </div>
          <div
            className="font-display glow-cyan"
            style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}
          >
            {loading ? '...' : stats?.total_analyses ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Verified planetary specimens
          </div>
        </div>

        {/* Craters Detected */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              CRATERS DETECTED
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}>
              <Crosshair size={18} />
            </div>
          </div>
          <div
            className="font-display glow-cyan"
            style={{ fontSize: '2.4rem', fontWeight: 800, color: '#00e5ff', marginBottom: '4px' }}
          >
            {loading ? '...' : stats?.craters_detected ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Rims & topological depressions
          </div>
        </div>

        {/* Average Confidence */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              AVERAGE CONFIDENCE
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
              <Activity size={18} />
            </div>
          </div>
          <div
            className="font-display"
            style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}
          >
            {loading ? '...' : `${stats?.average_confidence ?? 0}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Calibrated neural network certainty
          </div>
        </div>

        {/* Spatial Measurements */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              SPATIAL MEASUREMENTS
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
              <Ruler size={18} />
            </div>
          </div>
          <div
            className="font-display"
            style={{ fontSize: '2.4rem', fontWeight: 800, color: '#818cf8', marginBottom: '4px' }}
          >
            {loading ? '...' : stats?.spatial_measurements ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Calculated Euclidean vectors
          </div>
        </div>
      </div>

      {/* Recent Telemetry Analyses Grid */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Recent Telemetry Analyses
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Your private user analyses (isolated from all other researchers)
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            View All History &rarr;
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Retrieving mission telemetry from database...
          </div>
        ) : stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recent_analyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => onNavigateTab('analyze', analysis)}
                className="glass-card-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={analysis.image_url}
                    alt={analysis.filename}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                      {analysis.filename}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      BODY: {analysis.planet} | CRATERS: {analysis.crater_count} | CONFIDENCE: {analysis.average_confidence}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor:
                        analysis.validation_state === 'VALID_CRATER_DETECTED'
                          ? 'rgba(34, 197, 94, 0.15)'
                          : analysis.validation_state === 'VALID_NO_CRATER'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        analysis.validation_state === 'VALID_CRATER_DETECTED'
                          ? '#4ade80'
                          : analysis.validation_state === 'VALID_NO_CRATER'
                          ? '#38bdf8'
                          : '#f87171',
                      border: '1px solid',
                      borderColor:
                        analysis.validation_state === 'VALID_CRATER_DETECTED'
                          ? 'rgba(34, 197, 94, 0.3)'
                          : analysis.validation_state === 'VALID_NO_CRATER'
                          ? 'rgba(56, 189, 248, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {analysis.validation_state === 'VALID_CRATER_DETECTED' && '✓ CRATERS IDENTIFIED'}
                    {analysis.validation_state === 'VALID_NO_CRATER' && 'ℹ NO CRATER DETECTED'}
                    {analysis.validation_state === 'INVALID' && '✕ REJECTED'}
                  </span>

                  <ChevronRight size={18} color="#64748b" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(10, 16, 28, 0.4)',
              borderRadius: '8px',
              border: '1px dashed rgba(56, 189, 248, 0.2)',
            }}
          >
            <UploadCloud size={40} color="#38bdf8" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              No Planetary Specimen Analyses Yet
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '400px', margin: '0 auto 20px' }}>
              Upload your first Lunar or Martian surface image or test our curated sample specimens to populate telemetry.
            </p>
            <button onClick={() => onNavigateTab('analyze')} className="btn-primary">
              Run First Analysis &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
