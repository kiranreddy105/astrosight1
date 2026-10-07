import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CraterItem } from '../types';
import { RotateCcw, ZoomIn, ZoomOut, Compass, Eye } from 'lucide-react';

interface Props {
  planet: 'Moon' | 'Mars';
  craters?: CraterItem[];
  selectedCraterId?: string | null;
  onSelectCrater?: (crater: CraterItem) => void;
  height?: string;
}

export const ThreePlanetGlobe: React.FC<Props> = ({
  planet,
  craters = [],
  selectedCraterId,
  onSelectCrater,
  height = '500px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    crater: CraterItem;
    x: number;
    y: number;
  } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  // Zoom control
  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(8, Math.min(28, cameraRef.current.position.z + delta));
    }
  };

  const handleReset = () => {
    if (globeGroupRef.current && cameraRef.current) {
      globeGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 0, 14);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const heightPx = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Globe Group (holds globe, markers, and grid)
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // 3. Procedural Texture for Planet
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (planet === 'Mars') {
      ctx.fillStyle = '#b44a2b';
      ctx.fillRect(0, 0, 1024, 512);

      // Dark basalt plains (Acidalia, Syrtis Major)
      for (let i = 0; i < 35; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 70 + 20;
        const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
        grad.addColorStop(0, 'rgba(65, 20, 10, 0.55)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar Ice
      ctx.fillStyle = 'rgba(245, 250, 255, 0.85)';
      ctx.fillRect(0, 0, 1024, 25);
      ctx.fillRect(0, 487, 1024, 25);
    } else {
      // Moon
      ctx.fillStyle = '#616773';
      ctx.fillRect(0, 0, 1024, 512);

      // Maria
      for (let i = 0; i < 45; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 85 + 25;
        const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
        grad.addColorStop(0, 'rgba(35, 40, 48, 0.6)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright craters
      for (let i = 0; i < 90; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const cr = Math.random() * 12 + 2;
        ctx.fillStyle = 'rgba(225, 235, 250, 0.65)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const planetTexture = new THREE.CanvasTexture(canvas);
    const globeGeometry = new THREE.SphereGeometry(4.5, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.88,
      metalness: 0.08,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // 4. Coordinate Grid Rings (Planetary Latitude/Longitude lines)
    const gridGroup = new THREE.Group();
    // Parallels (Latitudes)
    [-60, -30, 0, 30, 60].forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = 4.51 * Math.sin(phi);
      const y = 4.51 * Math.cos(phi);
      const circleGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
      const circleMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: lat === 0 ? 0.25 : 0.1,
      });
      const circleMesh = new THREE.Mesh(circleGeo, circleMat);
      circleMesh.position.y = y;
      circleMesh.rotation.x = Math.PI / 2;
      gridGroup.add(circleMesh);
    });
    globeGroup.add(gridGroup);

    // 5. Crater Markers
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    globeGroup.add(markersGroup);

    // Dynamically calculate coordinate bounds for non-standard image resolutions
    const maxX = Math.max(...craters.map((c) => c.x), 512);
    const maxY = Math.max(...craters.map((c) => c.y), 512);
    const normRefX = Math.max(maxX * 1.1, 416);
    const normRefY = Math.max(maxY * 1.1, 416);

    // Map 2D image coordinates to spherical surface coordinates
    craters.forEach((crater) => {
      const normX = (crater.x / normRefX - 0.5) * 1.8; // centered azimuth
      const normY = -(crater.y / normRefY - 0.5) * 1.8; // centered elevation

      const phi = Math.PI / 2 - normY;
      const theta = normX;

      const sphereR = 4.58;
      const x = sphereR * Math.sin(phi) * Math.sin(theta);
      const y = sphereR * Math.cos(phi);
      const z = sphereR * Math.sin(phi) * Math.cos(theta);

      const isSelected = selectedCraterId === crater.id;

      // Marker beacon pin
      const markerGeo = new THREE.SphereGeometry(isSelected ? 0.18 : 0.1, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x00e5ff : 0x38bdf8,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(x, y, z);
      markerMesh.userData = { crater };

      // Halo ring around marker
      const ringGeo = new THREE.RingGeometry(0.18, 0.26, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x00e5ff : 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0);
      markersGroup.add(ring);

      markersGroup.add(markerMesh);
    });

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0x101b2b, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(15, 8, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    rimLight.position.set(-12, -4, -6);
    scene.add(rimLight);

    // 7. Mouse Orbit & Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging && globeGroupRef.current) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        globeGroupRef.current.rotation.y += deltaX * 0.006;
        globeGroupRef.current.rotation.x += deltaY * 0.006;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleZoom(e.deltaY * 0.015);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging && globeGroupRef.current) {
        // Very slow idle rotation
        globeGroupRef.current.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [planet, craters, selectedCraterId]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating 3D Navigation Controls */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => handleZoom(-2)}
          title="Zoom In"
          style={{
            background: 'rgba(14, 21, 35, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => handleZoom(2)}
          title="Zoom Out"
          style={{
            background: 'rgba(14, 21, 35, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleReset}
          title="Reset Orientation"
          style={{
            background: 'rgba(14, 21, 35, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Sphere Telemetry Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(10, 16, 28, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: '#94a3b8',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <span>
          BODY: <strong style={{ color: planet === 'Mars' ? '#ef4444' : '#38bdf8' }}>{planet.toUpperCase()}</strong>
        </span>
        <span>
          CRATERS MAPPED: <strong style={{ color: '#ffffff' }}>{craters.length}</strong>
        </span>
        <span>ORBIT: 400 KM CIRCULAR</span>
      </div>
    </div>
  );
};
