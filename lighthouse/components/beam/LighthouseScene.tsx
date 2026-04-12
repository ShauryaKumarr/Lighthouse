"use client";

const STARS = [
  { x: 5, y: 6, s: 1.5, d: 0 },
  { x: 15, y: 12, s: 1, d: 1.5 },
  { x: 25, y: 4, s: 2, d: 0.5 },
  { x: 32, y: 16, s: 1.5, d: 2 },
  { x: 42, y: 8, s: 1.5, d: 1 },
  { x: 55, y: 3, s: 1, d: 3 },
  { x: 62, y: 14, s: 1.5, d: 0.8 },
  { x: 70, y: 6, s: 1, d: 2.5 },
  { x: 78, y: 18, s: 2, d: 1.2 },
  { x: 88, y: 10, s: 1, d: 0.3 },
  { x: 93, y: 3, s: 1.5, d: 2.8 },
  { x: 48, y: 20, s: 1, d: 1.8 },
  { x: 20, y: 22, s: 1.5, d: 0.6 },
  { x: 75, y: 24, s: 1.5, d: 3.2 },
  { x: 38, y: 28, s: 1, d: 2.2 },
  { x: 82, y: 30, s: 1, d: 1.4 },
  { x: 10, y: 20, s: 2, d: 3.5 },
  { x: 58, y: 11, s: 1, d: 0.2 },
];

