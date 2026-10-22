import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DatasetStats, DatasetPreviewItem } from '../types';
import {
  Database,
  Layers,
  FileCheck,
  UploadCloud,
  CheckCircle2,
  HardDrive,
  Cpu,
  Eye,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface Props {
  onAnalyzeSpecimen?: (specimenFilename: string) => void;
}

export const DatasetPage: React.FC<Props> = ({ onAnalyzeSpecimen }) => {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [previews, setPreviews] = useState<DatasetPreviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSplit, setSelectedSplit] = useState<string>('all');
  const [uploadSplit, setUploadSplit] = useState<string>('training');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, previewsData] = await Promise.all([
        api.getDatasetStats(),
        api.getDatasetPreviews(16)
      ]);
      setStats(statsData);
      setPreviews(previewsData);
    } catch (err) {
      console.error('Failed to load dataset telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadSuccess(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('split', uploadSplit);
      const res = await api.uploadDatasetTile(fd);
      setUploadSuccess(`Specimen ${res.filename} ingested into ${res.split} split.`);
      loadData();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPreviews = selectedSplit === 'all'
    ? previews
    : previews.filter(p => p.split.toLowerCase() === selectedSplit.toLowerCase());

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="telemetry-badge">
            <Database size={12} /> PLANETARY REPOSITORY
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            LU3M6TGT YOLO BENCHMARK ACTIVE
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc' }}>
          Planetary Surface Dataset & Training Corpus
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>
          Standardized high-resolution lunar orbiter satellite imagery calibrated for deep learning crater detection and spatial morphometry.
        </p>
      </div>

      {/* Primary Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>TOTAL IMAGES</span>
            <HardDrive size={18} color="#00e5ff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats ? stats.total_images.toLocaleString() : '1,545'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            416x416 px Orthorectified
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>CRATER IMAGES</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
            {stats ? stats.crater_images.toLocaleString() : '1,420'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            91.9% Positive Class
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>NON-CRATER MARE</span>
            <Layers size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats ? stats.non_crater_images.toLocaleString() : '125'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            8.1% Smooth Basalt Plain
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>TRAINING SPLIT</span>
            <Cpu size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats ? stats.training_images.toLocaleString() : '1,080'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            70% Corpus Proportion
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>VALIDATION SPLIT</span>
            <FileCheck size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>
            {stats ? stats.validation_images.toLocaleString() : '310'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            20% Cross-Validation
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>TEST SPLIT</span>
            <Database size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {stats ? stats.test_images.toLocaleString() : '155'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            10% Unseen Holdout
          </div>
        </div>
      </div>

      {/* Dataset Technical Specifications Panel */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            BENCHMARK SENSOR SPECIFICATION
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            {stats?.sensor || 'LROC Narrow Angle Camera (NAC) & Lunar Orbiter Topography'}
          </div>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Sub-meter to 10m/px resolution orbital imaging capturing impact crater morphology, central peaks, rim degradation, and ejecta blankets.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            CALIBRATION & RESOLUTION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.88rem', color: '#00e5ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              GSD: {stats?.ground_sample_distance || '10 meters / pixel'}
            </span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Total Annotated Bounding Boxes: <strong style={{ color: '#f8fafc' }}>{stats?.annotated_crater_boxes.toLocaleString() || '10,240+'}</strong>
          </div>
        </div>

        {/* Upload New Specimen Tile */}
        <div
          style={{
            border: '1px dashed rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: 'rgba(14, 21, 35, 0.5)',
          }}
        >
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
            Contribute Dataset Specimen
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <select
              value={uploadSplit}
              onChange={(e) => setUploadSplit(e.target.value)}
              style={{
                backgroundColor: 'rgba(8, 12, 20, 0.8)',
                color: '#f8fafc',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
              }}
            >
              <option value="training">Training Split</option>
              <option value="validation">Validation Split</option>
              <option value="test">Test Split</option>
            </select>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              <UploadCloud size={14} />
              {isUploading ? 'Ingesting...' : 'Select File'}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.tif,.tiff"
                onChange={handleTileUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          {uploadSuccess && (
            <div style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> {uploadSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Dataset Preview Gallery */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Specimen Preview Gallery
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Orthorectified planetary tiles from the benchmark corpus
            </p>
          </div>

          {/* Split Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(8, 12, 20, 0.7)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
            {['all', 'training', 'validation', 'test'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSplit(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedSplit === s ? 'rgba(0, 229, 255, 0.18)' : 'transparent',
                  color: selectedSplit === s ? '#00e5ff' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: selectedSplit === s ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Specimen Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredPreviews.map((p) => (
            <div
              key={p.id}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.15)';
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#020617' }}>
                <img
                  src={p.preview_url}
                  alt={p.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to sample
                    e.currentTarget.src = '/api/uploads/samples/lunar_specimen_01.png';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(8, 12, 20, 0.85)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#00e5ff',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                  }}
                >
                  {p.terrain_type}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(8, 12, 20, 0.85)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#f8fafc',
                  }}
                >
                  {p.dimensions}
                </span>
              </div>

              {/* Card Meta */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                    {p.filename}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px' }}>
                    <span>Craters: <strong style={{ color: '#00e5ff' }}>{p.crater_count}</strong></span>
                    <span>Scale: {p.resolution}</span>
                  </div>
                </div>

                {onAnalyzeSpecimen && (
                  <button
                    onClick={() => onAnalyzeSpecimen(p.filename)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 141, 218, 0.16)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#00e5ff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '6px',
                    }}
                  >
                    Analyze in Mission Control <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Disclaimer Card (Section 32) */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <ShieldAlert size={18} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
          <strong style={{ color: '#cbd5e1' }}>Scientific Disclaimer:</strong> AstroSight is a research and educational prototype for automated planetary image analysis. Detection results depend on image quality, model performance, spatial resolution, and calibration parameters and should not be treated as authoritative scientific measurements without validation.
        </div>
      </div>
    </div>
  );
};
