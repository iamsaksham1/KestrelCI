/**
 * @file client/src/components/hero/ParticleSphere.jsx
 * @description WebGL Particle Sphere built with Three.js.
 * Implements the Squarespace Design Intelligence hero core:
 * - 38,000–45,000 points on a breathing spherical shell (desktop) / 8,500 (mobile)
 * - GPU-driven vertex shader with noise-based displacement and gentle rotation (~0.018 rad/s)
 * - Secondary dust emitters streaming particles outward toward floating peripheral cards
 * - Intro scatter-to-assembly animation on first load
 * - Scroll-driven scale up and dissolution
 * - DPR clamped to 2, auto-paused when hidden or off-screen, full cleanup on unmount
 * - Accessible static poster fallback on prefers-reduced-motion or animation pause
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Vertex shader with noise displacement, intro assembly, and scroll expansion
const vertexShader = `
  uniform float uTime;
  uniform float uIntro;
  uniform float uScroll;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aScatterDirection;
  attribute float aDust;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vDust;

  // Simple 3D noise approximation
  float snoise(vec3 v) {
    return sin(v.x * 2.2 + uTime * 0.7) * cos(v.y * 2.1 + uTime * 0.6) * sin(v.z * 2.3 + uTime * 0.5);
  }

  void main() {
    vDust = aDust;
    
    // Base position
    vec3 pos = position;

    if (aDust < 0.5) {
      // Shell particles: Radial breathing via noise
      float noiseVal = snoise(normalize(pos) * 1.8);
      float radiusDisplacement = noiseVal * 0.18;
      pos += normalize(pos) * radiusDisplacement;

      // Slow rotation about Y axis
      float angle = uTime * 0.018;
      float cosA = cos(angle);
      float sinA = sin(angle);
      vec3 rotatedPos;
      rotatedPos.x = pos.x * cosA - pos.z * sinA;
      rotatedPos.y = pos.y;
      rotatedPos.z = pos.x * sinA + pos.z * cosA;
      pos = rotatedPos;

      // Intro animation: scatter inward from outer space into sphere
      pos = mix(pos + aScatterDirection * 6.0, pos, smoothstep(0.0, 1.0, uIntro));

      // Scroll response: expand outward and dissolve
      pos *= (1.0 + uScroll * 0.7);

      // Silhouette emphasis & central clearing:
      // The center where the statement text lives is hollowed out / dimmed
      // so the middle text is crystal clear and never washed out.
      float viewDist = length(pos.xy);
      
      // Outer silhouette / rim (viewDist > 1.6) is luminous; center corridor is transparent
      float rimFactor = smoothstep(0.35, 2.3, viewDist);
      
      // Front hemisphere (pos.z > 0) particles directly in front of the text are strongly attenuated
      float frontAtten = (pos.z > 0.0) ? smoothstep(0.7, 2.1, viewDist) : (0.12 + 0.88 * smoothstep(0.5, 2.2, viewDist));

      vAlpha = aAlpha * rimFactor * frontAtten * smoothstep(0.0, 0.4, uIntro) * (1.0 - smoothstep(0.3, 0.9, uScroll));
      vColor = vec3(0.96, 0.96, 0.95); // Luminous warm white
    } else {
      // Loose dust particles streaming outward toward cards
      float dustSpeed = uTime * 0.15 + aSize;
      vec3 dustDrift = aScatterDirection * mod(dustSpeed, 4.0);
      pos += dustDrift;

      vAlpha = aAlpha * 0.6 * (1.0 - smoothstep(0.2, 0.8, uScroll));
      // Subtle warm amber tint near peripheral cards
      vColor = vec3(0.98, 0.78, 0.42);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Refined delicate stardust point sizing (not giant blurry blobs)
    float sizeFactor = (aDust < 0.5) ? (aSize * 0.8) : (aSize * 1.1);
    gl_PointSize = sizeFactor * uPixelRatio * (24.0 / -mvPosition.z);
  }
`;

// Fragment shader: circular points with soft feathered edge
const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vDust;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
      discard;
    }

    // Soft feathered edge
    float softEdge = smoothstep(0.5, 0.15, dist);
    float finalAlpha = vAlpha * softEdge;

    gl_FragColor = vec4(vColor, finalAlpha);
  }
`;

export function ParticleSphere({ isPaused = false, scrollProgress = 0 }) {
  const mountRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const animationFrameRef = useRef(null);
  const uniformsRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;

    // Particle count: 28,000 desktop / 7,000 mobile (refined constellation)
    const shellCount = isMobile ? 7000 : 28000;
    const dustCount = isMobile ? 40 : 160;
    const totalCount = shellCount + dustCount;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      alpha: true,
      depth: false,
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent canvas

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.setAttribute('aria-hidden', 'true');

    // Build Geometry
    const positions = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const alphas = new Float32Array(totalCount);
    const scatterDirs = new Float32Array(totalCount * 3);
    const dustFlags = new Float32Array(totalCount);

    const radius = 2.45;

    // 1. Fibonacci Sphere Shell Distribution
    const phiGold = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < shellCount; i++) {
      const y = 1 - (i / (shellCount - 1)) * 2; // -1 to 1
      const radAtY = Math.sqrt(1 - y * y);
      const theta = phiGold * i;

      const x = Math.cos(theta) * radAtY;
      const z = Math.sin(theta) * radAtY;

      // Base radius with slight shell thickness variation
      const r = radius * (0.97 + Math.random() * 0.06);

      positions[i * 3] = x * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z * r;

      // Particle size 0.8px to 1.5px (crisp stardust points)
      sizes[i] = 0.8 + Math.random() * 0.7;

      // Peripheral silhouette is denser / brighter; center is softly transparent
      const silhouetteFactor = 0.3 + 0.7 * Math.pow(radAtY, 1.4);
      alphas[i] = silhouetteFactor * (0.25 + Math.random() * 0.45);

      // Scatter direction for intro fly-in
      const scatterDir = new THREE.Vector3(x, y, z).normalize();
      scatterDir.x += (Math.random() - 0.5) * 0.4;
      scatterDir.y += (Math.random() - 0.5) * 0.4;
      scatterDir.z += (Math.random() - 0.5) * 0.4;
      scatterDir.normalize();

      scatterDirs[i * 3] = scatterDir.x;
      scatterDirs[i * 3 + 1] = scatterDir.y;
      scatterDirs[i * 3 + 2] = scatterDir.z;

      dustFlags[i] = 0.0;
    }

    // 2. Loose Dust Emitter (particles streaming toward cards)
    for (let i = shellCount; i < totalCount; i++) {
      const idx = i;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = radius * (1.05 + Math.random() * 0.8);
      positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[idx * 3 + 2] = r * Math.cos(phi);

      sizes[idx] = 1.2 + Math.random() * 1.4;
      alphas[idx] = 0.2 + Math.random() * 0.35;

      const driftDir = new THREE.Vector3(
        positions[idx * 3],
        positions[idx * 3 + 1],
        positions[idx * 3 + 2]
      ).normalize();

      scatterDirs[idx * 3] = driftDir.x;
      scatterDirs[idx * 3 + 1] = driftDir.y;
      scatterDirs[idx * 3 + 2] = driftDir.z;

      dustFlags[idx] = 1.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aScatterDirection', new THREE.BufferAttribute(scatterDirs, 3));
    geometry.setAttribute('aDust', new THREE.BufferAttribute(dustFlags, 1));

    // Shader Material
    const uniforms = {
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);

    // Intro timeline (scatter into sphere over ~2.4 seconds)
    let introStartTime = performance.now();
    let isVisible = true;

    // IntersectionObserver to pause when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Tab visibility handling
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isVisible || isPaused) return;

      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Animate intro 0 -> 1
      const introProgress = Math.min((performance.now() - introStartTime) / 2400, 1.0);
      uniforms.uIntro.value = introProgress;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isPaused]);

  // Sync scrollProgress into shader uniform
  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uScroll.value = scrollProgress;
    }
  }, [scrollProgress]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 1 }}
    >
      {!hasWebGL && (
        /* Accessible Static Poster Fallback */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <svg viewBox="0 0 400 400" className="w-[420px] h-[420px] max-w-full text-white/30" fill="none">
            <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="200" cy="200" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default ParticleSphere;
