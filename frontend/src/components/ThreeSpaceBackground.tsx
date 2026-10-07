import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  planetType?: 'moon' | 'mars';
}

export const ThreeSpaceBackground: React.FC<Props> = ({ planetType = 'moon' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Starfield
    const starsCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = (Math.random() - 0.5) * 80 - 10;

      // Color variation (electric blue, white, faint cyan)
      const isCyan = Math.random() > 0.8;
      starColors[i] = isCyan ? 0.4 : 0.9;
      starColors[i + 1] = isCyan ? 0.9 : 0.95;
      starColors[i + 2] = 1.0;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 3. Procedural Celestial Sphere (Moon / Mars)
    const sphereRadius = 6.2;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);

    // Create high-resolution procedural canvas texture for Moon / Mars
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (planetType === 'mars') {
      // Mars rusty surface
      ctx.fillStyle = '#9b3c22';
      ctx.fillRect(0, 0, 1024, 512);

      // Darker basaltic maria
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 80 + 20;
        const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
        grad.addColorStop(0, 'rgba(75, 25, 15, 0.45)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // North & South ice caps
      ctx.fillStyle = 'rgba(240, 245, 255, 0.8)';
      ctx.fillRect(0, 0, 1024, 30);
      ctx.fillRect(0, 485, 1024, 27);
    } else {
      // Moon regolith grayscale
      ctx.fillStyle = '#555a64';
      ctx.fillRect(0, 0, 1024, 512);

      // Dark lunar maria
      const mariaSpots = [
        { x: 300, y: 180, r: 120 },
        { x: 450, y: 220, r: 140 },
        { x: 220, y: 310, r: 90 },
        { x: 680, y: 200, r: 110 },
        { x: 780, y: 330, r: 100 },
      ];
      mariaSpots.forEach((m) => {
        const grad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
        grad.addColorStop(0, 'rgba(40, 44, 52, 0.65)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bright crater rays (Tycho/Copernicus rays)
      for (let i = 0; i < 70; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const cr = Math.random() * 12 + 3;
        ctx.fillStyle = 'rgba(210, 220, 235, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(25, 28, 34, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const planetTexture = new THREE.CanvasTexture(canvas);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.92,
      metalness: 0.08,
    });

    const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
    planetMesh.position.set(7.5, -1.2, 0); // Positioned slightly to right for hero cinematic composition
    scene.add(planetMesh);

    // 4. Orbital rings
    const ringGeometry = new THREE.RingGeometry(8.5, 8.56, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.position.copy(planetMesh.position);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = Math.PI / 8;
    scene.add(ringMesh);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1020, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(20, 10, 15);
    scene.add(sunLight);

    // Rim lighting (electric blue aura)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    rimLight.position.set(-15, -5, -5);
    scene.add(rimLight);

    // 6. Animation Loop & Parallax
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow planetary rotation
      planetMesh.rotation.y = elapsedTime * 0.04;
      ringMesh.rotation.z = elapsedTime * 0.015;

      // Subtle parallax camera drift
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeometry.dispose();
      planetMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [planetType]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
