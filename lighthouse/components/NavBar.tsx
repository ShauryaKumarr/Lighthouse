"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LighthouseLogo } from "./LighthouseLogo";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Harbor Overview" },
  { href: "/beam", label: "The Beam" },
  { href: "/hazards", label: "Hazard Map" },
  { href: "/log", label: "Lighthouse Log" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-navy text-fog border-b border-ocean">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <LighthouseLogo className="h-9 w-9" />
            <div>
              <span className="text-lg font-bold tracking-tight text-beacon">
                LIGHTHOUSE
              </span>
              <span className="ml-2 text-xs font-medium text-fog/60 hidden sm:inline">
                Audit Dashboard
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-ocean text-beacon"
                      : "text-fog/70 hover:bg-ocean/50 hover:text-fog"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
