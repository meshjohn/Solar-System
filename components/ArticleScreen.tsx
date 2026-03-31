"use client";
import { useEffect, useState, useRef } from "react";
import { useSolarStore } from "@/store/useSolarStore";

export default function ArticleScreen() {
  const { activeArticle, setActiveArticle } = useSolarStore();
  const [displayedText, setDisplayedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const textIndex = useRef(0);

  useEffect(() => {
    if (activeArticle) {
      setIsOpen(true);
      setDisplayedText("");
      textIndex.current = 0;
      
      const interval = setInterval(() => {
        if (textIndex.current < activeArticle.content.length) {
          setDisplayedText((prev) => prev + activeArticle.content.charAt(textIndex.current));
          textIndex.current++;
        } else {
          clearInterval(interval);
        }
      }, 15);
      
      return () => clearInterval(interval);
    } else {
      setIsOpen(false);
      // Give time for exit animation before clearing content
      const timeout = setTimeout(() => setDisplayedText(""), 700);
      return () => clearTimeout(timeout);
    }
  }, [activeArticle]);

  if (!activeArticle && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 pointer-events-none transition-all duration-700 ease-in-out ${isOpen ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 backdrop-blur-none"}`}
    >
      {/* Electronic Board Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto rounded-xl overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: "rgba(4, 8, 16, 0.4)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${activeArticle?.planetColor || "#fff"}50`,
          boxShadow: `0 0 50px ${activeArticle?.planetColor || "#fff"}15, inset 0 0 20px ${activeArticle?.planetColor || "#fff"}10`,
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
        }}
      >
        {/* CRT Scanline Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px)",
            mixBlendMode: "overlay"
          }}
        />

        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${activeArticle?.planetColor || "#fff"}, transparent)` }} />
        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${activeArticle?.planetColor || "#fff"}80, transparent)` }} />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: `${activeArticle?.planetColor || "#fff"}20`, background: "rgba(0,0,0,0.6)" }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeArticle?.planetColor || "#fff", boxShadow: `0 0 10px ${activeArticle?.planetColor || "#fff"}` }} />
            <span 
              className="text-xs sm:text-sm tracking-[0.2em] font-bold uppercase"
              style={{ color: activeArticle?.planetColor || "#fff", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              SECURE DATA LINK // {activeArticle?.planetName}
            </span>
          </div>
          <button
            onClick={() => setActiveArticle(null)}
            className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/20 active:scale-95 cursor-pointer"
            style={{ color: activeArticle?.planetColor || "#fff", border: `1px solid ${activeArticle?.planetColor || "#fff"}40`, background: "rgba(255,255,255,0.05)" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Console Text Content */}
        <div 
          className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-10 whitespace-pre-wrap select-text"
          style={{
            color: activeArticle?.planetColor ? `${activeArticle.planetColor}f0` : "#fff",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "14px",
            lineHeight: 1.8,
            textShadow: `0 0 8px ${activeArticle?.planetColor || "#fff"}60`
          }}
        >
          {displayedText}
          <span className="inline-block w-2.5 h-4 ml-1 animate-pulse" style={{ background: activeArticle?.planetColor || "#fff", verticalAlign: "baseline" }} />
        </div>
      </div>
    </div>
  );
}
