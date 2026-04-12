"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LighthouseScene } from "./LighthouseScene";

interface SpotlightProps {
  children: React.ReactNode;
}

export function Spotlight({ children }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setMouse({ x: e.clientX, y: e.clientY });
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove, { passive: true });
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <>
      {/* Fixed viewport scene — sits behind everything */}
      <LighthouseScene />

      <div ref={containerRef} className="relative" style={{ zIndex: 1 }}>
        {/* Cursor spotlight glow */}
        <div
          className="pointer-events-none fixed inset-0 transition-opacity duration-300"
          style={{ zIndex: 2, opacity: isHovering ? 1 : 0 }}
        >
          <div
            className="absolute h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mouse.x,
              top: mouse.y,
              background:
                "radial-gradient(circle, rgba(255,250,235,0.20) 0%, rgba(251,191,36,0.14) 30%, transparent 60%)",
            }}
          />
          <div
            className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mouse.x,
              top: mouse.y,
              background:
                "radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 40%, transparent 70%)",
            }}
          />
        </div>

        {/* Page content */}
        {children}
      </div>
    </>
  );
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({
  children,
  className = "",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden transition-shadow duration-300 ${
        isHovering ? "shadow-[0_0_40px_-8px_rgba(245,158,11,0.15)]" : ""
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-200"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(350px circle at ${mouse.x}px ${mouse.y}px, rgba(251,191,36,0.15), rgba(245,158,11,0.04) 50%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.12)",
        }}
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
}
