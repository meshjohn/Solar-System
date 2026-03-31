"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AsteroidBelt({ 
  count = 3500, 
  innerRadius = 104, 
  outerRadius = 118 
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Non-linear distribution to cluster a bit in the middle of the belt
      const r = Math.random();
      const distPercent = r < 0.5 ? 2 * r * r : 1 - 2 * (1 - r) * (1 - r); 
      const distance = innerRadius + distPercent * (outerRadius - innerRadius);
      
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Vertical scatter - less scatter near the edges of the belt
      const edgeDist = Math.abs(distance - ((innerRadius + outerRadius) / 2));
      const maxSpread = 2.5 * (1 - edgeDist / ((outerRadius - innerRadius) / 2));
      const y = (Math.random() - 0.5) * maxSpread;
      
      const scale = 0.05 + Math.pow(Math.random(), 3) * 0.25; // Mostly small, few large 
      
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;
      
      temp.push({ x, y, z, scale, rx, ry, rz });
    }
    return temp;
  }, [count, innerRadius, outerRadius]);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      // Give the asteroids irregular rocky shapes by distorting scale axes slightly
      dummy.scale.set(
         p.scale * (0.8 + Math.random() * 0.6), 
         p.scale * (0.8 + Math.random() * 0.4), 
         p.scale * (0.8 + Math.random() * 0.6)
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Rotate the entire belt very slowly
      meshRef.current.rotation.y -= delta * 0.015; 
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#8c8b87" 
        roughness={0.95} 
        metalness={0.15} 
      />
    </instancedMesh>
  );
}
