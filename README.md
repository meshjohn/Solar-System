# ☀ Solar Knowledge

An interactive 3D solar system — Next.js 14 + React Three Fiber + custom WebGL shaders.
Each planet represents a field of human knowledge.

## Quick Start

```bash
unzip solar-knowledge.zip
cd solar-knowledge
npm install
npm run dev
# Open http://localhost:3000
```

## Stack
- Next.js 14 (App Router, TypeScript)
- @react-three/fiber — React renderer for Three.js
- @react-three/drei — Canvas, useFrame helpers
- Zustand — camera mode + planet state
- Tailwind CSS — UI overlay
- All textures 100% procedural GLSL (no image files)

## Structure
```
app/          → layout + page entry
components/   → Scene, Sun, Planet, Stars, CameraController, HUD, PlanetInfoPanel
data/         → planets.ts (all 8 planet configs + knowledge content)
shaders/      → index.ts (all GLSL: PBR planet, sun corona, atmosphere, rings, stars)
store/        → useSolarStore.ts (Zustand)
```

## Controls
- Click planet / planet nav → camera travels to it
- Drag → rotate view
- Scroll → zoom
- ESC → return to solar view
- Speed +/- → change orbit speed (0× – 5×)

## Planets
Mercury → Mathematics | Venus → Philosophy | Earth → Natural Sciences
Mars → Engineering | Jupiter → Arts & Humanities | Saturn → History
Uranus → Medicine | Neptune → Space & Cosmology
