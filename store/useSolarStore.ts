import { create } from "zustand";
import { PlanetData } from "@/data/planets";

export type CameraMode = "solar" | "traveling" | "planet";

interface SolarStore {
  selectedPlanet: PlanetData | null;
  hoveredPlanet: PlanetData | null;
  cameraMode: CameraMode;
  speedMultiplier: number;
  panelOpen: boolean;

  setSelectedPlanet: (p: PlanetData | null) => void;
  setHoveredPlanet: (p: PlanetData | null) => void;
  setCameraMode: (m: CameraMode) => void;
  setSpeedMultiplier: (s: number) => void;
  setPanelOpen: (open: boolean) => void;
}

export const useSolarStore = create<SolarStore>((set) => ({
  selectedPlanet: null,
  hoveredPlanet: null,
  cameraMode: "solar",
  speedMultiplier: 1.0,
  panelOpen: false,

  setSelectedPlanet: (p) => set({ selectedPlanet: p }),
  setHoveredPlanet: (p) => set({ hoveredPlanet: p }),
  setCameraMode: (m) => set({ cameraMode: m }),
  setSpeedMultiplier: (s) => set({ speedMultiplier: s }),
  setPanelOpen: (open) => set({ panelOpen: open }),
}));
