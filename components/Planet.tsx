"use client";
import { useRef, useMemo, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  planetVertexShader,
  planetFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from "@/shaders";
import { PlanetData } from "@/data/planets";
import { useSolarStore } from "@/store/useSolarStore";

interface PlanetProps {
  data: PlanetData;
  onClickPlanet: (data: PlanetData, worldPos: THREE.Vector3) => void;
  onPositionUpdate: (name: string, pos: THREE.Vector3) => void;
}

function SaturnCircles({ color }: { color: string }) {
  const c = new THREE.Color(color);
  return (
    <>
      {[1.4, 1.6, 1.85, 2.1, 2.4, 2.75].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.04, 128]} />
          <meshBasicMaterial
            color={c}
            transparent
            opacity={0.35 - i * 0.04}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
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

export default function Planet({
  data,
  onClickPlanet,
  onPositionUpdate,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const surfRef = useRef<THREE.ShaderMaterial>(null!);
  const atmoRef = useRef<THREE.ShaderMaterial>(null!);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const wpRef = useRef(new THREE.Vector3());

  const { speedMultiplier, setHoveredPlanet, cameraMode } =
    useSolarStore();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uType: { value: data.shaderType },
      uCol1: { value: new THREE.Vector3(...data.col1) },
      uCol2: { value: new THREE.Vector3(...data.col2) },
      uCol3: { value: new THREE.Vector3(...data.col3) },
      uRoughness: { value: data.roughness },
      uMetalness: { value: data.metalness },
    }),
    [data],
  );

  const atmoUniforms = useMemo(
    () =>
      data.atmosphereColor
        ? {
            uAtmoColor: { value: new THREE.Vector3(...data.atmosphereColor) },
            uThickness: { value: data.atmosphereThickness ?? 1.0 },
          }
        : null,
    [data],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    angleRef.current += delta * data.speed * 0.07 * speedMultiplier;
    const a = angleRef.current;
    const x = Math.cos(a) * data.orbitRadius;
    const z = Math.sin(a) * data.orbitRadius;

    if (groupRef.current) groupRef.current.position.set(x, 0, z);
    if (meshRef.current)
      meshRef.current.rotation.y = t * (0.12 + data.shaderType * 0.025);
    if (surfRef.current) surfRef.current.uniforms.uTime.value = t;
    // atmosphere mat has no animated uniforms beyond color set at init

    // Broadcast position for camera tracking
    wpRef.current.set(x, 0, z);
    onPositionUpdate(data.name, wpRef.current);
  });

  const pointerDownState = useRef({ time: 0, x: 0, y: 0 });

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointerDownState.current = { time: performance.now(), x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const { time, x, y } = pointerDownState.current;
      const dt = performance.now() - time;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const distSq = dx * dx + dy * dy;

      // Allow clicks up to 350ms with up to ~15px of finger rolling (225 sq)
      if (dt < 350 && distSq < 225) {
        e.stopPropagation();
        if (cameraMode === "traveling") return;
        meshRef.current?.getWorldPosition(wpRef.current);
        onClickPlanet(data, wpRef.current.clone());
      }
    },
    [data, onClickPlanet, cameraMode],
  );

  return (
    <>
      {/* Orbit ring – unified color for all planets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[data.orbitRadius - 0.08, data.orbitRadius + 0.08, 256]}
        />
        <meshBasicMaterial
          color="#8899cc"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <group ref={groupRef}>
        {/* Atmosphere – slightly larger for halo effect */}
        {atmoUniforms && (
          <mesh scale={[data.size * 1.1, data.size * 1.1, data.size * 1.1]}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
              ref={atmoRef}
              vertexShader={atmosphereVertexShader}
              fragmentShader={atmosphereFragmentShader}
              uniforms={atmoUniforms}
              transparent
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Surface */}
        <mesh
          ref={meshRef}
          scale={[data.size, data.size, data.size]}
          rotation={[data.tilt, 0, 0]}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
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

        {/* Planet Label */}
        {cameraMode === "solar" && (
          <Html
            position={[0, data.size * 1.3 + 1.5, 0]}
            center
            zIndexRange={[100, 0]}
            distanceFactor={140}
          >
            <div
              className="pointer-events-none select-none whitespace-nowrap text-[12px] font-black uppercase tracking-[0.35em] transition-all duration-300"
              style={{
                color: "#ffffff",
                textShadow: `0 0 12px ${data.glowColor}, 0 0 24px ${data.color}, 0 2px 4px rgba(0,0,0,0.9)`,
              }}
            >
              {data.name}
            </div>
          </Html>
        )}

        {/* Saturn rings */}
        {data.hasRings && (
          <group
            scale={[data.size, data.size, data.size]}
            rotation={[data.tilt * 0.5, 0, 0]}
          >
            <SaturnCircles color={data.glowColor} />
          </group>
        )}

        {/* Moons */}
        {data.hasMoon && <Moon parentSize={data.size} index={0} />}
        {data.hasMoons && (
          <>
            <Moon parentSize={data.size} index={0} />
            <Moon parentSize={data.size} index={1} />
          </>
        )}
      </group>
    </>
  );
}
