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
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LighthouseLogo className="h-8 w-8" />
          <div className="leading-tight">
            <span className="block text-[13px] font-semibold tracking-[0.12em] text-foreground">
              LIGHTHOUSE
            </span>
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
              Audit console
            </span>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-3 pb-2.5 pt-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <div className="flex items-center gap-0.5 overflow-x-auto md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-2 py-1.5 text-xs font-medium ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label.replace(" Overview", "").replace(" Map", "")}
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
