"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";

/**
 * Real 3D layer for the dark hero shells. Glossy brand objects (and, on the homepage, the extruded MT logo)
 * float around the headline; as the hero scrolls away the camera dollies forward and rolls, so the objects
 * rush past it like a fly-through. The pointer steers the camera on desktop. Transparent canvas, so the
 * shader light field behind it stays visible. Pauses off-screen and renders a single still frame for
 * reduced motion.
 *
 * Positions are in "frame units" (-1…1 of the visible width/height at z = 0), with separate layouts for
 * landscape and portrait screens so objects frame the copy instead of covering it.
 */

type Kind = "logo" | "iris" | "torus" | "capsule" | "cube" | "pebble";
type Slot = { kind: Kind; at: [number, number, number]; size: number };

const LAYOUTS: Record<"hero" | "page", { wide: Slot[]; tall: Slot[] }> = {
  hero: {
    wide: [
      { kind: "logo", at: [0.74, 0.5, -0.4], size: 0.78 },
      { kind: "iris", at: [-0.78, 0.52, -1], size: 0.6 },
      { kind: "torus", at: [-0.66, -0.62, 0.4], size: 0.46 },
      { kind: "capsule", at: [0.8, -0.6, -0.4], size: 0.4 },
      { kind: "cube", at: [0.34, -0.88, 1.2], size: 0.22 },
      { kind: "pebble", at: [-0.3, 0.84, -2.4], size: 0.32 },
    ],
    tall: [
      { kind: "logo", at: [0.5, 0.6, 0], size: 0.7 },
      { kind: "iris", at: [-0.62, 0.66, -1], size: 0.55 },
      { kind: "torus", at: [-0.56, -0.72, 0.5], size: 0.5 },
      { kind: "capsule", at: [0.62, -0.68, -0.4], size: 0.42 },
      { kind: "cube", at: [0.06, -0.86, 1.1], size: 0.26 },
      { kind: "pebble", at: [-0.08, 0.74, -2], size: 0.3 },
    ],
  },
  page: {
    wide: [
      { kind: "iris", at: [0.8, 0.44, -0.8], size: 0.54 },
      { kind: "torus", at: [-0.84, -0.54, 0.2], size: 0.38 },
      { kind: "capsule", at: [0.68, -0.62, 0.4], size: 0.32 },
      { kind: "cube", at: [-0.7, 0.62, -1.8], size: 0.24 },
    ],
    tall: [
      { kind: "iris", at: [0.66, 0.62, -0.6], size: 0.5 },
      { kind: "torus", at: [-0.7, -0.78, 0.4], size: 0.42 },
      { kind: "capsule", at: [0.66, -0.74, 0.5], size: 0.36 },
      { kind: "cube", at: [-0.64, 0.7, -1.4], size: 0.26 },
    ],
  },
};

/** Rounded-rect outline for the logo tile. */
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The MT monogram, same outline as <LogoMark> (44-unit grid), centred and flipped to y-up. */
function monogram() {
  const pts: [number, number][] = [
    [12, 15], [16.2, 15], [20.2, 19.4], [20.2, 15], [32.6, 15], [32.6, 18.4], [28, 18.4], [28, 29.4],
    [24.4, 29.4], [24.4, 18.4], [20.2, 18.4], [20.2, 23.6], [15.6, 18.6], [15.6, 29.4], [12, 29.4],
  ];
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => {
    const px = (x - 22) / 22;
    const py = -(y - 22) / 22;
    if (i === 0) s.moveTo(px, py);
    else s.lineTo(px, py);
  });
  s.closePath();
  return s;
}

