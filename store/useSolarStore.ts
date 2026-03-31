import { create } from "zustand";
import { PlanetData } from "@/data/planets";

export type CameraMode = "solar" | "traveling" | "planet";

export interface ArticleData {
  topic: string;
  planetName: string;
  planetColor: string;
  content: string;
}

interface SolarStore {
  selectedPlanet: PlanetData | null;
  hoveredPlanet: PlanetData | null;
  cameraMode: CameraMode;
  speedMultiplier: number;
  panelOpen: boolean;
  activeArticle: ArticleData | null;

  setSelectedPlanet: (p: PlanetData | null) => void;
  setHoveredPlanet: (p: PlanetData | null) => void;
  setCameraMode: (m: CameraMode) => void;
  setSpeedMultiplier: (s: number) => void;
  setPanelOpen: (open: boolean) => void;
  setActiveArticle: (a: ArticleData | null) => void;
}

export const useSolarStore = create<SolarStore>((set) => ({
  selectedPlanet: null,
  hoveredPlanet: null,
  cameraMode: "solar",
  speedMultiplier: 1.0,
  panelOpen: false,
  activeArticle: null,

  setSelectedPlanet: (p) => set({ selectedPlanet: p }),
  setHoveredPlanet: (p) => set({ hoveredPlanet: p }),
  setCameraMode: (m) => set({ cameraMode: m }),
  setSpeedMultiplier: (s) => set({ speedMultiplier: s }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  setActiveArticle: (a) => set({ activeArticle: a }),
}));
