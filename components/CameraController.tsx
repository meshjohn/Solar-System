"use client";
import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSolarStore } from "@/store/useSolarStore";
import { PlanetData } from "@/data/planets";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ── constants ─────────────────────────────────────────────────── */
const SOLAR_R_MIN = 40; // closest zoom-in on solar view
const SOLAR_R_MAX = 700; // far enough to see all planets + space
const SOLAR_R_DEF = 185; // default starting distance
const PLANET_R_MIN = 0.5; // closest zoom on a planet
const PLANET_R_MAX = 800; // far enough to see it from a distance
const WHEEL_SOLAR = 0.18; // scroll sensitivity – solar
const WHEEL_PLANET = 0.1; // scroll sensitivity – planet
const TRAVEL_DUR = 2.2; // seconds

interface CameraControllerProps {
  travelTarget: { planetData: PlanetData; worldPos: THREE.Vector3 } | null;
  onTravelComplete: () => void;
  onReturnComplete: () => void;
  returning: boolean;
  getPlanetPos: (name: string) => THREE.Vector3 | null;
}

export default function CameraController({
  travelTarget,
  onTravelComplete,
  onReturnComplete,
  returning,
  getPlanetPos,
}: CameraControllerProps) {
  const { camera } = useThree();
  const { cameraMode, setCameraMode } = useSolarStore();

  /* ── Solar spherical coords ──────────────────────────────────── */
  const sph = useRef({ theta: 0.4, phi: 1.0, r: SOLAR_R_DEF });
  const sphTgt = useRef({ theta: 0.4, phi: 1.0, r: SOLAR_R_DEF });

  /* ── Planet spherical coords (relative to planet) ───────────── */
  const pSph = useRef({ theta: 0.0, phi: 1.15, r: 0 });
  const pSphTgt = useRef({ theta: 0.0, phi: 1.15, r: 0 });

  /* ── Shared look-at ─────────────────────────────────────────── */
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtGoal = useRef(new THREE.Vector3(0, 0, 0));

  /* ── Travel animation ───────────────────────────────────────── */
  const travelFrom = useRef(new THREE.Vector3());
  const lookFrom = useRef(new THREE.Vector3());
  const travelT = useRef(0);
  const currentTarget = useRef<{ planetData: PlanetData } | null>(null);

  /* ── Input state ────────────────────────────────────────────── */
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const lastPinchDist = useRef<number | null>(null);

  /* ── Mobile detection (cached once, avoids per-frame jitter) ── */
  const isMobile = useRef(typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const update = () => { isMobile.current = window.innerWidth < 640; };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── Compute ideal orbit radius for planet view ─────────────── */
  // On mobile: pull back further so planet occupies top ~50% of screen
  const getPOrbit = useCallback(
    (p: PlanetData) => isMobile.current ? p.size * 6.5 + 8.0 : p.size * 3.8 + 4.5,
    [],
  );

  /* ── Pinch helpers ──────────────────────────────────────────── */
  const getPinchDist = (e: TouchEvent) => {
    if (e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /* ── Mouse / Touch / Key events ─────────────────────────────── */
  useEffect(() => {
    const el = document.getElementById(
      "three-canvas",
    ) as HTMLCanvasElement | null;
    if (!el) return;

    /* ── Mouse ─────────────────────────────────────── */
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      if (cameraMode === "solar") autoRotate.current = false;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || cameraMode === "traveling") return;
      const dx = (e.clientX - lastMouse.current.x) * 0.004;
      const dy = (e.clientY - lastMouse.current.y) * 0.004;
      if (cameraMode === "solar") {
        sphTgt.current.theta -= dx;
        sphTgt.current.phi = Math.max(
          0.15,
          Math.min(Math.PI - 0.15, sphTgt.current.phi + dy),
        );
      } else if (cameraMode === "planet") {
        pSphTgt.current.theta -= dx * 1.2;
        pSphTgt.current.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, pSphTgt.current.phi + dy * 1.2),
        );
      }
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    /* ── Wheel ─────────────────────────────────────── */
    const onWheel = (e: WheelEvent) => {
      if (cameraMode === "traveling") return;
      if (cameraMode === "solar") {
        const delta = e.deltaY * WHEEL_SOLAR;
        sphTgt.current.r = Math.max(
          SOLAR_R_MIN,
          Math.min(SOLAR_R_MAX, sphTgt.current.r + delta),
        );
      } else if (cameraMode === "planet" && currentTarget.current) {
        const delta = e.deltaY * WHEEL_PLANET;
        pSphTgt.current.r = Math.max(
          PLANET_R_MIN,
          Math.min(PLANET_R_MAX, pSphTgt.current.r + delta),
        );
      }
    };

    /* ── Touch drag ────────────────────────────────── */
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouse.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        if (cameraMode === "solar") autoRotate.current = false;
      } else if (e.touches.length === 2) {
        lastPinchDist.current = getPinchDist(e);
      }
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      lastPinchDist.current = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (cameraMode === "traveling") return;
      if (e.touches.length === 1 && isDragging.current) {
        const dx = (e.touches[0].clientX - lastMouse.current.x) * 0.006;
        const dy = (e.touches[0].clientY - lastMouse.current.y) * 0.006;
        if (cameraMode === "solar") {
          sphTgt.current.theta -= dx;
          sphTgt.current.phi = Math.max(
            0.15,
            Math.min(Math.PI - 0.15, sphTgt.current.phi + dy),
          );
        } else if (cameraMode === "planet") {
          pSphTgt.current.theta -= dx * 1.2;
          pSphTgt.current.phi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, pSphTgt.current.phi + dy * 1.2),
          );
        }
        lastMouse.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        const dist = getPinchDist(e);
        if (dist !== null && lastPinchDist.current !== null) {
          const scale = lastPinchDist.current / dist; // > 1 = pinch in = zoom out
          if (cameraMode === "solar") {
            sphTgt.current.r = Math.max(
              SOLAR_R_MIN,
              Math.min(SOLAR_R_MAX, sphTgt.current.r * scale),
            );
          } else if (cameraMode === "planet") {
            pSphTgt.current.r = Math.max(
              PLANET_R_MIN,
              Math.min(PLANET_R_MAX, pSphTgt.current.r * scale),
            );
          }
        }
        lastPinchDist.current = dist;
      }
    };

    /* ── Keyboard ──────────────────────────────────── */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerReturn();

      // + / - zoom with keyboard
      if (cameraMode === "solar") {
        if (e.key === "+" || e.key === "=")
          sphTgt.current.r = Math.max(SOLAR_R_MIN, sphTgt.current.r - 20);
        if (e.key === "-" || e.key === "_")
          sphTgt.current.r = Math.min(SOLAR_R_MAX, sphTgt.current.r + 20);
        // Home key → reset zoom to see all planets
        if (e.key === "Home" || e.key === "0")
          sphTgt.current.r = SOLAR_R_MAX * 0.7;
      } else if (cameraMode === "planet") {
        if (e.key === "+" || e.key === "=")
          pSphTgt.current.r = Math.max(PLANET_R_MIN, pSphTgt.current.r - 5);
        if (e.key === "-" || e.key === "_")
          pSphTgt.current.r = Math.min(PLANET_R_MAX, pSphTgt.current.r + 5);
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    /* ── Programmatic zoom events (from HUD buttons) ─── */
    const onCameraZoom = (e: Event) => {
      const { delta } = (e as CustomEvent).detail as { delta: number };
      if (cameraMode === "solar") {
        sphTgt.current.r = Math.max(
          SOLAR_R_MIN,
          Math.min(SOLAR_R_MAX, sphTgt.current.r + delta),
        );
      } else if (cameraMode === "planet") {
        pSphTgt.current.r = Math.max(
          PLANET_R_MIN,
          Math.min(PLANET_R_MAX, pSphTgt.current.r + delta * 0.5),
        );
      }
    };
    const onCameraZoomSet = (e: Event) => {
      const { r } = (e as CustomEvent).detail as { r: number };
      if (cameraMode === "solar") {
        sphTgt.current.r = Math.max(SOLAR_R_MIN, Math.min(SOLAR_R_MAX, r));
      }
    };
    window.addEventListener("camera-zoom", onCameraZoom);
    window.addEventListener("camera-zoom-set", onCameraZoomSet);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("camera-zoom", onCameraZoom);
      window.removeEventListener("camera-zoom-set", onCameraZoomSet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode]);

  const triggerReturn = useCallback(() => {
    if (cameraMode === "traveling") return;
    onReturnComplete();
    autoRotate.current = true;
    sphTgt.current.r = SOLAR_R_DEF;
  }, [cameraMode, onReturnComplete]);

  /* ── Kick off travel ─────────────────────────────────────────── */
  useEffect(() => {
    if (!travelTarget) return;
    currentTarget.current = { planetData: travelTarget.planetData };
    travelFrom.current.copy(camera.position);
    lookFrom.current.copy(lookAt.current);
    travelT.current = 0;
    autoRotate.current = false;
    pSph.current = {
      theta: 0.3,
      phi: 1.15,
      r: getPOrbit(travelTarget.planetData),
    };
    pSphTgt.current = { ...pSph.current };
  }, [travelTarget, camera, getPOrbit]);

  useEffect(() => {
    if (!returning) return;
    autoRotate.current = true;
    sphTgt.current.r = SOLAR_R_DEF;
    currentTarget.current = null;
  }, [returning]);

  /* ── Frame loop ──────────────────────────────────────────────── */
  useFrame((_, delta) => {
    /* TRAVELING */
    if (cameraMode === "traveling" && currentTarget.current) {
      travelT.current += delta / TRAVEL_DUR;
      if (travelT.current >= 1) {
        travelT.current = 1;
        setCameraMode("planet");
        onTravelComplete();
      }
      const t = easeInOutCubic(Math.min(travelT.current, 1));
      const { planetData } = currentTarget.current;
      const planetPos =
        getPlanetPos(planetData.name) ??
        travelTarget?.worldPos ??
        new THREE.Vector3();

      const ps = pSph.current;
      const yOffset = isMobile.current ? ps.r * 0.18 : 0;
      const targetLookAt = planetPos.clone();
      targetLookAt.y -= yOffset;

      lookAtGoal.current.copy(targetLookAt);

      const sphi = Math.sin(ps.phi),
        cphi = Math.cos(ps.phi);
      const goalPos = new THREE.Vector3(
        targetLookAt.x + ps.r * sphi * Math.cos(ps.theta),
        targetLookAt.y + ps.r * cphi,
        targetLookAt.z + ps.r * sphi * Math.sin(ps.theta),
      );
      camera.position.lerpVectors(travelFrom.current, goalPos, t);
      lookAt.current.lerpVectors(lookFrom.current, targetLookAt, t);
      camera.lookAt(lookAt.current);

      /* PLANET ORBIT */
    } else if (cameraMode === "planet" && currentTarget.current) {
      const { planetData } = currentTarget.current;
      const planetPos = getPlanetPos(planetData.name) ?? new THREE.Vector3();

      const ps = pSph.current;
      const pts = pSphTgt.current;
      ps.theta += (pts.theta - ps.theta) * 0.07;
      ps.phi += (pts.phi - ps.phi) * 0.07;
      ps.r += (pts.r - ps.r) * 0.07;

      // Stable, cached y-offset so it doesn't fluctuate per frame
      const yOffset = isMobile.current ? ps.r * 0.18 : 0;
      const targetLookAt = planetPos.clone();
      targetLookAt.y -= yOffset;

      if (!isDragging.current) pts.theta += delta * 0.12;

      const sphi = Math.sin(ps.phi),
        cphi = Math.cos(ps.phi);
      camera.position.set(
        targetLookAt.x + ps.r * sphi * Math.cos(ps.theta),
        targetLookAt.y + ps.r * cphi,
        targetLookAt.z + ps.r * sphi * Math.sin(ps.theta),
      );
      lookAt.current.copy(targetLookAt);
      camera.lookAt(lookAt.current);
      travelFrom.current.copy(camera.position);
      lookFrom.current.copy(lookAt.current);

      /* SOLAR VIEW */
    } else if (cameraMode === "solar") {
      if (autoRotate.current) sphTgt.current.theta += delta * 0.05;

      const s = sph.current;
      const ts = sphTgt.current;
      s.theta += (ts.theta - s.theta) * 0.042;
      s.phi += (ts.phi - s.phi) * 0.042;
      s.r += (ts.r - s.r) * 0.042;

      const sphi = Math.sin(s.phi),
        cphi = Math.cos(s.phi);
      camera.position.set(
        s.r * sphi * Math.cos(s.theta),
        s.r * cphi,
        s.r * sphi * Math.sin(s.theta),
      );
      lookAtGoal.current.set(0, 0, 0);
      lookAt.current.lerp(lookAtGoal.current, 0.05);
      camera.lookAt(lookAt.current);
      travelFrom.current.copy(camera.position);
      lookFrom.current.copy(lookAt.current);
    }
  });

  // keep travelTarget accessible inside frame loop
  const _tt = travelTarget;
  void _tt;
  return null;
}