function makeObject(kind: Kind, mats: Record<string, THREE.Material>) {
  const group = new THREE.Group();
  switch (kind) {
    case "logo": {
      const tile = new THREE.ExtrudeGeometry(roundedRect(1.9, 1.9, 0.16), {
        depth: 0.32,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        bevelSegments: 4,
        curveSegments: 8,
      });
      tile.center();
      const mark = new THREE.ExtrudeGeometry(monogram(), {
        depth: 0.16,
        bevelEnabled: true,
        bevelSize: 0.018,
        bevelThickness: 0.02,
        bevelSegments: 2,
      });
      mark.center();
      const markMesh = new THREE.Mesh(mark, mats.orange);
      markMesh.scale.setScalar(0.95);
      markMesh.position.z = 0.25;
      group.add(new THREE.Mesh(tile, mats.navy), markMesh);
      group.rotation.set(-0.18, -0.42, 0.06);
      break;
    }
    case "iris":
      group.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), mats.iris));
      break;
    case "torus":
      group.add(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.36, 48, 120), mats.ember));
      group.rotation.set(0.9, 0.3, 0);
      break;
    case "capsule":
      group.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.1, 12, 32), mats.chrome));
      group.rotation.set(0.3, 0, -0.9);
      break;
    case "cube": {
      const g = new THREE.ExtrudeGeometry(roundedRect(1.4, 1.4, 0.3), {
        depth: 1,
        bevelEnabled: true,
        bevelSize: 0.18,
        bevelThickness: 0.18,
        bevelSegments: 6,
      });
      g.center();
      group.add(new THREE.Mesh(g, mats.orange));
      group.rotation.set(0.6, 0.7, 0);
      break;
    }
    case "pebble":
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mats.glass));
      break;
  }
  return group;
}

