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

const linkBase =
  "relative whitespace-nowrap rounded-md px-5 py-3 text-[17px] font-medium leading-none tracking-tight transition-colors lg:px-7 lg:text-lg";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-log-shell font-sans text-white shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex min-h-[4rem] max-w-7xl items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:gap-12 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LighthouseLogo className="h-9 w-9" />
          <div className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[0.16em] text-white lg:text-base">
              LIGHTHOUSE
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-white/55 sm:block">
              Audit console
            </span>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkBase} ${
                    isActive
                      ? "text-white after:absolute after:inset-x-4 after:bottom-1 after:h-[3px] after:rounded-sm after:bg-brand lg:after:inset-x-5"
                      : "text-white/88 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none md:pl-4">
          <div className="flex max-w-[min(100vw-10rem,28rem)] items-center gap-1 overflow-x-auto pb-1 md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-3 py-2 text-[13px] font-medium tracking-tight ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "text-white/75 hover:bg-white/[0.06] hover:text-white"
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
