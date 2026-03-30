"use client";
import { useState } from "react";
import { useSolarStore } from "@/store/useSolarStore";
import { PLANETS } from "@/data/planets";

interface HUDProps {
  onSelectPlanet: (name: string) => void;
}

export default function HUD({ onSelectPlanet }: HUDProps) {
  const {
    hoveredPlanet,
    selectedPlanet,
    speedMultiplier,
    setSpeedMultiplier,
    cameraMode,
  } = useSolarStore();
  const isPlanetMode = cameraMode === "planet" || cameraMode === "traveling";
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatchZoom = (type: "zoom-in" | "zoom-out" | "zoom-overview") =>
    window.dispatchEvent(new CustomEvent(type));

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3"
        style={{
          background:
            "linear-gradient(180deg,rgba(0,0,8,0.92) 0%,transparent 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                background: "radial-gradient(circle,#ffc040,transparent 70%)",
              }}
            />
            <div
              className="absolute inset-[2px] sm:inset-[3px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%,#fff5c0,#ffaa22 50%,#ff4800)",
                boxShadow:
                  "0 0 14px 4px rgba(255,160,20,0.55), 0 0 5px 1px rgba(255,220,80,0.8)",
              }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-white font-black tracking-[0.18em] sm:tracking-[0.22em] text-[11px] sm:text-[13px] uppercase"
              style={{ fontFamily: "'Syne',sans-serif" }}
            >
              Solar Knowledge
            </span>
            <span
              className="text-[7px] sm:text-[8.5px] tracking-[0.14em] sm:tracking-[0.18em] mt-0.5 hidden sm:block"
              style={{
                color: "rgba(255,200,80,0.35)",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              8 Worlds · 5500 Stars
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls – solar mode only, hidden on mobile (use pinch) */}
          {!isPlanetMode && (
            <div
              className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px)",
              }}
            >
              <span
                className="text-[8.5px] tracking-[0.16em] uppercase mr-0.5"
                style={{
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                Zoom
              </span>
              {[
                {
                  type: "zoom-in" as const,
                  icon: (
                    <>
                      <circle
                        cx="5"
                        cy="5"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M5 3v4M3 5h4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.5 8.5L10 10"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </>
                  ),
                },
                {
                  type: "zoom-out" as const,
                  icon: (
                    <>
                      <circle
                        cx="5"
                        cy="5"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3 5h4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.5 8.5L10 10"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </>
                  ),
                },
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => dispatchZoom(type)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-110"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    {icon}
                  </svg>
                </button>
              ))}
              <button
                onClick={() => dispatchZoom("zoom-overview")}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-110"
                style={{ color: "rgba(255,200,80,0.75)" }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <circle
                    cx="5.5"
                    cy="5.5"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <circle
                    cx="5.5"
                    cy="5.5"
                    r="1.5"
                    fill="currentColor"
                    opacity="0.8"
                  />
                  <circle
                    cx="2"
                    cy="5.5"
                    r="0.8"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <circle
                    cx="9"
                    cy="5.5"
                    r="0.8"
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Speed control */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 sm:py-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(20px)",
            }}
          >
            <span
              className="text-[7.5px] sm:text-[8.5px] tracking-[0.14em] sm:tracking-[0.16em] uppercase hidden xs:block"
              style={{
                color: "rgba(255,255,255,0.28)",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              Speed
            </span>
            <button
              onClick={() =>
                setSpeedMultiplier(Math.max(0, speedMultiplier - 0.5))
              }
              className="w-5 h-5 rounded-full flex items-center justify-center text-base leading-none transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              −
            </button>
            <span
              className="text-[10px] sm:text-[11px] text-white min-w-[28px] sm:min-w-[32px] text-center tabular-nums"
              style={{ fontFamily: "'IBM Plex Mono',monospace" }}
            >
              {speedMultiplier.toFixed(1)}×
            </span>
            <button
              onClick={() =>
                setSpeedMultiplier(Math.min(5, speedMultiplier + 0.5))
              }
              className="w-5 h-5 rounded-full flex items-center justify-center text-base leading-none transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              +
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {menuOpen ? (
                <path
                  d="M2 2l10 10M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2 4h10M2 7h10M2 10h10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ────────────────────────────────── */}
      {menuOpen && (
        <div
          className="sm:hidden fixed top-[52px] right-4 z-50 rounded-2xl p-3 flex flex-col gap-2 animate-fade-slide-up"
          style={{
            background: "rgba(4,4,20,0.95)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)",
            minWidth: 180,
          }}
        >
          <div
            className="text-[7.5px] tracking-[0.22em] uppercase mb-1 px-1"
            style={{
              color: "rgba(255,255,255,0.22)",
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            Controls
          </div>
          {!isPlanetMode && (
            <div className="flex items-center gap-2">
              {[
                { label: "−", fn: () => dispatchZoom("zoom-out") },
                {
                  label: "Overview",
                  fn: () => {
                    dispatchZoom("zoom-overview");
                    setMenuOpen(false);
                  },
                },
                { label: "+", fn: () => dispatchZoom("zoom-in") },
              ].map(({ label, fn }) => (
                <button
                  key={label}
                  onClick={fn}
                  className="flex-1 py-2 rounded-xl text-[10px] text-white transition-all duration-200 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div
            className="text-[8px] leading-relaxed px-1"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            Drag to rotate · Pinch to zoom · Tap planet to explore
          </div>
        </div>
      )}

      {/* ── Planet mode: Return button + orbit hints ────────────── */}
      {isPlanetMode && (
        <div className="fixed top-16 sm:top-20 left-4 sm:left-6 z-50 flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("return-to-solar"))
            }
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full
              transition-all duration-300 hover:-translate-x-0.5 hover:brightness-110 active:scale-95"
            style={{
              background: "rgba(4,4,20,0.82)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              color: "rgba(255,255,255,0.72)",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10px",
              letterSpacing: "0.12em",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L2 4L6 7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 4h8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden xs:inline">Return to Solar System</span>
            <span className="xs:hidden">Return</span>
          </button>

          {/* Orbit hints – compact on mobile */}
          <div
            className="hidden sm:block px-3.5 py-3 rounded-2xl"
            style={{
              background: "rgba(4,4,18,0.72)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              className="text-[8px] tracking-[0.2em] uppercase mb-2.5"
              style={{
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              Planet View
            </div>
            {[
              ["DRAG", "Orbit camera"],
              ["SCROLL", "Zoom in / out"],
              ["PINCH", "Pinch to zoom"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center gap-2.5 mb-1.5 last:mb-0"
              >
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {k}
                </span>
                <span
                  className="text-[9px]"
                  style={{
                    color: "rgba(255,255,255,0.28)",
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hover tooltip (desktop only) ──────────────────────── */}
      {hoveredPlanet && cameraMode === "solar" && (
        <div
          key={hoveredPlanet.name}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] pointer-events-none
            hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-full animate-fade-slide-up"
          style={{
            background: "rgba(2,2,18,0.90)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            boxShadow: `0 0 20px 2px ${hoveredPlanet.color}20`,
          }}
        >
          <div className="relative w-2.5 h-2.5 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: hoveredPlanet.color,
                opacity: 0.4,
                animationDuration: "1.4s",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: hoveredPlanet.color,
                boxShadow: `0 0 8px 2px ${hoveredPlanet.color}`,
              }}
            />
          </div>
          <span
            className="text-[13px] font-black text-white"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            {hoveredPlanet.name}
          </span>
          <span
            className="text-[9.5px]"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            {hoveredPlanet.field}
          </span>
          <span
            className="text-[8.5px] px-2 py-0.5 rounded-full"
            style={{
              background: `${hoveredPlanet.color}18`,
              border: `1px solid ${hoveredPlanet.color}40`,
              color: hoveredPlanet.color,
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            click to explore
          </span>
        </div>
      )}

      {/* ── Bottom planet selector ─────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-3 sm:pb-5 px-2 sm:px-4"
        style={{
          background:
            "linear-gradient(0deg,rgba(0,0,8,0.90) 0%,transparent 100%)",
          pointerEvents: "none",
        }}
      >
        {/* Scrollable pill row */}
        <div
          className="flex items-center overflow-x-auto gap-0.5 rounded-full px-1.5 sm:px-2.5 py-1.5 sm:py-2 max-w-full"
          style={{
            background: "rgba(4,4,20,0.82)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)",
            pointerEvents: "all",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {PLANETS.map((p) => {
            const isActive = selectedPlanet?.name === p.name;
            return (
              <button
                key={p.name}
                onClick={() => onSelectPlanet(p.name)}
                className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full
                  transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 active:scale-95"
                style={{
                  background: isActive ? `${p.color}20` : "transparent",
                  border: isActive
                    ? `1px solid ${p.color}60`
                    : "1px solid transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "8.5px",
                  letterSpacing: "0.04em",
                  boxShadow: isActive ? `0 0 12px 2px ${p.color}22` : "none",
                }}
              >
                {isActive && (
                  <div className="relative w-1.5 h-1.5 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: p.color,
                        opacity: 0.5,
                        animationDuration: "2s",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: p.color,
                        boxShadow: `0 0 5px ${p.color}`,
                      }}
                    />
                  </div>
                )}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Solar-view controls hint (desktop only, bottom right) ── */}
      {!isPlanetMode && (
        <div className="fixed bottom-20 right-6 z-50 hidden sm:flex flex-col items-end gap-2">
          {[
            ["DRAG", "Rotate view"],
            ["PINCH", "Pinch to zoom"],
            ["+/-", "Keyboard zoom"],
            ["HOME", "Full overview"],
            ["CLICK", "Explore"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 text-[9px]"
              style={{ fontFamily: "'IBM Plex Mono',monospace" }}
            >
              <span
                className="px-2 py-0.5 rounded-[4px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.42)",
                  letterSpacing: "0.06em",
                }}
              >
                {k}
              </span>
              <span style={{ color: "rgba(255,255,255,0.22)" }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Mobile: tap-to-explore hint (solar mode) ──────────── */}
      {!isPlanetMode && (
        <div
          className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none
            flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(2,2,18,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="text-[8px] tracking-[0.14em]"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            TAP A PLANET TO EXPLORE
          </span>
        </div>
      )}
    </>
  );
}
