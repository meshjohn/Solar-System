"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { starVertexShader, starFragmentShader } from "@/shaders";

export default function Stars({ count = 5500 }: { count?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, phases, temps } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const ph = new Float32Array(count);
    const tp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 600 + Math.random() * 1600;
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      pos[i * 3]     = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(theta);
      // Realistic IMF: more small dim stars, few bright
      sz[i] = Math.pow(Math.random(), 2.5) * 3.2 + 0.3;
      ph[i] = Math.random() * Math.PI * 2;
      // Bimodal temperature: most stars white/yellow, some blue, some red
      const r2 = Math.random();
      tp[i] = r2 < 0.12 ? Math.random() * 0.3 : // cool red giants
               r2 < 0.18 ? 0.85 + Math.random() * 0.15 : // hot blue
               0.35 + Math.random() * 0.35; // mid white/yellow
    }
    return { positions: pos, sizes: sz, phases: ph, temps: tp };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aPhase",   new THREE.BufferAttribute(phases, 1));
    g.setAttribute("aTemp",    new THREE.BufferAttribute(temps, 1));
    return g;
  }, [positions, sizes, phases, temps]);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
