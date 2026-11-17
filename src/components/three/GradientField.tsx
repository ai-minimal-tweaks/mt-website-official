"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Domain-warped fbm in the brand's ember palette. uScroll pushes the glow upward as the section leaves,
// uPointer pulls a hot spot toward the cursor / touch point.
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform vec2 uRes;
  uniform float uIntensity;
  uniform vec2 uBias;

  // Sin-free hash (Dave Hoskins). The classic fract(sin(x)*43758.5) hash loses precision on mobile GPUs and
  // turns the smooth light into blocky, polygon-like artifacts.
  float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    i = mod(i, 289.0); // keep lattice coordinates small so the hash stays precise as time advances
    float a = hash12(i), b = hash12(i+vec2(1,0)), c = hash12(i+vec2(0,1)), d = hash12(i+vec2(1,1));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0; float a = 0.5; mat2 r = mat2(0.8,-0.6,0.6,0.8); for(int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.02; a *= 0.5; } return v; }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.06;

    // Low-frequency warp only: the design's light is soft and blurred, not fibrous.
    vec2 q = vec2(fbm(p*0.7 + vec2(0.0, t)), fbm(p*0.7 + vec2(5.2, -t)));
    vec2 r = vec2(fbm(p*0.8 + 1.6*q + vec2(1.7, 9.2) + t*0.6), fbm(p*0.8 + 1.6*q + vec2(8.3, 2.8) - t*0.4));
    float f = fbm(p*0.6 + 1.8*r);
    vec2 w = p + (r - 0.5) * 0.55; // warped coordinates make the plumes drift and billow

    vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
    float hot = exp(-4.0 * length(p - pointer)) * 0.35;
    float lift = uScroll * 0.55;
    // Plume top-right (amber core), ember plume bottom-left, a faint stroke rising through the middle.
    float plumeR = exp(-3.4 * length((w - vec2(0.46*aspect, 0.46 + lift) + uBias) * vec2(0.85, 1.2)));
    float plumeL = exp(-4.2 * length((w - vec2(-0.1*aspect, -0.66 + lift) + uBias*0.5) * vec2(1.3, 0.9)));
    float streak = exp(-12.0 * abs(w.x - 0.2*aspect + 0.25*w.y)) * smoothstep(0.5, -0.3, w.y) * 0.3;

    float heat = clamp((plumeR*1.35 + plumeL*1.05 + streak) * (0.5 + 0.75*f) + hot, 0.0, 1.0) * uIntensity;

    vec3 black = vec3(0.012, 0.006, 0.003);
    vec3 ember = vec3(0.4, 0.07, 0.015);
    vec3 flame = vec3(0.97, 0.37, 0.07);
    vec3 amber = vec3(1.0, 0.74, 0.36);
    vec3 col = mix(black, ember, smoothstep(0.14, 0.45, heat));
    col = mix(col, flame, smoothstep(0.42, 0.74, heat));
    col = mix(col, amber, smoothstep(0.74, 1.0, heat));

    float vig = smoothstep(1.35, 0.25, length((uv-0.5)*vec2(aspect*0.85, 1.0)));
    col *= mix(0.55, 1.0, vig);
    col += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.035; // film grain to avoid banding
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Props = {
  className?: string;
  /**
   * Hero light fields render on every device. Other fields (dark bands, footer) use the CSS gradient on phones and
   * tablets: each WebGL canvas costs GPU memory, and mobile Safari drops contexts when a page holds too many.
   */
  priority?: boolean;
  intensity?: number;
  /** Offsets the glow centres; lets each section frame the light differently. */
  bias?: [number, number];
};

export function GradientField({ className = "", intensity = 1, bias = [0, 0], priority = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!priority && matchMedia("(max-width: 1023px), (pointer: coarse)").matches) return; // CSS fallback stays visible

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // CSS gradient fallback behind the canvas stays visible
    }
    const mobile = matchMedia("(max-width: 767px)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Render below native resolution — the field is soft, so this is invisible and saves a lot of GPU.
    const scale = mobile ? 0.5 : 0.65;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * scale);
    renderer.domElement.className = "absolute inset-0 size-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    // Context lost (GPU memory pressure): drop the canvas so the CSS gradient behind it shows instead.
    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      renderer.domElement.style.display = "none";
    });

    const uniforms = {
      uTime: { value: Math.random() * 100 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.7, 0.65) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: intensity },
      uBias: { value: new THREE.Vector2(bias[0], bias[1]) },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();

    const resize = () => {
      // Layout size, not getBoundingClientRect(): GSAP scales these hosts, and a transformed size is wrong (0 at scale 0).
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector2(0.7, 0.65);
    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = false;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Wrapped so shader inputs stay small (mobile float precision); an hour of drift before it wraps.
      uniforms.uTime.value = (uniforms.uTime.value + dt) % 3600;
      uniforms.uPointer.value.lerp(target, 1 - Math.pow(0.02, dt));
      const rect = host.getBoundingClientRect();
      uniforms.uScroll.value = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(host);
    if (reduce) renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [intensity, bias[0], bias[1], priority]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`absolute inset-0 overflow-hidden bg-[radial-gradient(60%_70%_at_78%_30%,#f26a1b_0%,#7a1c05_38%,transparent_70%),radial-gradient(45%_55%_at_25%_85%,#c2410c_0%,transparent_70%),#050302] ${className}`}
    />
  );
}