export function LighthouseScene() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Sky + water gradient — uses vh so it's always viewport-relative */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #050810 0%,
            #08101e 20%,
            #0e1a35 38%,
            #122044 50%,
            #0e1830 50.3%,
            #0a1225 65%,
            #070d1a 85%,
            #050810 100%
          )`,
        }}
      />

      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "46vh",
          height: "10vh",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(20,30,60,0.4) 40%, rgba(15,25,50,0.2) 60%, transparent 100%)",
        }}
      />

      {/* Horizon line */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "50vh",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(200,210,240,0.06) 15%, rgba(200,210,240,0.1) 50%, rgba(200,210,240,0.06) 85%, transparent 100%)",
        }}
      />

      {/* Stars — only in the sky (top 48vh) */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.x}vw`,
            top: `${star.y * 0.48}vh`,
            width: `${star.s + 0.5}px`,
            height: `${star.s + 0.5}px`,
            backgroundColor: "rgba(210,220,255,0.8)",
            boxShadow: "0 0 3px 1px rgba(210,220,255,0.3)",
            animationDelay: `${star.d}s`,
          }}
        />
      ))}

      {/* ═══════ MOON GROUP ═══════ */}
      <div
        className="absolute"
        style={{ right: "8vw", top: "22vh", width: "50px", height: "50px" }}
      >
        {/* Outer glow */}
        <div
          className="absolute moon-glow-pulse"
          style={{
            left: "50%",
            top: "50%",
            width: "160px",
            height: "160px",
            marginLeft: "-80px",
            marginTop: "-80px",
            background:
              "radial-gradient(circle, rgba(190,200,240,0.15) 0%, rgba(170,180,220,0.05) 40%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Moon body */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #e4e8f8 0%, #c0c8e0 40%, #9098b8 100%)",
            boxShadow:
              "0 0 40px 12px rgba(190,200,240,0.2), 0 0 80px 30px rgba(170,180,220,0.08)",
          }}
        />
      </div>

      {/* Moon water reflection */}
      <div
        className="absolute moon-reflection-shimmer"
        style={{
          right: "calc(8vw + 21px)",
          top: "51vh",
          width: "8px",
          height: "20vh",
          background:
            "linear-gradient(180deg, rgba(190,200,240,0.14) 0%, rgba(180,190,230,0.05) 40%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />

      {/* ═══════ LIGHTHOUSE GROUP — single container keeps everything aligned ═══════ */}
      <div
        className="absolute"
        style={{
          left: "8vw",
          top: "calc(50vh - 160px)",
          width: "160px",
          height: "calc(160px + 50vh)",
        }}
      >
        {/* Beam sweep — originates from the light (centered at ~52/120 of SVG width = ~69px from left, ~18/120 = ~24px from top of SVG) */}
        <div
          className="absolute"
          style={{ left: "69px", top: "24px" }}
        >
          <div
            className="lighthouse-beam-rotate"
            style={{
              width: "280vh",
              height: "280vh",
              marginLeft: "-140vh",
              marginTop: "-140vh",
              background: `conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(255,210,60,0.015) 4deg,
                rgba(255,220,80,0.07) 8deg,
                rgba(255,240,120,0.12) 10deg,
                rgba(255,220,80,0.07) 12deg,
                rgba(255,210,60,0.015) 16deg,
                transparent 20deg,
                transparent 180deg,
                rgba(255,210,60,0.01) 184deg,
                rgba(255,220,80,0.05) 188deg,
                rgba(255,240,120,0.08) 190deg,
                rgba(255,220,80,0.05) 192deg,
                rgba(255,210,60,0.01) 196deg,
                transparent 200deg,
                transparent 360deg
              )`,
              borderRadius: "50%",
              willChange: "transform",
            }}
          />
        </div>

        {/* Lighthouse SVG structure */}
        <svg
          className="absolute top-0 left-0"
          width="160"
          height="160"
          viewBox="0 0 120 120"
          fill="none"
        >
          {/* Rocky island */}
          <path
            d="M0 88 Q10 76 20 80 Q30 74 42 77 Q52 72 62 75 Q74 72 86 78 Q96 80 108 86 Q116 90 120 95 L120 120 L0 120 Z"
            fill="#0a1020"
            stroke="#141e38"
            strokeWidth="0.5"
          />

          {/* Small buildings on island */}
          <rect x="68" y="68" width="16" height="15" rx="2" fill="#10182c" />
          <polygon points="68,68 76,58 84,68" fill="#141e36" />
          <rect x="86" y="74" width="12" height="10" rx="1" fill="#0c1426" />
          <rect x="54" y="73" width="9" height="8" rx="1" fill="#0e1628" />

          {/* Tower body — cream */}
          <polygon points="42,82 46,24 58,24 62,82" fill="#d0c8b8" />

          {/* Red stripes */}
          <polygon
            points="42.8,82 43.8,72 60.2,72 61.2,82"
            fill="#8b2c2c"
          />
          <polygon
            points="45.5,60 46.5,50 57.5,50 58.5,60"
            fill="#8b2c2c"
          />
          <polygon points="47.5,40 48,32 56,32 56.5,40" fill="#8b2c2c" />

          {/* Light chamber */}
          <rect x="43" y="16" width="18" height="10" rx="1" fill="#181430" />

          {/* Light glass — the bright amber window */}
          <rect x="45" y="18" width="14" height="6" rx="1" fill="#ffe060" />

          {/* Dome */}
          <path d="M43 16 Q52 8 61 16" fill="#1a1632" />
          <circle cx="52" cy="8" r="2.5" fill="#1c1834" />
        </svg>

        {/* Light glow — positioned relative to SVG light glass */}
        {/* Light glass is at SVG coords (45,18)-(59,24), center ~(52, 21). At 160px/120 viewBox = 1.333 scale, that's pixel (69, 28) */}
        <div
          className="absolute lighthouse-light-pulse"
          style={{ left: "57px", top: "18px", width: "24px", height: "16px" }}
        >
          {/* Hot core */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-8px",
              background:
                "radial-gradient(ellipse, rgba(255,230,100,0.9) 0%, rgba(255,200,50,0.4) 40%, transparent 70%)",
            }}
          />
          {/* Medium halo */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-25px",
              background:
                "radial-gradient(ellipse, rgba(255,210,60,0.3) 0%, rgba(255,180,30,0.08) 50%, transparent 70%)",
            }}
          />
          {/* Wide outer halo */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-60px",
              background:
                "radial-gradient(ellipse, rgba(255,200,50,0.1) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Water reflection — directly below lighthouse, starts at 160px (bottom of SVG = horizon) */}
        <div
          className="absolute lighthouse-reflection-shimmer"
          style={{
            left: "65px",
            top: "160px",
            width: "10px",
            height: "30vh",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(255,210,60,0.25) 0%, rgba(255,190,40,0.12) 25%, rgba(255,170,20,0.04) 55%, transparent 100%)",
              filter: "blur(4px)",
            }}
          />
        </div>
      </div>

      {/* Water shimmer lines */}
      {[54, 60, 66, 73, 80, 88, 95].map((y, i) => (
        <div
          key={y}
          className="absolute water-line-drift"
          style={{
            top: `${y}vh`,
            left: `${4 + i * 4}vw`,
            width: `${25 + i * 6}vw`,
            height: "1px",
            background: `linear-gradient(90deg, transparent 0%, rgba(200,210,240,${
              0.03 + (i % 3) * 0.015
            }) 30%, rgba(200,210,240,${
              0.05 + (i % 2) * 0.02
            }) 50%, rgba(200,210,240,${
              0.03 + (i % 3) * 0.015
            }) 70%, transparent 100%)`,
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}
    </div>
  );
}
