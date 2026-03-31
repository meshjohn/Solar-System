"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HUD from "@/components/HUD";
import PlanetInfoPanel from "@/components/PlanetInfoPanel";
import LoadingScreen from "@/components/LoadingScreen";
import ArticleScreen from "@/components/ArticleScreen";
import { useSolarStore } from "@/store/useSolarStore";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Home() {
  const { cameraMode } = useSolarStore();
  const [loaded, setLoaded] = useState(false);

  const handleSelectPlanet = useCallback(
    (name: string) => {
      if (cameraMode === "traveling") return;
      window.dispatchEvent(
        new CustomEvent("travel-to-planet", { detail: { name } }),
      );
    },
    [cameraMode],
  );

  useEffect(() => {
    const handler = () => {
      window.dispatchEvent(new CustomEvent("internal-return-solar"));
    };
    window.addEventListener("return-to-solar", handler);
    return () => window.removeEventListener("return-to-solar", handler);
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black relative">
      {/* Loading screen */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* 3D scene – always mounted so WebGL initializes during loading */}
      <div
        className="absolute inset-0"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease" }}
      >
        <Scene />
      </div>

      {/* HUD + panel – only shown after loaded */}
      {loaded && (
        <>
          <HUD onSelectPlanet={handleSelectPlanet} />
          <PlanetInfoPanel />
          <ArticleScreen />
        </>
      )}
    </main>
  );
}
