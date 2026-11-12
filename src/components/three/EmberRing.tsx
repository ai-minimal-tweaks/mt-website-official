"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Glossy ember torus — the "0" in the 404. Spins slowly, leans toward the pointer, pauses off-screen,
 * and holds still for reduced motion. Transparent canvas so it sits inline between the 4s.
 */
export function EmberRing({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // CSS ring fallback below stays visible
    }
    host.dataset.webgl = "on";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "absolute inset-0 size-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);

    // A tall torus reads as a "0"; the scale stretch happens on a parent so the spin stays clean.
    const holder = new THREE.Group();
    holder.scale.set(0.78, 1.08, 0.78);
    scene.add(holder);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.42, 64, 160),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ff6a1a"),
        emissive: new THREE.Color("#7a1c05"),
        emissiveIntensity: 0.35,
        roughness: 0.22,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffb347"),
      }),
    );
    holder.add(ring);

    scene.add(new THREE.HemisphereLight("#ffd9a8", "#1a0702", 1.1));
    const key = new THREE.DirectionalLight("#fff1dc", 2.6);
    key.position.set(3, 4, 5);
    const rim = new THREE.DirectionalLight("#ff3d00", 3.2);
    rim.position.set(-4, -2, -3);
    const fill = new THREE.PointLight("#ffb347", 18, 12);
    fill.position.set(0, 0, 3.5);
    scene.add(key, rim, fill);

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

    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.9;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.7;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let visible = false;
    let t = 0;
    const tick = () => {
      t += 0.016;
      ring.rotation.y = t * 0.55;
      ring.rotation.x = Math.sin(t * 0.7) * 0.18;
      holder.rotation.y += (target.x - holder.rotation.y) * 0.06;
      holder.rotation.x += (target.y - holder.rotation.x) * 0.06;
      holder.position.y = Math.sin(t * 1.3) * 0.06;
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
      window.removeEventListener("pointermove", onPointer);
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <span ref={hostRef} aria-hidden className={`group/ring relative inline-block ${className}`}>
      {/* Fallback when WebGL isn't available */}
      <span className="absolute inset-[12%] rounded-[50%] border-[0.16em] border-flame group-data-[webgl=on]/ring:hidden" />
    </span>
  );
}
