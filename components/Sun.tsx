"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sunVertexShader, sunFragmentShader, atmosphereVertexShader, atmosphereFragmentShader } from "@/shaders";

export default function Sun() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const haloRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
    if (haloRef.current) haloRef.current.uniforms.uTime.value = t;
  });

  return (
    <group>
      {/* Outer volumetric glow */}
      <mesh>
        <sphereGeometry args={[12, 32, 32]} />
        <shaderMaterial
          ref={haloRef}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uAtmoColor: { value: new THREE.Vector3(1.0, 0.45, 0.0) },
            uThickness: { value: 2.2 },
          }}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sun surface */}
      <mesh>
        <sphereGeometry args={[7.5, 128, 128]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={{ uTime: { value: 0 } }}
        />
      </mesh>

      {/* Strong inner core light */}
      <pointLight intensity={15} distance={200} color="#ffffff" />
      {/* Broad ambient sun glow */}
      <pointLight intensity={6} distance={1200} color="#ffb060" decay={1.5} />
      {/* Directional beam for specular highlights on planets */}
      <directionalLight position={[1, 0, 0]} intensity={3} color="#fff0d0" />
    </group>
  );
}
