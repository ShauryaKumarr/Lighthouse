"use client";

export function LighthouseLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Beacon light rays */}
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

      {/* Tower */}
      <rect x="19" y="12" width="10" height="4" rx="1" fill="#ef4444" />
      <rect x="20" y="16" width="8" height="6" fill="white" />
      <rect x="19" y="22" width="10" height="4" fill="#ef4444" />
      <rect x="20" y="26" width="8" height="6" fill="white" />
      <rect x="19" y="32" width="10" height="4" fill="#ef4444" />

      {/* Base */}
      <path d="M16 36 L32 36 L34 44 L14 44 Z" fill="#1e3a5f" />

      {/* Window */}
      <circle cx="24" cy="14" r="1.5" fill="#f59e0b" />
    </svg>
  );
}
