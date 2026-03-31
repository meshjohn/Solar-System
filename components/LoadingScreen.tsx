"use client";
import { useEffect, useState, useRef } from "react";

const PLANETS = [
  {
    name: "Mercury",
    color: "#c0ccff",
    field: "Philosophy",
    r: 52,
    speed: 9,
    size: 3.5,
    phase: 0,
  },
  {
    name: "Venus",
    color: "#ffb050",
    field: "Arts",
    r: 70,
    speed: 13,
    size: 4.5,
    phase: 1.2,
  },
  {
    name: "Earth",
    color: "#38e888",
    field: "Business",
    r: 88,
    speed: 17,
    size: 5,
    phase: 2.5,
  },
  {
    name: "Mars",
    color: "#ff5530",
    field: "Technology",
    r: 106,
    speed: 22,
    size: 4,
    phase: 4.1,
  },
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [visiblePlanets, setVisiblePlanets] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = t < 0.75 ? t * 1.1 : 0.825 + (t - 0.75) * 0.7;
      const p = Math.min(eased * 100, 100);
      setProgress(p);
      setVisiblePlanets(Math.floor((p / 100) * PLANETS.length) + 1);

      if (step >= steps) {
        clearInterval(timer);
        setProgress(100);
        setVisiblePlanets(PLANETS.length);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 800);
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#000208",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Deep space nebula gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,10,60,0.7) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 50% 40% at 20% 70%, rgba(10,30,80,0.4) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 40% 30% at 80% 20%, rgba(60,10,30,0.3) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Star field */}
      <StarField />

      {/* ── Central solar system animation ── */}
      <div
        className="relative flex items-center justify-center mb-10 sm:mb-12 select-none"
        style={{ width: 260, height: 260 }}
      >
        {/* Orbit rings */}
        {PLANETS.map((p, i) => (
          <div
            key={p.name}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.r * 2,
              height: p.r * 2,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(255,255,255,0.05)",
              opacity: visiblePlanets > i ? 1 : 0.1,
              transition: "opacity 0.6s ease",
            }}
          />
        ))}

        {/* Orbiting planets */}
        {PLANETS.map((p, i) => (
          <OrbitingDot
            key={p.name}
            radius={p.r}
            speed={p.speed}
            color={p.color}
            size={p.size}
            phase={p.phase}
            visible={visiblePlanets > i}
          />
        ))}

        {/* Sun */}
        <div
          className="relative rounded-full z-10 flex-shrink-0"
          style={{
            width: 52,
            height: 52,
            background:
              "radial-gradient(circle at 33% 28%, #fff8c0, #ffaa22 45%, #ff4800 78%, #aa1000)",
            boxShadow:
              "0 0 50px 18px rgba(255,140,20,0.5), 0 0 100px 40px rgba(255,60,0,0.18), 0 0 8px 3px rgba(255,240,100,0.9)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "14%",
              left: "14%",
              width: "28%",
              height: "28%",
              background: "white",
              opacity: 0.32,
              filter: "blur(3px)",
            }}
          />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="text-center px-6 mb-2">
        <h1
          className="font-black uppercase leading-none tracking-widest"
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: "clamp(28px, 8vw, 48px)",
            letterSpacing: "0.15em",
            color: "#ffffff",
          }}
        >
          Solar Knowledge
        </h1>
        <p
          className="mt-3"
          style={{
            fontSize: "clamp(9px, 2vw, 11px)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,200,80,0.45)",
            fontFamily: "'Inter',sans-serif",
            fontWeight: 500,
          }}
        >
          8 Worlds · Infinite Knowledge
        </p>
      </div>

      {/* ── Planet legend ── */}
      <div className="flex items-center gap-3 sm:gap-5 mt-6 mb-8 flex-wrap justify-center px-8">
        {PLANETS.map((p, i) => (
          <div
            key={p.name}
            className="flex flex-col items-center gap-1.5"
            style={{
              opacity: visiblePlanets > i ? 1 : 0.12,
              transition: "opacity 0.5s ease",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: 7,
                height: 7,
                background: p.color,
                boxShadow: `0 0 8px 3px ${p.color}70`,
              }}
            />
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Inter',sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{ width: "min(300px, 75vw)" }}>
        {/* Track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 1.5, background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(255,140,20,0.9), rgba(255,220,80,1))",
              boxShadow: "0 0 10px 2px rgba(255,180,40,0.7)",
              transition: "width 0.06s linear",
            }}
          />
        </div>

        {/* Label row */}
        <div className="flex items-center justify-between mt-2.5">
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            {progress < 100 ? "Preparing the cosmos" : "Ready for launch"}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
              color: "rgba(255,200,80,0.8)",
              letterSpacing: "0.04em",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Star field ────────────────────────────────────────────── */
function StarField() {
  const stars = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.55 + 0.08,
      delay: Math.random() * 5,
      dur: Math.random() * 3 + 2.5,
      // some stars slightly blue/warm colored
      hue:
        Math.random() > 0.85
          ? `rgba(180,200,255,1)`
          : Math.random() > 0.7
            ? `rgba(255,230,180,1)`
            : "white",
    })),
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.hue,
            opacity: s.opacity,
            animation: `pulseGlow ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Orbiting dot ──────────────────────────────────────────── */
function OrbitingDot({
  radius,
  speed,
  color,
  size,
  phase,
  visible,
}: {
  radius: number;
  speed: number;
  color: string;
  size: number;
  phase: number;
  visible: boolean;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${size * 1.2}px ${color}70`,
        top: `calc(50% - ${size / 2}px)`,
        left: `calc(50% + ${radius}px - ${size / 2}px)`,
        transformOrigin: `-${radius}px 0px`,
        animation: `spin-${Math.round(radius)} ${speed}s linear infinite`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <style>{`
        @keyframes spin-${Math.round(radius)} {
          from { transform: rotate(${phase}turn); }
          to   { transform: rotate(${phase + 1}turn); }
        }
      `}</style>
    </div>
  );
}
