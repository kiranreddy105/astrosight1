import React, { useState } from 'react';
import {
  UploadCloud,
  ShieldCheck,
  Crosshair,
  Ruler,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: UploadCloud,
    title: '1. Planetary Specimen Ingestion',
    desc: 'Upload high-resolution satellite or orbiter imagery in JPG, PNG, or TIFF format. You can also pick from our curated Lunar and Martian test library.',
    tag: 'INPUT STAGE',
  },
  {
    icon: ShieldCheck,
    title: '2. Strict Spectral & Biometric Validation',
    desc: 'AstroSight actively verifies regolith albedo, chromaticity, and straight edge density. Unrelated Earth photographs, human selfies, cars, and buildings are strictly rejected.',
    tag: 'VALIDATION GATEWAY',
  },
  {
    icon: Crosshair,
    title: '3. Deep Learning Crater Detection',
    desc: 'Our convolutional neural pipeline identifies impact craters, calculates pixel center coordinates (X, Y), crater radius, and outputs calibrated confidence scores.',
    tag: 'AI INFERENCE',
  },
  {
    icon: Ruler,
    title: '4. Mathematical Spatial Analysis',
    desc: 'Click any two crater centers to calculate planar Euclidean distance. Specify your Ground Sampling Distance (e.g. 10 m/px) to reveal true planetary distances in kilometers.',
    tag: 'EUCLIDEAN METRIC',
  },
  {
    icon: FileText,
    title: '5. Aerospace PDF Report & 3D Globe',
    desc: 'Export formal scientific mission reports formatted with coordinate matrices, and inspect your craters on our interactive 3D Moon & Mars spherical globe.',
    tag: 'REPORT & 3D DISCOVERY',
  },
];

export const OnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px',
          position: 'relative',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="telemetry-badge">
            <Sparkles size={12} /> MISSION BRIEFING
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            STEP {currentStep + 1} OF {STEPS.length}
          </span>
        </div>

        {/* Step Visual Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00e5ff',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
          }}
        >
          <StepIcon size={32} />
        </div>

        <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
          {step.title}
        </h3>

        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '28px' }}>
          {step.desc}
        </p>

        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx === currentStep ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="btn-primary"
                style={{ padding: '8px 18px' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '8px 20px' }}
              >
                Launch Workspace &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
