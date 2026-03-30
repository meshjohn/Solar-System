"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import Stars from "./Stars";
import Sun from "./Sun";
import Planet from "./Planet";
import CameraController from "./CameraController";
import { PLANETS, PlanetData } from "@/data/planets";
import { useSolarStore } from "@/store/useSolarStore";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

/* ── Zoom constants (kept in sync with CameraController) ────────── */
const SOLAR_R_MIN = 40;
const SOLAR_R_MAX = 700;
const SOLAR_R_OVERVIEW = 480; // wide enough to see Neptune

export default function Scene() {
  const { setCameraMode, setSelectedPlanet, setPanelOpen, cameraMode } =
    useSolarStore();

  const [travelTarget, setTravelTarget] = useState<{
    planetData: PlanetData;
    worldPos: THREE.Vector3;
  } | null>(null);
  const [returning, setReturning] = useState(false);

  // Live planet positions
  const planetPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const getPlanetPos = useCallback(
    (name: string) => planetPositions.current.get(name) ?? null,
    [],
  );
  const handlePositionUpdate = useCallback(
    (name: string, pos: THREE.Vector3) => {
      planetPositions.current.set(name, pos.clone());
    },
    [],
  );

  const triggerTravel = useCallback(
    (planetName: string) => {
      if (cameraMode === "traveling") return;
      const planet = PLANETS.find((p) => p.name === planetName);
      if (!planet) return;
      const wp =
        planetPositions.current.get(planetName) ??
        new THREE.Vector3(planet.orbitRadius, 0, 0);
      setCameraMode("traveling");
      setSelectedPlanet(planet);
      setPanelOpen(true);
      setReturning(false);
      setTravelTarget({ planetData: planet, worldPos: wp.clone() });
    },
    [cameraMode, setCameraMode, setSelectedPlanet, setPanelOpen],
  );

  const handleReturnComplete = useCallback(() => {
    setCameraMode("solar");
    setSelectedPlanet(null);
    setPanelOpen(false);
    setReturning(true);
    setTravelTarget(null);
    setTimeout(() => setReturning(false), 100);
  }, [setCameraMode, setSelectedPlanet, setPanelOpen]);

  useEffect(() => {
    const onTravel = (e: Event) => {
      const name = (e as CustomEvent).detail?.name;
      if (name) triggerTravel(name);
    };
    const onReturn = () => handleReturnComplete();

    /* ── Zoom button events from HUD ─────────────────────────────── */
    const onZoomIn = () =>
      window.dispatchEvent(
        new CustomEvent("camera-zoom", { detail: { delta: -40 } }),
      );
    const onZoomOut = () =>
      window.dispatchEvent(
        new CustomEvent("camera-zoom", { detail: { delta: 40 } }),
      );
    const onZoomOverview = () =>
      window.dispatchEvent(
        new CustomEvent("camera-zoom-set", { detail: { r: SOLAR_R_OVERVIEW } }),
      );

    window.addEventListener("travel-to-planet", onTravel);
    window.addEventListener("internal-return-solar", onReturn);
    window.addEventListener("zoom-in", onZoomIn);
    window.addEventListener("zoom-out", onZoomOut);
    window.addEventListener("zoom-overview", onZoomOverview);

    return () => {
      window.removeEventListener("travel-to-planet", onTravel);
      window.removeEventListener("internal-return-solar", onReturn);
      window.removeEventListener("zoom-in", onZoomIn);
      window.removeEventListener("zoom-out", onZoomOut);
      window.removeEventListener("zoom-overview", onZoomOverview);
    };
  }, [triggerTravel, handleReturnComplete]);

  const handlePlanetClick = useCallback(
    (data: PlanetData, worldPos: THREE.Vector3) => {
      if (cameraMode === "traveling") return;
      setCameraMode("traveling");
      setSelectedPlanet(data);
      setPanelOpen(true);
      setReturning(false);
      setTravelTarget({ planetData: data, worldPos });
    },
    [cameraMode, setCameraMode, setSelectedPlanet, setPanelOpen],
  );

  return (
    <Canvas
      id="three-canvas"
      camera={{ position: [0, 60, 185], fov: 55, near: 0.1, far: 50000 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "#000104" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.01} color="#040614" />
      <hemisphereLight intensity={0.03} color="#060820" groundColor="#000000" />

      <CameraController
        travelTarget={travelTarget}
        onTravelComplete={() => {}}
        onReturnComplete={handleReturnComplete}
        returning={returning}
        getPlanetPos={getPlanetPos}
      />

      <Stars count={4500} />
      <Sun />

      {PLANETS.map((p) => (
        <Planet
          key={p.name}
          data={p}
          onClickPlanet={handlePlanetClick}
          onPositionUpdate={handlePositionUpdate}
        />
      ))}

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          intensity={1.5}
          mipmapBlur
          resolutionScale={1}
        />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