export function HeroScene({
  variant = "page",
  side = "both",
  className = "",
}: {
  variant?: "hero" | "page";
  /** "right" keeps every object in the right part of the frame, for left-aligned hero copy. */
  side?: "both" | "right";
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    const mobile = matchMedia("(max-width: 767px)").matches;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the light field alone still carries the hero
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "absolute inset-0 size-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    // A dim environment keeps the brand colours saturated; the lights below do the shaping.
    scene.environmentIntensity = 0.45;

    // Warm key from the light field's hot corner, ember rim from below: the objects read as lit by the scene.
    const key = new THREE.DirectionalLight("#ffd2a1", 2.2);
    key.position.set(4, 5, 6);
    const rim = new THREE.PointLight("#ff5a1a", 40, 20);
    rim.position.set(-3, -3, 2);
    scene.add(key, rim, new THREE.AmbientLight("#2a1408", 0.6));

    const mats: Record<string, THREE.Material> = {
      navy: new THREE.MeshPhysicalMaterial({ color: "#0F2944", roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
      orange: new THREE.MeshPhysicalMaterial({
        color: "#FE9004",
        emissive: "#7a2c00",
        emissiveIntensity: 0.25,
        roughness: 0.22,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
      ember: new THREE.MeshPhysicalMaterial({
        color: "#ff6a1a",
        emissive: "#7a1c05",
        emissiveIntensity: 0.3,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffb347"),
      }),
      // Holographic pearl: the "new gen" accent among the brand oranges.
      iris: new THREE.MeshPhysicalMaterial({
        color: "#c9c2d6",
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [180, 820],
      }),
      chrome: new THREE.MeshPhysicalMaterial({ color: "#e8e4df", metalness: 1, roughness: 0.12, envMapIntensity: 1.8 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#ffd9b0",
        metalness: 0,
        roughness: 0.05,
        transmission: mobile ? 0 : 1,
        opacity: mobile ? 0.55 : 1,
        transparent: mobile,
        thickness: 0.8,
        ior: 1.45,
        flatShading: true,
      }),
    };

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    const BASE_Z = 8;
    camera.position.set(0, 0, BASE_Z);

    type Item = { group: THREE.Group; slot: Slot; spin: THREE.Vector3; phase: number; base: THREE.Vector3 };
    const items: Item[] = [];
    let portrait = false;
    // Narrow portrait frames are only a few world units wide, so objects shrink with the width.
    let sizeK = 1;

    const build = () => {
      items.forEach((it) => scene.remove(it.group));
      items.length = 0;
      const layout = LAYOUTS[variant][portrait ? "tall" : "wide"];
      layout.forEach((slot, i) => {
        const group = makeObject(slot.kind, mats);
        group.scale.setScalar(slot.size);
        scene.add(group);
        items.push({
          group,
          slot,
          phase: i * 1.7,
          base: new THREE.Vector3(),
          spin: new THREE.Vector3(0.12 + (i % 3) * 0.05, 0.18 + (i % 2) * 0.1, 0.04).multiplyScalar(slot.kind === "logo" ? 0.6 : 1),
        });
      });
    };

    const place = () => {
      // Visible half-size of the frame at z = 0 for the current aspect.
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * BASE_Z;
      const halfW = halfH * camera.aspect;
      sizeK = portrait ? THREE.MathUtils.clamp(camera.aspect / 0.85, 0.5, 1) : 1;
      items.forEach((it) => {
        let x = it.slot.at[0];
        // Wide screens only: on portrait the objects already sit above and below the copy.
        if (side === "right" && !portrait) x = 0.42 + Math.abs(x) * 0.62;
        it.base.set(x * halfW, it.slot.at[1] * halfH, it.slot.at[2]);
      });
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const nextPortrait = camera.aspect < 0.9;
      if (nextPortrait !== portrait || items.length === 0) {
        portrait = nextPortrait;
        build();
        intro();
      }
      place();
      if (reduce) render(0);
    };

    // Intro: objects pop in from nothing with an elastic overshoot, staggered.
    const appear = { v: reduce ? 1 : 0 };
    const pops: number[] = [];
    let introTl: gsap.core.Timeline | null = null;
    const intro = () => {
      pops.length = 0;
      items.forEach(() => pops.push(reduce ? 1 : 0));
      if (reduce) return;
      introTl?.kill();
      introTl = gsap.timeline({ delay: variant === "hero" ? 0.55 : 0.3 });
      items.forEach((_, i) => {
        const o = { v: 0 };
        introTl!.to(o, { v: 1, duration: 1.8, ease: "elastic.out(1, 0.55)", onUpdate: () => (pops[i] = o.v) }, i * 0.1);
      });
      appear.v = 1;
    };

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const onPointer = (e: PointerEvent) => {
      pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    if (fine && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });

    let progress = 0;
    let time = 0;
    const render = (dt: number) => {
      time += dt;
      // Scroll-out progress of the hero: 0 at rest, 1 once it has fully left the top of the viewport.
      const rect = host.getBoundingClientRect();
      const target = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      progress += (target - progress) * (reduce ? 1 : 1 - Math.pow(0.0005, dt || 1));
      pointer.lerp(pointerTarget, 1 - Math.pow(0.04, dt || 1));

      // Camera fly-through: dolly forward, drift up, roll slightly; pointer nudges the frame.
      const p = progress;
      const ease = p * p * (3 - 2 * p);
      camera.position.set(pointer.x * 0.6, pointer.y * 0.4 + ease * 0.8, BASE_Z - ease * (portrait ? 4.2 : 5.4));
      camera.rotation.set(0, 0, 0);
      camera.lookAt(pointer.x * 0.2, ease * 0.4, 0);
      camera.rotation.z += ease * 0.14;

      items.forEach((it, i) => {
        const g = it.group;
        const bob = Math.sin(time * 0.8 + it.phase) * 0.14;
        // Objects also spread outward as the camera pushes in, so they fly past rather than into the lens.
        const spread = 1 + ease * 0.55;
        g.position.set(it.base.x * spread, it.base.y * spread + bob, it.base.z + ease * (i % 2 ? 1.2 : 0.4));
        g.rotation.x += it.spin.x * dt;
        g.rotation.y += it.spin.y * dt;
        if (it.slot.kind === "logo") {
          // The logo turns to face the camera on its way past instead of tumbling.
          g.rotation.x = -0.18 + Math.sin(time * 0.6) * 0.08 + pointer.y * -0.25;
          g.rotation.y = -0.42 + Math.sin(time * 0.45) * 0.18 + pointer.x * 0.35 + ease * Math.PI * 0.9;
        }
        const s = it.slot.size * sizeK * (pops[i] ?? 1);
        g.scale.setScalar(Math.max(s, 0.0001));
      });

      renderer.render(scene, camera);
    };

    let visible = false;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      render(dt);
      if (visible && !reduce) raf = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !reduce) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(host);
    if (reduce) render(0);

    return () => {
      cancelAnimationFrame(raf);
      introTl?.kill();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      Object.values(mats).forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant, side]);

  return <div ref={hostRef} aria-hidden className={`pointer-events-none absolute inset-0 z-[1] ${className}`} />;
}
