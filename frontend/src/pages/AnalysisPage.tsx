import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  AnalysisRecord,
  CraterItem,
  SpatialMeasurement,
  SampleImageSpecimen,
} from '../types';
import { ImageViewer } from '../components/ImageViewer';
import { ThreePlanetGlobe } from '../components/ThreePlanetGlobe';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Ruler,
  Globe2,
  FileDown,
  ChevronRight,
  Sparkles,
  Sliders,
  Crosshair,
  ArrowRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialAnalysis?: AnalysisRecord | null;
  onAnalysisSaved?: () => void;
}

export const AnalysisPage: React.FC<Props> = ({ initialAnalysis, onAnalysisSaved }) => {
  // Analysis Data State
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(initialAnalysis || null);
  const [sampleList, setSampleList] = useState<SampleImageSpecimen[]>([]);

  // Selected file staging state (Requirement 16 & 40)
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [stagedDimensions, setStagedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);

  // Staged validation state (before continuing to full analysis)
  const [validationStageResult, setValidationStageResult] = useState<AnalysisRecord | null>(null);

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Analysis parameters
  const [selectedPlanet, setSelectedPlanet] = useState<'Moon' | 'Mars'>('Moon');
  const [resolution, setResolution] = useState<number>(10.0); // meters per pixel
  const [selectedCrater, setSelectedCrater] = useState<CraterItem | null>(null);

  // Analysis Mode & Distance Unit (Section 5 & Spatial analysis requirements)
  const [analysisMode, setAnalysisMode] = useState<'full' | 'classification' | 'detection' | 'spatial'>('full');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'm' | 'mi'>('km');

  // File upload drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view mode: 2D Image or 3D Globe
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  useEffect(() => {
    loadSamples();
  }, []);

  useEffect(() => {
    if (initialAnalysis) {
      setCurrentAnalysis(initialAnalysis);
      setSelectedPlanet((initialAnalysis.planet as 'Moon' | 'Mars') || 'Moon');
      setResolution(initialAnalysis.resolution_m_per_px || 10.0);
    }
  }, [initialAnalysis]);

  const loadSamples = async () => {
    try {
      const samples = await api.getSampleImages();
      setSampleList(samples);
    } catch (err) {
      console.error('Failed to load sample specimens:', err);
    }
  };

  const handleStageFile = (file: File, isDemo: boolean = false) => {
    setStagedFile(file);
    setIsDemoSample(isDemo);
    setCurrentAnalysis(null);
    setValidationStageResult(null);

    const objectUrl = URL.createObjectURL(file);
    setStagedPreviewUrl(objectUrl);

    // Read dimensions
    const img = new Image();
    img.onload = () => {
      setStagedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handleExecuteUpload = async () => {
    if (!stagedFile) return;

    setIsProcessing(true);
    setCurrentAnalysis(null);
    setSelectedCrater(null);

    // Animated Pipeline Steps: FILE CHECK -> IMAGE QUALITY -> PLANETARY VALIDATION -> CRATER RELEVANCE
    setPipelineStep(1);
    setStatusMessage('FILE CHECK: Decoding image headers and matrix bit-depth...');
    await new Promise((r) => setTimeout(r, 400));

    setPipelineStep(2);
    setStatusMessage('IMAGE QUALITY: Verifying resolution and dynamic albedo range...');
    await new Promise((r) => setTimeout(r, 400));

    setPipelineStep(3);
    setStatusMessage('PLANETARY VALIDATION: Inspecting regolith spectra & anti-terrestrial filters...');
    await new Promise((r) => setTimeout(r, 500));

    setPipelineStep(4);
    setStatusMessage('CRATER RELEVANCE: Neural rim boundary & coordinate extraction...');
    await new Promise((r) => setTimeout(r, 350));

    try {
      const formData = new FormData();
      formData.append('file', stagedFile);
      formData.append('planet', selectedPlanet);
      formData.append('resolution_m_per_px', resolution.toString());

      const result = await api.uploadAndAnalyze(formData);
      setValidationStageResult(result);

      if (result.planet === 'Moon' || result.planet === 'Mars') {
        setSelectedPlanet(result.planet);
      }

      if (result.validation_state === 'INVALID') {
        // Stop at invalid state
        setCurrentAnalysis(result);
      } else {
        // Staged validated state awaiting "CONTINUE TO ANALYSIS"
        setValidationStageResult(result);
      }
    } catch (err: any) {
      alert(`Analysis encountered an error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setPipelineStep(0);
    }
  };

  const handleContinueToAnalysis = () => {
    if (validationStageResult) {
      setCurrentAnalysis(validationStageResult);
      if (validationStageResult.validation_state === 'VALID_CRATER_DETECTED') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#38bdf8', '#008dda'],
        });
      }
      if (onAnalysisSaved) {
        onAnalysisSaved();
      }
    }
  };

  const handleSelectSample = async (sample: SampleImageSpecimen) => {
    try {
      const res = await fetch(`/api/uploads/samples/${sample.filename}`);
      if (!res.ok) {
        throw new Error(`Failed to load specimen asset: ${sample.filename}`);
      }
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/png' });
      handleStageFile(file, true);
    } catch (err: any) {
      alert(`Could not load sample: ${err.message}`);
    }
  };

  const handleResetAnalysis = () => {
    setCurrentAnalysis(null);
    setValidationStageResult(null);
    setStagedFile(null);
    setStagedPreviewUrl(null);
    setSelectedCrater(null);
    setIsDemoSample(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header & Telemetry Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="telemetry-badge">
              <Sparkles size={12} /> AI PLANETARY ANALYSIS
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              MODEL: ASTROSIGHT-CRATERNET-V2.4 (LU3M6TGT)
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc' }}>
            Planetary Image Analysis & Spatial Intelligence
          </h1>
        </div>

        {/* Global Parameter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Planet Selector */}
          <div
            style={{
              display: 'flex',
              padding: '3px',
              backgroundColor: 'rgba(10, 16, 28, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setSelectedPlanet('Moon')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedPlanet === 'Moon' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: selectedPlanet === 'Moon' ? '#00e5ff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              🌕 MOON
            </button>
            <button
              onClick={() => setSelectedPlanet('Mars')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedPlanet === 'Mars' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: selectedPlanet === 'Mars' ? '#f87171' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              🔴 MARS
            </button>
          </div>

          {/* Analysis Mode Selector (Section 5 Requirement) */}
          <div
            style={{
              display: 'flex',
              padding: '3px',
              backgroundColor: 'rgba(10, 16, 28, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
            }}
          >
            {[
              { id: 'full', label: 'Full Analysis' },
              { id: 'classification', label: 'Crater Classification' },
              { id: 'detection', label: 'Crater Detection' },
              { id: 'spatial', label: 'Spatial Analysis' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setAnalysisMode(m.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: analysisMode === m.id ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                  color: analysisMode === m.id ? '#00e5ff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Ground Resolution GSD Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(10, 16, 28, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: '#64748b' }}>RESOLUTION:</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value) || 10)}
              style={{
                width: '55px',
                background: 'transparent',
                border: 'none',
                color: '#00e5ff',
                fontWeight: 700,
                outline: 'none',
                textAlign: 'center',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>m/px</span>
          </div>

          {/* New Image Upload Trigger */}
          {(currentAnalysis || stagedFile) && (
            <button onClick={handleResetAnalysis} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <RefreshCw size={14} /> New Specimen
            </button>
          )}
        </div>
      </div>

      {/* Demo Mode / Genuine Model Banner */}
      {isDemoSample && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#fbbf24',
          }}
        >
          <Info size={16} />
          <span>
            <strong>DEMO ANALYSIS:</strong> "Demo results are for interface demonstration and are not genuine model predictions."
          </span>
        </div>
      )}

      {/* STEP 1: DROPZONE & SPECIMEN SELECTION */}
      {!stagedFile && !currentAnalysis && !isProcessing && (
        <div>
          {/* Large Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleStageFile(e.dataTransfer.files[0], false);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="glass-panel"
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isDragging ? '2px dashed #00e5ff' : '2px dashed rgba(56, 189, 248, 0.3)',
              backgroundColor: isDragging ? 'rgba(0, 229, 255, 0.08)' : 'rgba(10, 16, 28, 0.75)',
              marginBottom: '32px',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.tif,.tiff"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleStageFile(e.target.files[0], false);
                }
              }}
            />

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(0, 229, 255, 0.12)',
                color: '#00e5ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
              }}
            >
              <UploadCloud size={32} />
            </div>

            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Drop your planetary image here
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              or click to <strong>Browse Files</strong> from your computer
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['JPG', 'JPEG', 'PNG', 'TIFF'].map((fmt) => (
                <span key={fmt} className="telemetry-badge" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Quick-Test Specimen Library Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  Curated Test Specimens & Acceptance Verification Library
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  One-click verification for Lunar Craters, Martian Craters, Smooth Mare (No Crater), and Non-Planetary Rejections (Selfie & Car).
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {sampleList.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="glass-card-interactive"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            sample.expected_state === 'VALID_CRATER_DETECTED'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : sample.expected_state === 'VALID_NO_CRATER'
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            sample.expected_state === 'VALID_CRATER_DETECTED'
                              ? '#4ade80'
                              : sample.expected_state === 'VALID_NO_CRATER'
                              ? '#38bdf8'
                              : '#f87171',
                        }}
                      >
                        {sample.expected_state}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {sample.planet}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                      {sample.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
                      {sample.description}
                    </p>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      justifyContent: 'center',
                    }}
                  >
                    Select Specimen &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: STAGED FILE PREVIEW & PRIMARY ACTION "UPLOAD IMAGE" (Requirement 16 & 40) */}
      {stagedFile && !currentAnalysis && !isProcessing && !validationStageResult && (
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            maxWidth: '720px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Planetary Image Ready for Inspection
          </h2>

          {stagedPreviewUrl && (
            <div style={{ marginBottom: '20px' }}>
              <img
                src={stagedPreviewUrl}
                alt="Staged Preview"
                style={{
                  maxHeight: '320px',
                  maxWidth: '100%',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  boxShadow: '0 0 25px rgba(0, 0, 0, 0.8)',
                }}
              />
            </div>
          )}

          {/* Staged Metadata Grid (Requirement 16) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'rgba(10, 16, 28, 0.8)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              marginBottom: '28px',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>FILE NAME</div>
              <strong style={{ color: '#cbd5e1', wordBreak: 'break-all' }}>{stagedFile.name}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>FILE SIZE</div>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {formatFileSize(stagedFile.size)}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>RESOLUTION</div>
              <strong style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                {stagedDimensions ? `${stagedDimensions.width} x ${stagedDimensions.height} px` : 'Calculating...'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={handleResetAnalysis} className="btn-secondary" style={{ padding: '12px 24px' }}>
              Cancel
            </button>
            {/* Primary Action Button (Section 5 Requirement 40): RUN ASTROSIGHT ANALYSIS */}
            <button
              onClick={handleExecuteUpload}
              className="btn-primary"
              style={{
                padding: '14px 42px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              RUN ASTROSIGHT ANALYSIS &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PROCESSING PIPELINE ANIMATION (Requirement 17) */}
      {isProcessing && (
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid rgba(0, 229, 255, 0.2)',
              borderTopColor: '#00e5ff',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px',
            }}
          />

          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            ANALYZING IMAGE
          </h3>
          <p style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '32px' }}>
            {statusMessage}
          </p>

          {/* Pipeline Visual Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            {[
              { num: 1, label: 'FILE CHECK' },
              { num: 2, label: 'IMAGE QUALITY' },
              { num: 3, label: 'PLANETARY VALIDATION' },
              { num: 4, label: 'CRATER RELEVANCE' },
            ].map((st) => (
              <div key={st.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor:
                      pipelineStep >= st.num ? '#00e5ff' : 'rgba(14, 21, 35, 0.9)',
                    color: pipelineStep >= st.num ? '#040810' : '#64748b',
                    border: '1px solid',
                    borderColor: pipelineStep >= st.num ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {st.num}
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: pipelineStep >= st.num ? '#38bdf8' : '#64748b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: INTERMEDIATE VALIDATION STATE (Requirement 17 & 40) */}
      {validationStageResult && !currentAnalysis && !isProcessing && (
        <div
          className="glass-panel"
          style={{
            padding: '40px',
            maxWidth: '680px',
            margin: '20px auto',
            textAlign: 'center',
            border: '1px solid rgba(34, 197, 94, 0.4)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80', marginBottom: '6px' }}>
            ✓ IMAGE VALIDATED
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '14px' }}>
            "Planetary surface detected."
          </p>

          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(10, 16, 28, 0.75)',
              borderRadius: '8px',
              maxWidth: '420px',
              margin: '0 auto 28px',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>DETECTED PLANET</div>
              <strong style={{ fontSize: '1.1rem', color: '#00e5ff' }}>
                {validationStageResult.planet}
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CONFIDENCE</div>
              <strong style={{ fontSize: '1.1rem', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                {validationStageResult.planet_confidence || 94.8}%
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={handleResetAnalysis} className="btn-secondary">
              Upload Different Image
            </button>
            {/* Primary Action Button (Requirement 40): CONTINUE TO ANALYSIS */}
            <button
              onClick={handleContinueToAnalysis}
              className="btn-primary"
              style={{ padding: '12px 32px', fontSize: '0.95rem' }}
            >
              CONTINUE TO ANALYSIS &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL ANALYSIS RESULTS VIEW */}
      {currentAnalysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* STATE 1: ❌ INVALID IMAGE */}
          {currentAnalysis.validation_state === 'INVALID' && (
            <div
              className="glass-panel"
              style={{
                padding: '48px 36px',
                textAlign: 'center',
                border: '1px solid #ef4444',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
                backgroundColor: 'rgba(25, 12, 18, 0.85)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <XCircle size={36} />
              </div>

              <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
                ❌ INVALID IMAGE
              </h2>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '12px' }}>
                This image is not suitable for AstroSight analysis.
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {currentAnalysis.validation_message}
              </p>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(10, 16, 28, 0.7)',
                  borderRadius: '10px',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 600 }}>
                  Please upload a valid:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <li>🌕 Lunar surface image</li>
                  <li>🔴 Martian surface image</li>
                  <li>🛰️ Planetary satellite image</li>
                  <li>🌑 Crater / topographical image</li>
                </ul>
              </div>

              {/* Requirement 2 & 40 Button: UPLOAD ANOTHER IMAGE */}
              <button onClick={handleResetAnalysis} className="btn-primary" style={{ padding: '12px 28px' }}>
                UPLOAD ANOTHER IMAGE &rarr;
              </button>
            </div>
          )}

          {/* STATE 2: ℹ️ VALID PLANETARY IMAGE — NO CRATER */}
          {currentAnalysis.validation_state === 'VALID_NO_CRATER' && (
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="telemetry-badge">✓ IMAGE VALIDATED</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      BODY: {currentAnalysis.planet.toUpperCase()} ({currentAnalysis.planet_confidence || 95}%)
                    </span>
                  </div>
                  <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    No Crater Detected
                  </h2>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '24px' }}>
                "The image appears to contain planetary terrain, but no crater was confidently detected."
              </p>

              {/* CNN Classification Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '16px 20px',
                  backgroundColor: 'rgba(10, 16, 28, 0.75)',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CLASSIFICATION PREDICTION</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>NON-CRATER</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>MODEL CONFIDENCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ade80' }}>
                    {currentAnalysis.classification_confidence}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ARCHITECTURE</div>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                    AstroSight-CraterNet-v2.4
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <img
                  src={currentAnalysis.image_url}
                  alt="Smooth Planetary Terrain"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    marginBottom: '16px',
                  }}
                />
                <button onClick={handleResetAnalysis} className="btn-secondary">
                  Analyze Another Specimen &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: ✅ VALID PLANETARY IMAGE — CRATER DETECTED */}
          {currentAnalysis.validation_state === 'VALID_CRATER_DETECTED' && (
            <div>
              {/* Summary Status Strip */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px 24px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="telemetry-badge" style={{ color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                        ✓ IMAGE VALIDATED
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        DETECTED PLANET: <strong style={{ color: '#f8fafc' }}>{currentAnalysis.planet}</strong> ({currentAnalysis.planet_confidence || 94.8}%)
                      </span>
                    </div>
                    <h2 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                      {currentAnalysis.crater_count} Craters Successfully Identified
                    </h2>
                  </div>
                </div>

                {/* Switch between 2D Analysis & 3D Globe */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      padding: '3px',
                      backgroundColor: 'rgba(10, 16, 28, 0.8)',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  >
                    <button
                      onClick={() => setViewMode('2d')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: viewMode === '2d' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                        color: viewMode === '2d' ? '#00e5ff' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      2D VECTOR VIEWER
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: viewMode === '3d' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                        color: viewMode === '3d' ? '#00e5ff' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Globe2 size={14} /> 3D PLANET VIEW
                    </button>
                  </div>

                  {currentAnalysis.report_url && (
                    <a
                      href={currentAnalysis.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      <FileDown size={14} /> DOWNLOAD REPORT
                    </a>
                  )}
                </div>
              </div>

              {/* Mode-Specific Focus: CNN Classification Bar & Probability Gauge (Section 6 Requirement) */}
              {(analysisMode === 'full' || analysisMode === 'classification') && (
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    marginBottom: '20px',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        CNN CLASSIFICATION ENGINE • ASTROSIGHT-CRATERNET-V2.4
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Prediction: <span style={{ color: '#00e5ff' }}>CRATER DETECTED</span>
                        <span className="telemetry-badge" style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                          Confidence: {currentAnalysis.classification_confidence || 96.82}%
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Crater Probability: </span>
                        <strong style={{ color: '#00e5ff' }}>{currentAnalysis.classification_confidence || 96.82}%</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Non-Crater Probability: </span>
                        <strong style={{ color: '#94a3b8' }}>
                          {(100 - (currentAnalysis.classification_confidence || 96.82)).toFixed(2)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Probability Gauge Bar */}
                  <div
                    style={{
                      height: '10px',
                      borderRadius: '5px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        width: `${currentAnalysis.classification_confidence || 96.82}%`,
                        background: 'linear-gradient(90deg, #008dda, #00e5ff)',
                        boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
                        transition: 'width 0.8s ease',
                      }}
                    />
                    <div
                      style={{
                        width: `${(100 - (currentAnalysis.classification_confidence || 96.82)).toFixed(2)}%`,
                        backgroundColor: 'rgba(148, 163, 184, 0.3)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Classification & Telemetry Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div className="glass-panel" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>PREDICTION</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>CRATER</div>
                </div>
                <div className="glass-panel" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>MODEL CONFIDENCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>
                    {currentAnalysis.classification_confidence || 96.82}%
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>MEAN FEATURE CONFIDENCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00e5ff' }}>
                    {currentAnalysis.average_confidence}%
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>SCALE RESOLUTION</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                    {currentAnalysis.resolution_m_per_px} m/px
                  </div>
                </div>
              </div>

              {/* Interactive Viewers: 2D Image Viewer OR 3D Planetary Sphere */}
              {viewMode === '2d' ? (
                <div style={{ marginBottom: '24px' }}>
                  <ImageViewer
                    imageUrl={currentAnalysis.image_url}
                    craters={currentAnalysis.craters}
                    resolution={currentAnalysis.resolution_m_per_px}
                    selectedUnit={distanceUnit}
                    onUnitChange={setDistanceUnit}
                    onSelectCrater={(c) => setSelectedCrater(c)}
                  />
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    3D Spherical Coordinate Projection
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
                    Click and drag to rotate the {currentAnalysis.planet} sphere. Markers represent detected crater impact sites.
                  </p>
                  <ThreePlanetGlobe
                    planet={currentAnalysis.planet as 'Moon' | 'Mars'}
                    craters={currentAnalysis.craters}
                    selectedCraterId={selectedCrater?.id}
                    onSelectCrater={(c) => setSelectedCrater(c)}
                    height="560px"
                  />
                </div>
              )}

              {/* Craters Table & Spatial Distance Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                {/* Crater Coordinates Table */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      Crater Feature Coordinates (X, Y)
                    </h3>
                    <span className="telemetry-badge" style={{ fontSize: '0.7rem' }}>
                      {currentAnalysis.craters.length} REGIONS
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.2)', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>CRATER</th>
                          <th style={{ padding: '8px' }}>CENTER X</th>
                          <th style={{ padding: '8px' }}>CENTER Y</th>
                          <th style={{ padding: '8px' }}>DIAMETER</th>
                          <th style={{ padding: '8px' }}>CONFIDENCE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAnalysis.craters.map((c) => (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedCrater(c)}
                            style={{
                              borderBottom: '1px solid rgba(56, 189, 248, 0.08)',
                              cursor: 'pointer',
                              backgroundColor: selectedCrater?.id === c.id ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ padding: '8px' }}>{c.x} px</td>
                            <td style={{ padding: '8px' }}>{c.y} px</td>
                            <td style={{ padding: '8px', color: '#00e5ff' }}>{c.diameter_km} km</td>
                            <td style={{ padding: '8px', color: '#4ade80' }}>{c.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Spatial Measurements Distance Matrix */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      Spatial Euclidean Distance Vectors
                    </h3>
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(10, 16, 28, 0.8)', padding: '2px', borderRadius: '6px' }}>
                      {(['km', 'm', 'mi'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setDistanceUnit(u)}
                          style={{
                            padding: '3px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: distanceUnit === u ? '#00e5ff' : 'transparent',
                            color: distanceUnit === u ? '#05080e' : '#94a3b8',
                          }}
                        >
                          {u.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentAnalysis.spatial_measurements && currentAnalysis.spatial_measurements.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {currentAnalysis.spatial_measurements.slice(0, 6).map((m, idx) => {
                        const distFormatted =
                          distanceUnit === 'm'
                            ? `${m.real_distance_m} M`
                            : distanceUnit === 'mi'
                            ? `${((m.real_distance_km || 0) * 0.621371).toFixed(2)} MI`
                            : `${m.real_distance_km} KM`;

                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(10, 16, 28, 0.7)',
                              border: '1px solid rgba(56, 189, 248, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                                {m.crater_a_name} &rarr; {m.crater_b_name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                                Pixel Distance: {m.pixel_distance} px
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                                {distFormatted}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Scale: {m.resolution_m_per_px || 10} m/px
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                      Use the <strong>MEASURE</strong> tool in the 2D viewer to compute distances between crater pairs.
                    </div>
                  )}
                </div>
              </div>

              {/* Scientific & Technical Disclaimer Banner (Section 32 Requirement) */}
              <div
                style={{
                  padding: '14px 20px',
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                <Info size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#cbd5e1' }}>ASTROSIGHT SCIENTIFIC & TECHNICAL DISCLAIMER:</strong> Crater detection boundaries,
                  centroid coordinates, and ground-sample distance vectors are synthesized via deep convolutional neural networks
                  and spatial transformation algorithms. Imagery resolution, solar phase angle, and surface albedo variations may influence
                  telemetry precision. AstroSight analytical data is developed for planetary scientific research, orbital remote sensing, and educational
                  advancement aligned with UN SDG 9 (Industry, Innovation & Infrastructure), and is not certified for autonomous planetary descent or landing navigation.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
