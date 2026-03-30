"use client";
import { useSolarStore } from "@/store/useSolarStore";
import { useEffect, useState, useRef } from "react";
import { PlanetData } from "@/data/planets";

export default function PlanetInfoPanel() {
  const { selectedPlanet, panelOpen, setPanelOpen, setCameraMode, setSelectedPlanet } = useSolarStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "minds">("info");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    setActiveTab("info");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedPlanet?.name]);

  const handleClose = () => {
    setPanelOpen(false);
    setCameraMode("solar");
    setSelectedPlanet(null);
    window.dispatchEvent(new CustomEvent("return-to-solar"));
  };

  if (!selectedPlanet || !mounted) return null;
  const p = selectedPlanet;

  const stats = [
    { label: "Orbit Radius", value: `${p.orbitRadius}`, unit: "AU", icon: "◎" },
    { label: "Orbit Speed",  value: `${p.speed.toFixed(2)}`, unit: "×", icon: "⟳" },
    { label: "Planet Size",  value: `${p.size.toFixed(2)}`, unit: "R⊕", icon: "⊕" },
    { label: "Axial Tilt",  value: `${(p.tilt * 57.3).toFixed(1)}`, unit: "°", icon: "∠" },
  ];

  return (
    <>
      {/* ── Desktop: right side panel ───────────────────────────── */}
      <div
        className={`hidden sm:flex fixed top-0 right-0 h-full z-50 flex-col
          transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${panelOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        style={{
          width: "380px",
          background: "rgba(6,6,18,0.96)",
          backdropFilter: "blur(60px) saturate(140%)",
          borderLeft: `1px solid ${p.color}22`,
          boxShadow: `-24px 0 80px rgba(0,0,0,0.95)`,
        }}
      >
        <PanelContent p={p} stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} scrollRef={scrollRef} handleClose={handleClose} isMobile={false} />
      </div>

      {/* ── Mobile: bottom sheet ────────────────────────────────── */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-50
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${panelOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
        style={{
          height: "50vh",
          background: "rgba(6,6,20,0.98)",
          backdropFilter: "blur(60px) saturate(140%)",
          borderTop: `1px solid ${p.color}30`,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: `0 -32px 80px rgba(0,0,0,0.95)`,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full" style={{ background: `${p.color}60` }} />
        </div>
        <PanelContent p={p} stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} scrollRef={scrollRef} handleClose={handleClose} isMobile={true} />
      </div>
    </>
  );
}

function PanelContent({
  p, stats, activeTab, setActiveTab, scrollRef, handleClose, isMobile
}: {
  p: PlanetData; stats: { label: string; value: string; unit: string; icon: string }[]; activeTab: "info" | "minds";
  setActiveTab: (t: "info" | "minds") => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  handleClose: () => void;
  isMobile: boolean;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden relative">

      {/* Colour glow bleed at top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 180,
          background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${p.color}28 0%, transparent 75%)`,
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={`relative flex-shrink-0 z-10 ${isMobile ? "px-5 pt-3" : "px-7 pt-8"}`}>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Planet badge + name */}
        <div className={`flex items-center gap-3 ${isMobile ? "mb-3" : "mb-6"}`}>
          {/* Mini orb */}
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: isMobile ? 32 : 52,
              height: isMobile ? 32 : 52,
              background: `radial-gradient(circle at 32% 28%, ${p.color}, ${p.color}55 60%, #04040e 100%)`,
              boxShadow: `0 0 16px 3px ${p.color}50, 0 0 0 1px ${p.color}30`,
            }}
          />

          <div>
            {/* Field tag */}
            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mb-1"
              style={{
                background: `${p.color}18`,
                border: `1px solid ${p.color}40`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.color }} />
              <span
                className="text-[9px] tracking-[0.18em] uppercase font-semibold"
                style={{ color: p.color, fontFamily: "'Inter',sans-serif" }}
              >
                {p.field}
              </span>
            </div>

            {/* Planet name */}
            <div
              className="font-black leading-none"
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: isMobile ? 22 : 38,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {p.name}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["info", "minds"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 font-bold tracking-[0.1em] uppercase transition-all duration-300 relative"
              style={{
                padding: isMobile ? "8px 0" : "10px 0",
                fontSize: isMobile ? 10 : 11,
                fontFamily: "'Inter',sans-serif",
                color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.35)",
                background: activeTab === tab ? `${p.color}20` : "transparent",
                borderBottom: activeTab === tab ? `2px solid ${p.color}` : "2px solid transparent",
              }}
            >
              {tab === "info" ? "Overview" : "Minds"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: "pan-y" }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {activeTab === "info" && (
          <div className={`${isMobile ? "px-4" : "px-7"} pt-4 pb-8 flex flex-col ${isMobile ? "gap-4" : "gap-6"}`}>

            {/* Description – clamped on mobile so stats are visible without scrolling */}
            <p
              style={{
                fontSize: isMobile ? 11.5 : 14,
                color: "rgba(255,255,255,0.58)",
                fontFamily: "'Inter',sans-serif",
                lineHeight: 1.65,
                ...(isMobile ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                } : { lineHeight: 1.75 }),
              }}
            >
              {p.desc}
            </p>

            {/* Stats */}
            <div>
              <SectionLabel label="Orbital Data" color={p.color} />
              <div className={`grid grid-cols-2 ${isMobile ? "gap-2 mt-2" : "gap-2.5 mt-3"}`}>
                {stats.map(({ label, value, unit, icon }) => (
                  <div
                    key={label}
                    className="rounded-xl flex flex-col gap-0.5 relative overflow-hidden"
                    style={{
                      padding: isMobile ? "8px 10px" : "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${p.color}20`,
                    }}
                  >
                    {/* accent corner glow */}
                    <div
                      className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 100% 0%, ${p.color}22, transparent 70%)` }}
                    />
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="uppercase tracking-[0.14em] font-medium"
                        style={{ fontSize: isMobile ? 8 : 9, color: "rgba(255,255,255,0.38)", fontFamily: "'Inter',sans-serif" }}
                      >
                        {label}
                      </span>
                      <span style={{ color: `${p.color}70`, fontSize: isMobile ? 10 : 11 }}>{icon}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-black leading-none"
                        style={{ fontSize: isMobile ? 16 : 22, fontFamily: "'Syne',sans-serif", color: "#fff" }}
                      >
                        {value}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ fontSize: isMobile ? 9 : 10, color: p.color, fontFamily: "'Inter',sans-serif" }}
                      >
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <SectionLabel label="Sub-disciplines" color={p.color} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: isMobile ? 9.5 : 11,
                      padding: isMobile ? "3px 10px" : "6px 14px",
                      borderRadius: 999,
                      background: `${p.color}12`,
                      border: `1px solid ${p.color}28`,
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "'Inter',sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === "minds" && (
          <div className={`${isMobile ? "px-4" : "px-7"} ${isMobile ? "pt-3" : "pt-5"} pb-8 flex flex-col ${isMobile ? "gap-2" : "gap-3"}`}>
            <p
              style={{ fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter',sans-serif", marginBottom: isMobile ? 2 : 4 }}
            >
              Pioneers who shaped <span style={{ color: p.color }}>{p.field}</span>.
            </p>
            {p.minds.map((m, i: number) => (
              <div
                key={m.name}
                className="group flex items-center gap-3 rounded-xl relative overflow-hidden transition-all duration-300"
                style={{
                  padding: isMobile ? "10px 12px" : "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.color}20`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `linear-gradient(120deg, ${p.color}10, transparent 60%)` }}
                />
                <div
                  className="rounded-xl flex items-center justify-center font-black flex-shrink-0"
                  style={{
                    width: isMobile ? 36 : 48,
                    height: isMobile ? 36 : 48,
                    fontSize: isMobile ? 14 : 18,
                    background: `${p.color}18`,
                    border: `1px solid ${p.color}35`,
                    color: "#fff",
                    fontFamily: "'Syne',sans-serif",
                    boxShadow: `0 0 12px ${p.color}25`,
                  }}
                >
                  {m.initial}
                </div>
                <div className="flex flex-col gap-0.5 relative z-10">
                  <span
                    style={{ fontSize: isMobile ? 13 : 15, fontFamily: "'Syne',sans-serif", color: "#fff", fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: isMobile ? 10 : 11, color: `${p.color}99`, fontFamily: "'Inter',sans-serif" }}>
                    {m.role}
                  </span>
                </div>
                <div className="absolute top-2 right-3 font-black opacity-15" style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", color: p.color }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: `${color}cc`, fontFamily: "'Inter',sans-serif" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}