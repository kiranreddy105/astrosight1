import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ModelPerformanceMetrics } from '../types';
import {
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Database,
  BarChart2,
  Sparkles,
} from 'lucide-react';

export const ModelPerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getModelPerformance();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load model performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="telemetry-badge">
            <Sparkles size={12} /> BENCHMARK METRICS
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            STATUS: {metrics?.status || 'EVALUATED'}
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
          AI Model Performance & Evaluation
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Empirical validation metrics evaluated on the LU3M6TGT Lunar Orbiter Crater Benchmark.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Retrieving empirical validation matrices...
        </div>
      ) : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Key Metrics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>ACCURACY</div>
              <div className="font-display glow-cyan" style={{ fontSize: '2rem', fontWeight: 800, color: '#00e5ff' }}>
                {metrics.accuracy}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Overall Classification</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>PRECISION</div>
              <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                {metrics.precision}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Low False Positive Rate</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>RECALL</div>
              <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                {metrics.recall}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Feature Sensitivity</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>F1 SCORE</div>
              <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>
                {metrics.f1_score}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Harmonic Mean</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>VALIDATION LOSS</div>
              <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {metrics.validation_loss}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cross-Entropy Loss</div>
            </div>
          </div>

          {/* Architecture & Dataset Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
                Neural Network Architecture
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Architecture:</span>{' '}
                  <strong style={{ color: '#f8fafc' }}>{metrics.architecture}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Classification Classes:</span>{' '}
                  <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                    [{metrics.classification_classes.join(', ')}]
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Benchmark Dataset:</span>{' '}
                  <strong style={{ color: '#cbd5e1' }}>{metrics.dataset_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Validation Samples Evaluated:</span>{' '}
                  <strong style={{ color: '#cbd5e1' }}>{metrics.total_samples_evaluated} specimens</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Training Epochs:</span>{' '}
                  <strong style={{ color: '#cbd5e1' }}>{metrics.training_epochs} epochs</strong>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
                Validation Confusion Matrix
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ color: '#64748b' }}>
                      <th style={{ padding: '8px' }}>ACTUAL \ PREDICTED</th>
                      <th style={{ padding: '8px', color: '#00e5ff' }}>CRATER</th>
                      <th style={{ padding: '8px', color: '#94a3b8' }}>NON-CRATER</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: '1px solid rgba(56, 189, 248, 0.15)' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#00e5ff', textAlign: 'left' }}>
                        TRUE CRATER
                      </td>
                      <td style={{ padding: '10px', backgroundColor: 'rgba(0, 229, 255, 0.15)', color: '#4ade80', fontWeight: 700 }}>
                        {metrics.confusion_matrix.True_Crater.Pred_Crater}
                      </td>
                      <td style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#f87171' }}>
                        {metrics.confusion_matrix.True_Crater.Pred_NonCrater}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(56, 189, 248, 0.08)' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#94a3b8', textAlign: 'left' }}>
                        TRUE NON-CRATER
                      </td>
                      <td style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#f87171' }}>
                        {metrics.confusion_matrix.True_NonCrater.Pred_Crater}
                      </td>
                      <td style={{ padding: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                        {metrics.confusion_matrix.True_NonCrater.Pred_NonCrater}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          "Model metrics not configured."
        </div>
      )}
    </div>
  );
};
