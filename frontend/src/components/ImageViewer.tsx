import React, { useState, useRef, useEffect } from 'react';
import { CraterItem, SpatialMeasurement } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Crosshair,
  Ruler,
  Maximize2,
  Minimize2,
  X,
  Percent,
} from 'lucide-react';

interface Props {
  imageUrl: string;
  craters: CraterItem[];
  resolution: number;
  selectedUnit?: 'km' | 'm' | 'mi';
  onUnitChange?: (unit: 'km' | 'm' | 'mi') => void;
  onSelectCrater?: (crater: CraterItem) => void;
  onMeasurementComputed?: (measurement: SpatialMeasurement) => void;
}

export const ImageViewer: React.FC<Props> = ({
  imageUrl,
  craters,
  resolution,
  selectedUnit = 'km',
  onUnitChange,
  onSelectCrater,
  onMeasurementComputed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Unit State (km / m / mi)
  const [unit, setUnit] = useState<'km' | 'm' | 'mi'>(selectedUnit);

  useEffect(() => {
    if (selectedUnit) {
      setUnit(selectedUnit);
    }
  }, [selectedUnit]);

  const handleUnitToggle = (newUnit: 'km' | 'm' | 'mi') => {
    setUnit(newUnit);
    if (onUnitChange) {
      onUnitChange(newUnit);
    }
  };

  // Natural image dimensions
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 512, height: 512 });

  // Viewer state
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles
  const [showDetections, setShowDetections] = useState<boolean>(true);
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isMeasureMode, setIsMeasureMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Measurement selection state
  const [selectedCraterA, setSelectedCraterA] = useState<CraterItem | null>(null);
  const [selectedCraterB, setSelectedCraterB] = useState<CraterItem | null>(null);
  const [hoveredCrater, setHoveredCrater] = useState<CraterItem | null>(null);

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setScale((prev) => Math.max(0.5, Math.min(4, prev + zoomDelta)));
  };

  // Crater selection for measurement
  const handleCraterClick = (crater: CraterItem) => {
    if (onSelectCrater) {
      onSelectCrater(crater);
    }

    if (!isMeasureMode) {
      setSelectedCraterA(crater);
      setSelectedCraterB(null);
      return;
    }

    if (!selectedCraterA) {
      setSelectedCraterA(crater);
    } else if (!selectedCraterB && selectedCraterA.id !== crater.id) {
      setSelectedCraterB(crater);

      const dx = crater.x - selectedCraterA.x;
      const dy = crater.y - selectedCraterA.y;
      const pxDist = Math.sqrt(dx * dx + dy * dy);
      const realM = pxDist * resolution;
      const realKm = realM / 1000.0;

      const meas: SpatialMeasurement = {
        crater_a_id: selectedCraterA.id,
        crater_a_name: selectedCraterA.name,
        crater_a_coords: { x: selectedCraterA.x, y: selectedCraterA.y },
        crater_b_id: crater.id,
        crater_b_name: crater.name,
        crater_b_coords: { x: crater.x, y: crater.y },
        pixel_distance: Number(pxDist.toFixed(2)),
        resolution_m_per_px: resolution,
        real_distance_m: Number(realM.toFixed(1)),
        real_distance_km: Number(realKm.toFixed(2)),
        formatted_display_km: `${realKm.toFixed(2)} KM`,
      };

      if (onMeasurementComputed) {
        onMeasurementComputed(meas);
      }
    } else {
      setSelectedCraterA(crater);
      setSelectedCraterB(null);
    }
  };

  const clearMeasurement = () => {
    setSelectedCraterA(null);
    setSelectedCraterB(null);
  };

  // Calculate live measurement if both selected
  const activeDistance =
    selectedCraterA && selectedCraterB
      ? (() => {
          const dx = selectedCraterB.x - selectedCraterA.x;
          const dy = selectedCraterB.y - selectedCraterA.y;
          const px = Math.sqrt(dx * dx + dy * dy);
          const m = px * resolution;
          const km = m / 1000.0;
          const mi = km * 0.621371;

          let formatted = `${km.toFixed(2)} KM`;
          if (unit === 'm') formatted = `${m.toFixed(1)} M`;
          if (unit === 'mi') formatted = `${mi.toFixed(2)} MI`;

          return {
            px: px.toFixed(2),
            m: m.toFixed(1),
            km: km.toFixed(2),
            mi: mi.toFixed(2),
            formatted,
          };
        })()
      : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '540px',
        backgroundColor: '#070b12',
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Professional Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: 'rgba(11, 18, 30, 0.95)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          gap: '8px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="telemetry-badge">
            <Crosshair size={12} />
            TARGET RESOLUTION: {resolution} M/PX
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            FEATURES: {craters.length}
          </span>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleZoomIn}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            title="Zoom In"
          >
            <ZoomIn size={14} /> ZOOM +
          </button>
          <button
            onClick={handleZoomOut}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            title="Zoom Out"
          >
            <ZoomOut size={14} /> ZOOM -
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            title="Reset Pan & Zoom"
          >
            <RotateCcw size={14} /> RESET
          </button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(56, 189, 248, 0.2)', margin: '0 4px' }} />

          <button
            onClick={() => setShowGrid(!showGrid)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: showGrid ? '#00e5ff' : '#94a3b8',
              borderColor: showGrid ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
            }}
            title="Toggle Planetary Coordinate Grid"
          >
            <Grid size={14} /> GRID
          </button>
          <button
            onClick={() => setShowDetections(!showDetections)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: showDetections ? '#00e5ff' : '#94a3b8',
              borderColor: showDetections ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
            }}
            title="Toggle Crater Detections Overlay"
          >
            <Crosshair size={14} /> DETECTIONS
          </button>
          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: showConfidence ? '#00e5ff' : '#94a3b8',
              borderColor: showConfidence ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
            }}
            title="Toggle Confidence Value Labels"
          >
            <Percent size={14} /> CONFIDENCE
          </button>
          <button
            onClick={() => {
              setIsMeasureMode(!isMeasureMode);
              if (isMeasureMode) clearMeasurement();
            }}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: isMeasureMode ? '#00e5ff' : '#94a3b8',
              backgroundColor: isMeasureMode ? 'rgba(0, 229, 255, 0.15)' : 'rgba(14, 21, 35, 0.85)',
              borderColor: isMeasureMode ? '#00e5ff' : 'rgba(56, 189, 248, 0.2)',
            }}
            title="Interactive Crater Distance Measurement"
          >
            <Ruler size={14} /> MEASURE
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} FULLSCREEN
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : isMeasureMode ? 'crosshair' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #0e1726 0%, #05080e 100%)',
          minHeight: '480px',
        }}
      >
        {/* Zoomed / Panned Container */}
        <div
          style={{
            position: 'relative',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            userSelect: 'none',
            display: 'inline-block',
          }}
        >
          {/* Base Specimen Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Planetary Specimen"
            draggable={false}
            onLoad={(e) => {
              const target = e.currentTarget;
              if (target.naturalWidth && target.naturalHeight) {
                setNaturalDim({ width: target.naturalWidth, height: target.naturalHeight });
              }
            }}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '620px',
              borderRadius: '6px',
              boxShadow: '0 0 35px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none',
            }}
          />

          {/* Coordinate Grid Overlay */}
          {showGrid && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(to right, rgba(0, 229, 255, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0, 229, 255, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* SVG Overlay for Vector Measurement Lines and Boundaries */}
          <svg
            viewBox={`0 0 ${naturalDim.width} ${naturalDim.height}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Animated Vector Line between Crater A and Crater B */}
            {selectedCraterA && selectedCraterB && (
              <g>
                <line
                  x1={selectedCraterA.x}
                  y1={selectedCraterA.y}
                  x2={selectedCraterB.x}
                  y2={selectedCraterB.y}
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="20;0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </line>
                <circle
                  cx={(selectedCraterA.x + selectedCraterB.x) / 2}
                  cy={(selectedCraterA.y + selectedCraterB.y) / 2}
                  r="5"
                  fill="#00e5ff"
                />
              </g>
            )}

            {/* Crater Detections SVG Rendering */}
            {showDetections &&
              craters.map((crater) => {
                const isSelectedA = selectedCraterA?.id === crater.id;
                const isSelectedB = selectedCraterB?.id === crater.id;
                const isHovered = hoveredCrater?.id === crater.id;
                const strokeColor = isSelectedA || isSelectedB ? '#00e5ff' : '#38bdf8';

                return (
                  <g key={crater.id}>
                    {/* Bounding box subtle dash */}
                    <rect
                      x={crater.bbox[0]}
                      y={crater.bbox[1]}
                      width={crater.bbox[2] - crater.bbox[0]}
                      height={crater.bbox[3] - crater.bbox[1]}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity={isSelectedA || isSelectedB || isHovered ? 0.75 : 0.35}
                    />

                    {/* Circular crater rim outline */}
                    <circle
                      cx={crater.x}
                      cy={crater.y}
                      r={crater.radius}
                      fill={isSelectedA || isSelectedB ? 'rgba(0, 229, 255, 0.18)' : 'none'}
                      stroke={strokeColor}
                      strokeWidth={isSelectedA || isSelectedB ? 2.5 : 1.5}
                      opacity={0.9}
                    />

                    {/* Center crosshair marker (+) */}
                    <line
                      x1={crater.x - 6}
                      y1={crater.y}
                      x2={crater.x + 6}
                      y2={crater.y}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                    />
                    <line
                      x1={crater.x}
                      y1={crater.y - 6}
                      x2={crater.x}
                      y2={crater.y + 6}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
          </svg>

          {/* Clickable HTML Labels on top of SVG */}
          {showDetections &&
            craters.map((crater) => {
              const isSelectedA = selectedCraterA?.id === crater.id;
              const isSelectedB = selectedCraterB?.id === crater.id;

              const leftPercent = (crater.x / naturalDim.width) * 100;
              const topPercent = ((crater.y - crater.radius - 6) / naturalDim.height) * 100;

              return (
                <div
                  key={`lbl-${crater.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCraterClick(crater);
                  }}
                  onMouseEnter={() => setHoveredCrater(crater)}
                  onMouseLeave={() => setHoveredCrater(null)}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer',
                    zIndex: 15,
                  }}
                >
                  <div
                    style={{
                      background: isSelectedA || isSelectedB ? 'rgba(0, 229, 255, 0.95)' : 'rgba(10, 16, 28, 0.85)',
                      color: isSelectedA || isSelectedB ? '#050a12' : '#38bdf8',
                      border: `1px solid ${isSelectedA || isSelectedB ? '#ffffff' : 'rgba(56, 189, 248, 0.4)'}`,
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{crater.name}</span>
                    {showConfidence && (
                      <span style={{ opacity: 0.85, fontSize: '0.62rem' }}>
                        {crater.confidence}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Floating Spatial Measurement Telemetry Card */}
        {activeDistance && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              padding: '16px 20px',
              maxWidth: '340px',
              border: '1px solid #00e5ff',
              boxShadow: '0 0 24px rgba(0, 229, 255, 0.25)',
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ruler size={14} /> SPATIAL VECTOR ANALYSIS
              </span>
              <button
                onClick={clearMeasurement}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                title="Clear Measurement"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '10px' }}>
              <div>{selectedCraterA?.name} &rarr; {selectedCraterB?.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                X1: {selectedCraterA?.x} Y1: {selectedCraterA?.y} | X2: {selectedCraterB?.x} Y2: {selectedCraterB?.y}
              </div>
            </div>

            {/* Unit Toggle Tabs (km / m / mi) */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', backgroundColor: 'rgba(10, 16, 28, 0.7)', padding: '3px', borderRadius: '6px' }}>
              {(['km', 'm', 'mi'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => handleUnitToggle(u)}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: unit === u ? '#00e5ff' : 'transparent',
                    color: unit === u ? '#05080e' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(56, 189, 248, 0.15)', paddingTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>PIXEL DISTANCE</div>
                <div style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: '#f8fafc', fontWeight: 600 }}>
                  {activeDistance.px} px
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: '#00e5ff' }}>REAL-WORLD DISTANCE</div>
                <div
                  className="glow-cyan"
                  style={{
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#00e5ff',
                    fontWeight: 800,
                  }}
                >
                  {activeDistance.formatted}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {activeDistance.km} km • {activeDistance.m} m • {activeDistance.mi} mi
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <button
                onClick={clearMeasurement}
                className="btn-secondary"
                style={{ width: '100%', padding: '5px 12px', fontSize: '0.75rem' }}
              >
                Clear Measurement
              </button>
            </div>
          </div>
        )}

        {/* HUD Scale Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(10, 16, 28, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#94a3b8',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '80px', height: '3px', background: '#00e5ff', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: '-4px', width: '2px', height: '11px', background: '#00e5ff' }} />
              <div style={{ position: 'absolute', right: 0, top: '-4px', width: '2px', height: '11px', background: '#00e5ff' }} />
            </div>
            <span style={{ color: '#00e5ff', fontWeight: 600 }}>
              {unit === 'm'
                ? `${(80 * resolution).toFixed(0)} M`
                : unit === 'mi'
                ? `${((80 * resolution) / 1609.34).toFixed(2)} MI`
                : `${((80 * resolution) / 1000.0).toFixed(2)} KM`}
            </span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>
            SCALE: {resolution} M/PX @ {(scale * 100).toFixed(0)}%
          </div>
        </div>

        {/* Measure Mode Instruction Pill */}
        {isMeasureMode && !activeDistance && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid #00e5ff',
              borderRadius: '9999px',
              padding: '6px 18px',
              color: '#00e5ff',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
              zIndex: 25,
            }}
          >
            {selectedCraterA ? 'SELECT TARGET CRATER B TO COMPLETE DISTANCE VECTOR' : 'SELECT ORIGIN CRATER A TO BEGIN MEASUREMENT'}
          </div>
        )}
      </div>
    </div>
  );
};
