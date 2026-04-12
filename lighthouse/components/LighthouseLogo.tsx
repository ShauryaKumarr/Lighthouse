"use client";

interface Props {
  className?: string;
  animate?: boolean;
}

export function LighthouseLogo({ className = "", animate = false }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rotating beacon rays */}
      <g
        className={animate ? "lighthouse-beam-rotate" : ""}
        style={{ transformOrigin: "24px 12px" }}
      >
        <path
          d="M24 4 L20 12 L28 12 Z"
          fill="#f59e0b"
          opacity="0.9"
        />
        <path
          d="M24 8 L14 10 L16 14 Z"
          fill="#fbbf24"
          opacity="0.5"
        />
        <path
          d="M24 8 L34 10 L32 14 Z"
          fill="#fbbf24"
          opacity="0.5"
        />
        {/* Extended beam rays visible during rotation */}
        <line x1="24" y1="12" x2="10" y2="6" stroke="#f59e0b" strokeWidth="1.5" opacity="0.3" />
        <line x1="24" y1="12" x2="38" y2="6" stroke="#f59e0b" strokeWidth="1.5" opacity="0.3" />
        <line x1="24" y1="12" x2="6" y2="14" stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
        <line x1="24" y1="12" x2="42" y2="14" stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
      </g>

      {/* Glow around beacon */}
      {animate && (
        <circle
          cx="24"
          cy="12"
          r="5"
          fill="#f59e0b"
          opacity="0.15"
          className="lighthouse-light-pulse"
        />
      )}

      {/* Tower */}
      <rect x="19" y="12" width="10" height="4" rx="1" fill="#ef4444" />
      <rect x="20" y="16" width="8" height="6" fill="white" />
      <rect x="19" y="22" width="10" height="4" fill="#ef4444" />
      <rect x="20" y="26" width="8" height="6" fill="white" />
      <rect x="19" y="32" width="10" height="4" fill="#ef4444" />

      {/* Base */}
      <path d="M16 36 L32 36 L34 44 L14 44 Z" fill="#1e3a5f" />

      {/* Window (beacon light) */}
      <circle
        cx="24"
        cy="14"
        r="1.5"
        fill="#f59e0b"
        className={animate ? "lighthouse-light-pulse" : ""}
      />
    </svg>
  );
}
