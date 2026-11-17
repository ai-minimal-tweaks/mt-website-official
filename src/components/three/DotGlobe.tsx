"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Rough lat/lon of markets the agency works across — rendered as glowing ember pins joined by arcs.
const PINS: [number, number][] = [
  [28.6, 77.2], // Delhi NCR
  [19.1, 72.9], // Mumbai
  [12.97, 77.6], // Bengaluru
  [25.2, 55.3], // Dubai
  [51.5, -0.1], // London
  [40.7, -74.0], // New York
  [1.35, 103.8], // Singapore
];

const toVec = (lat: number, lon: number, r = 1) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

const dotVertex = /* glsl */ `
  uniform float uSize;
  varying float vFacing;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = normalize((modelViewMatrix * vec4(position, 0.0)).xyz).z;
    gl_PointSize = uSize * (0.55 + 0.45 * vFacing);
    gl_Position = projectionMatrix * mv;
  }
`;
const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.35, d) * mix(0.08, 0.85, smoothstep(-0.2, 0.9, vFacing));
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Interactive dotted globe: auto-rotates, drag to spin, pauses off-screen. */
export function DotGlobe({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.domElement.className = "absolute inset-0 size-full touch-pan-y";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    // GPU context lost (memory pressure on phones): hide the canvas rather than leave a broken frame.
    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      renderer.domElement.style.display = "none";
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 0, 4.4);
    const globe = new THREE.Group();
    globe.rotation.set(0.38, -1.9, 0); // start with India facing the viewer
    scene.add(globe);

    // Fibonacci sphere keeps the dot spacing even.
    const count = 2200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = Math.PI * (3 - Math.sqrt(5)) * i;
      positions.set([Math.cos(th) * rad, y, Math.sin(th) * rad], i * 3);
    }
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dotsMat = new THREE.ShaderMaterial({
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      uniforms: { uSize: { value: 3.2 * dpr }, uColor: { value: new THREE.Color("#7c7c78") } },
      transparent: true,
      depthWrite: false,
    });
    globe.add(new THREE.Points(dotsGeo, dotsMat));

    const ember = new THREE.Color("#ff6a1a");
    const pinGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const haloGeo = new THREE.RingGeometry(0.04, 0.055, 32);
    const pins: THREE.Mesh[] = [];
    PINS.forEach(([lat, lon], i) => {
      const pos = toVec(lat, lon, 1.005);
      const pin = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: ember }));
      pin.position.copy(pos);
      const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: ember, transparent: true, side: THREE.DoubleSide }));
      halo.position.copy(pos);
      halo.lookAt(pos.clone().multiplyScalar(2));
      halo.userData.phase = i * 0.7;
      globe.add(pin, halo);
      pins.push(halo);
    });

    // Arcs from the Gurugram HQ to every other market.
    const origin = toVec(PINS[0][0], PINS[0][1]);
    const arcMats: THREE.LineDashedMaterial[] = [];
    PINS.slice(1).forEach(([lat, lon]) => {
      const end = toVec(lat, lon);
      const mid = origin.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1 + origin.distanceTo(end) * 0.38);
      const curve = new THREE.QuadraticBezierCurve3(origin, mid, end);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
      const mat = new THREE.LineDashedMaterial({ color: ember, dashSize: 0.05, gapSize: 0.03, transparent: true, opacity: 0.75 });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      arcMats.push(mat);
      globe.add(line);
    });

    const resize = () => {
      // Layout size, not getBoundingClientRect(): GSAP scales these hosts, and a transformed size is wrong (0 at scale 0).
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Drag to spin with inertia.
    let dragging = false;
    let lastX = 0;
    let velocity = 0.0016;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velocity = (e.clientX - lastX) * 0.0009;
      globe.rotation.y += (e.clientX - lastX) * 0.006;
      lastX = e.clientX;
    };
    const onUp = () => (dragging = false);
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let visible = false;
    let t = 0;
    let scroll = 0;
    const tick = () => {
      t += 0.016;
      if (!dragging) {
        velocity += (0.0016 - velocity) * 0.02;
        globe.rotation.y += velocity;
      }
      pins.forEach((h) => {
        const s = 1 + ((t + h.userData.phase) % 1.6) * 1.4;
        h.scale.setScalar(s);
        (h.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (s - 1) / 2.2);
      });
      arcMats.forEach((m) => (m.opacity = 0.45 + 0.3 * Math.sin(t * 1.4)));
      // Scroll camera: as the globe crosses the viewport the camera swings over it (tilt) and pushes in.
      const rect = host.getBoundingClientRect();
      const through = Math.min(Math.max(1 - (rect.top + rect.height) / (window.innerHeight + rect.height), 0), 1); // 0 entering → 1 leaving
      const k = (through - 0.5) * 2; // -1 … 1
      scroll += (k - scroll) * 0.08;
      camera.position.set(0, scroll * -0.9, 4.4 - (1 - Math.abs(scroll)) * 0.5);
      camera.lookAt(0, 0, 0);
      globe.rotation.x = 0.38 + scroll * 0.35;
      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(host);
    if (reduce) tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // Caller positions the globe (absolute inside a card); canvas fills it.
  return <div ref={hostRef} aria-hidden className={className.includes("absolute") ? className : `relative ${className}`} />;
}
