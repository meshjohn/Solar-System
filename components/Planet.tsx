"use client";
import { useRef, useMemo, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  planetVertexShader, planetFragmentShader,
  atmosphereVertexShader, atmosphereFragmentShader,
  ringVertexShader, ringFragmentShader,
} from "@/shaders";
import { PlanetData } from "@/data/planets";
import { useSolarStore } from "@/store/useSolarStore";

interface PlanetProps {
  data: PlanetData;
  onClickPlanet: (data: PlanetData, worldPos: THREE.Vector3) => void;
  onPositionUpdate: (name: string, pos: THREE.Vector3) => void;
}

function SaturnRings() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  const { geo, inner, outer } = useMemo(() => {
    const innerR = 1.42, outerR = 2.75, segs = 512;
    const verts: number[] = [], uvs: number[] = [], idx: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      verts.push(c * innerR, 0, s * innerR, c * outerR, 0, s * outerR);
      uvs.push(i / segs, 0, i / segs, 1);
    }
    for (let i = 0; i < segs; i++) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    g.setIndex(idx);
    return { geo: g, inner: innerR, outer: outerR };
  }, []);

  return (
    <mesh geometry={geo} rotation={[0.12, 0, 0]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={ringVertexShader}
        fragmentShader={ringFragmentShader}
        uniforms={{
          uRingColor: { value: new THREE.Vector3(0.82, 0.72, 0.44) },
          uInnerR: { value: inner },
          uOuterR: { value: outer },
          uTime: { value: 0 },
        }}
        transparent side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  );
}

function ThinRings({ color }: { color: string }) {
  const c = new THREE.Color(color);
  return (
    <>
      {[1.75, 2.05, 2.38].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.045, 128]} />
          <meshBasicMaterial color={c} transparent opacity={0.18 - i * 0.03} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Moon({ parentSize, index }: { parentSize: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const dist = parentSize * (2.6 + index * 1.6);
  const speed = 1.1 + index * 0.45;
  const inclination = index * 0.18;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * speed) * dist,
        Math.sin(t * speed * 0.3) * dist * Math.sin(inclination),
        Math.sin(t * speed) * dist,
      );
      ref.current.rotation.y = t * 0.5;
    }
  });
  const moonSize = parentSize * 0.17 + index * parentSize * 0.04;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[moonSize, 48, 48]} />
      <meshStandardMaterial color="#aaa098" roughness={0.85} metalness={0.08} />
    </mesh>
  );
}

export default function Planet({ data, onClickPlanet, onPositionUpdate }: PlanetProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  const meshRef   = useRef<THREE.Mesh>(null!);
  const surfRef   = useRef<THREE.ShaderMaterial>(null!);
  const atmoRef   = useRef<THREE.ShaderMaterial>(null!);
  const angleRef  = useRef(Math.random() * Math.PI * 2);
  const wpRef     = useRef(new THREE.Vector3());

  const { speedMultiplier, setHoveredPlanet, cameraMode } = useSolarStore();

  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uType:      { value: data.shaderType },
    uCol1:      { value: new THREE.Vector3(...data.col1) },
    uCol2:      { value: new THREE.Vector3(...data.col2) },
    uCol3:      { value: new THREE.Vector3(...data.col3) },
    uRoughness: { value: data.roughness },
    uMetalness: { value: data.metalness },
  }), [data]);

  const atmoUniforms = useMemo(() =>
    data.atmosphereColor ? {
      uAtmoColor:  { value: new THREE.Vector3(...data.atmosphereColor) },
      uThickness:  { value: data.atmosphereThickness ?? 1.0 },
    } : null,
  [data]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    angleRef.current += delta * data.speed * 0.07 * speedMultiplier;
    const a = angleRef.current;
    const x = Math.cos(a) * data.orbitRadius;
    const z = Math.sin(a) * data.orbitRadius;

    if (groupRef.current) groupRef.current.position.set(x, 0, z);
    if (meshRef.current)  meshRef.current.rotation.y = t * (0.12 + data.shaderType * 0.025);
    if (surfRef.current)  surfRef.current.uniforms.uTime.value = t;
    // atmosphere mat has no animated uniforms beyond color set at init

    // Broadcast position for camera tracking
    wpRef.current.set(x, 0, z);
    onPositionUpdate(data.name, wpRef.current);
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (cameraMode === "traveling") return;
      meshRef.current?.getWorldPosition(wpRef.current);
      onClickPlanet(data, wpRef.current.clone());
    },
    [data, onClickPlanet, cameraMode]
  );

  return (
    <>
      {/* Orbit ring – unified color for all planets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.08, data.orbitRadius + 0.08, 256]} />
        <meshBasicMaterial color="#8899cc" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group ref={groupRef}>
        {/* Atmosphere – slightly larger for halo effect */}
        {atmoUniforms && (
          <mesh scale={[data.size * 1.10, data.size * 1.10, data.size * 1.10]}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
              ref={atmoRef}
              vertexShader={atmosphereVertexShader}
              fragmentShader={atmosphereFragmentShader}
              uniforms={atmoUniforms}
              transparent side={THREE.BackSide} depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Surface */}
        <mesh
          ref={meshRef}
          scale={[data.size, data.size, data.size]}
          rotation={[data.tilt, 0, 0]}
          onClick={handleClick}
          onPointerEnter={() => { 
            if (cameraMode === "solar") {
              setHoveredPlanet(data);
              document.body.style.cursor = "crosshair";
            }
          }}
          onPointerLeave={() => { 
            if (cameraMode === "solar") {
              setHoveredPlanet(null);
              document.body.style.cursor = "default";
            }
          }}
        >
          <sphereGeometry args={[1, 160, 160]} />
          <shaderMaterial
            ref={surfRef}
            vertexShader={planetVertexShader}
            fragmentShader={planetFragmentShader}
            uniforms={uniforms}
          />
        </mesh>

        {/* Saturn rings */}
        {data.hasRings && (
          <group scale={[data.size, data.size, data.size]}>
            <SaturnRings />
          </group>
        )}

        {/* Uranus thin rings */}
        {data.hasThinRings && (
          <group scale={[data.size, data.size, data.size]} rotation={[Math.PI / 2 + data.tilt * 0.1, 0, 0]}>
            <ThinRings color={data.color} />
          </group>
        )}

        {/* Moons */}
        {data.hasMoon  && <Moon parentSize={data.size} index={0} />}
        {data.hasMoons && <><Moon parentSize={data.size} index={0} /><Moon parentSize={data.size} index={1} /></>}
      </group>
    </>
  );
}
