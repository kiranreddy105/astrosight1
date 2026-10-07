import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalysisRecord } from '../types';
import {
  History,
  Trash2,
  Eye,
  FileDown,
  Calendar,
  Crosshair,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface Props {
  onViewAnalysis: (analysis: AnalysisRecord) => void;
}

export const HistoryPage: React.FC<Props> = ({ onViewAnalysis }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalyses();
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load mission history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this mission telemetry record?')) return;
    try {
      setDeletingId(id);
      await api.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="telemetry-badge">
              <Sparkles size={12} /> MISSION TELEMETRY LOGS
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            Mission Analysis History
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Archived planetary surface scans, spatial distance vectors, and verified impact detections.
          </p>
        </div>

        <button onClick={loadHistory} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
          Refresh Telemetry
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Loading mission archives from secure storage...
        </div>
      ) : analyses.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {analyses.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                {/* Header Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        item.validation_state === 'VALID_CRATER_DETECTED'
                          ? 'rgba(34, 197, 94, 0.15)'
                          : item.validation_state === 'VALID_NO_CRATER'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        item.validation_state === 'VALID_CRATER_DETECTED'
                          ? '#4ade80'
                          : item.validation_state === 'VALID_NO_CRATER'
                          ? '#38bdf8'
                          : '#f87171',
                      border: '1px solid',
                      borderColor:
                        item.validation_state === 'VALID_CRATER_DETECTED'
                          ? 'rgba(34, 197, 94, 0.3)'
                          : item.validation_state === 'VALID_NO_CRATER'
                          ? 'rgba(56, 189, 248, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {item.validation_state === 'VALID_CRATER_DETECTED' && '✓ CRATERS DETECTED'}
                    {item.validation_state === 'VALID_NO_CRATER' && 'ℹ NO CRATER'}
                    {item.validation_state === 'INVALID' && '✕ REJECTED'}
                  </span>

                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {item.created_at.slice(0, 10)}
                  </div>
                </div>

                {/* Thumbnail & Metadata */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <img
                    src={item.image_url}
                    alt={item.filename}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.filename}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <div>
                        PLANET: <strong style={{ color: item.planet === 'Mars' ? '#ef4444' : '#38bdf8' }}>{item.planet}</strong>
                      </div>
                      <div>
                        CRATERS: <strong style={{ color: '#ffffff' }}>{item.crater_count}</strong>
                      </div>
                      <div>
                        CONFIDENCE: <strong style={{ color: '#4ade80' }}>{item.average_confidence}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: VIEW, REPORT, DELETE */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderTop: '1px solid rgba(56, 189, 248, 0.12)',
                  paddingTop: '14px',
                }}
              >
                <button
                  onClick={() => onViewAnalysis(item)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
                >
                  <Eye size={14} /> VIEW
                </button>

                {item.report_url && (
                  <a
                    href={item.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      color: '#00e5ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Download Official PDF Report"
                  >
                    <FileDown size={14} /> REPORT
                  </a>
                )}

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  disabled={deletingId === item.id}
                  className="btn-danger"
                  style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                  title="Purge Telemetry Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed rgba(56, 189, 248, 0.2)',
          }}
        >
          <History size={48} color="#64748b" style={{ marginBottom: '16px' }} />
          <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>
            No Analysis History Found
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Your completed planetary scans and measurements will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
