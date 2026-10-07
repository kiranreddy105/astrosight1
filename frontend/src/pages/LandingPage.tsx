import React, { useState } from 'react';
import { ThreeSpaceBackground } from '../components/ThreeSpaceBackground';
import {
  Orbit,
  Crosshair,
  Ruler,
  Globe2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onEnterMission: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterMission, onOpenAuth }) => {
  const [activePlanet, setActivePlanet] = useState<'moon' | 'mars'>('moon');

  const scrollToExplore = () => {
    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
          overflow: 'hidden',
        }}
      >
        {/* 3D Space & Planetary Background */}
        <ThreeSpaceBackground planetType={activePlanet} />

        {/* Hero Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '680px',
            padding: '40px 0',
          }}
        >
          {/* Aerospace Status Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span className="telemetry-badge">
              <Sparkles size={12} /> DEEP-SPACE GEOSPATIAL INTELLIGENCE
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActivePlanet('moon')}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: activePlanet === 'moon' ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
                  backgroundColor: activePlanet === 'moon' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                  color: activePlanet === 'moon' ? '#00e5ff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                🌕 LUNAR
              </button>
              <button
                onClick={() => setActivePlanet('mars')}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: activePlanet === 'mars' ? '#ef4444' : 'rgba(56, 189, 248, 0.2)',
                  backgroundColor: activePlanet === 'mars' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: activePlanet === 'mars' ? '#f87171' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                🔴 MARTIAN
              </button>
            </div>
          </div>

          {/* Main Cinematic Heading */}
          <h1
            className="font-display"
            style={{
              fontSize: '3.8rem',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          >
            ASTROSIGHT
          </h1>

          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 600,
              color: '#38bdf8',
              letterSpacing: '-0.01em',
              marginBottom: '16px',
            }}
          >
            See the Surface. Discover the Unknown.
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '560px',
            }}
          >
            AI-powered planetary crater detection, strict spectral validation, and mathematical spatial intelligence for autonomous lunar and Martian exploration.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={onEnterMission}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.98rem' }}
            >
              ENTER MISSION CONTROL <ArrowRight size={18} />
            </button>

            <button
              onClick={scrollToExplore}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '0.95rem' }}
            >
              EXPLORE ASTROSIGHT
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: What AstroSight Does */}
      <section
        id="explore-section"
        style={{
          padding: '80px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="telemetry-badge" style={{ marginBottom: '12px' }}>
            CAPABILITIES
          </span>
          <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#f8fafc' }}>
            Autonomous Planetary Surface Intelligence
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0' }}>
            Engineered for space agencies, planetary researchers, and deep-space mission architects.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(0, 229, 255, 0.12)',
                color: '#00e5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Crosshair size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              AI Crater Detection
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Deep convolutional neural network trained on extensive lunar orbiter datasets (LU3M6TGT). Accurately resolves crater rims, circular center coordinates, and confidence bounds even in low-sun shadow angles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Ruler size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              Spatial Analysis
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Rigorous Euclidean distance formulation: d = √((x₂ - x₁)² + (y₂ - y₁)²) integrated with user-configurable orthorectified ground resolution (m/px) to generate true planetary ground distances in kilometers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(129, 140, 248, 0.12)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Globe2 size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              3D Planetary Visualization
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Real-time WebGL/Three.js spherical projection. Mapped detections projected directly onto interactive 3D Moon and Mars globes with telemetry beacons, coordinate grids, and camera orbital navigation.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section
        style={{
          padding: '80px 48px',
          background: 'rgba(10, 16, 28, 0.6)',
          borderTop: '1px solid rgba(56, 189, 248, 0.1)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="telemetry-badge" style={{ marginBottom: '12px' }}>
              PIPELINE ARCHITECTURE
            </span>
            <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#f8fafc' }}>
              How AstroSight Works
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0' }}>
              An end-to-end scientific pipeline ensuring zero false classifications and verified spatial fidelity.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {[
              { num: '01', title: 'Upload', desc: 'Orbital satellite imagery' },
              { num: '02', title: 'Validate', desc: 'Strict anti-terrestrial check' },
              { num: '03', title: 'Detect', desc: 'Crater rim bounding & center' },
              { num: '04', title: 'Measure', desc: 'Euclidean distance matrix' },
              { num: '05', title: 'Analyze', desc: '3D Globe & Aerospace PDF' },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    width: '190px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: '#00e5ff',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    STEP {step.num}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                    {step.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {step.desc}
                  </div>
                </div>

                {idx < 4 && (
                  <div style={{ color: '#00e5ff', opacity: 0.5 }}>
                    &rarr;
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Technology Stack */}
      <section
        style={{
          padding: '80px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="telemetry-badge" style={{ marginBottom: '12px' }}>
            TECHNOLOGY
          </span>
          <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Aerospace-Grade Engineering Stack
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { name: 'Computer Vision', detail: 'OpenCV & Multi-Scale Hough', badge: 'EDGE FILTER' },
            { name: 'Deep Learning', detail: 'PyTorch Convolutional Neural Net', badge: 'RESNET BACKBONE' },
            { name: 'YOLO Formatted', detail: 'LU3M6TGT Crater Annotation Engine', badge: '1545+ VALIDATED' },
            { name: 'Spatial Mathematics', detail: 'Planar Euclidean Metric & Scale', badge: 'METRIC SCALING' },
            { name: '3D WebGL Engine', detail: 'Three.js Celestial Sphere & Shaders', badge: '60 FPS 3D' },
            { name: 'Mission PDF Dossiers', detail: 'ReportLab Vector Document Generation', badge: 'FORMAL ARCHIVE' },
          ].map((tech) => (
            <div key={tech.name} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', marginBottom: '6px' }}>
                {tech.badge}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {tech.name}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {tech.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: United Nations SDG 9 Alignment */}
      <section
        style={{
          padding: '60px 48px 100px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '40px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            backgroundColor: 'rgba(20, 25, 40, 0.75)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
          }}
        >
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                UN SDG 9
              </span>
              <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                Industry, Innovation, and Infrastructure
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Empowering Remote Sensing Scientific Infrastructure
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              AstroSight directly advances United Nations Sustainable Development Goal 9 by fostering technological research, enhancing scientific capabilities in earth and space observation, and providing open, accessible AI infrastructure for planetary geologic analysis.
            </p>
          </div>

          <div>
            <button
              onClick={onEnterMission}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.92rem' }}
            >
              LAUNCH ASTROSIGHT PORTAL &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
