"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-md p-2 text-xs text-fog/70 hover:text-beacon transition-colors"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
