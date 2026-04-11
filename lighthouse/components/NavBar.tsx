"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LighthouseLogo } from "./LighthouseLogo";

const NAV_ITEMS = [
  { href: "/", label: "Harbor Overview" },
  { href: "/beam", label: "The Beam" },
  { href: "/hazards", label: "Hazard Map" },
  { href: "/log", label: "Lighthouse Log" },
];

const navLinkUnderline =
  "after:pointer-events-none after:absolute after:inset-x-5 after:bottom-2 after:h-[3px] after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:after:inset-x-6";

const linkBase = `relative whitespace-nowrap rounded-md px-6 py-4 text-xl font-medium leading-none tracking-tight text-slate-600 transition-colors hover:text-[rgb(27,49,57)] lg:px-8 lg:text-2xl lg:font-normal ${navLinkUnderline}`;

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/90 bg-white font-sans shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:min-h-[5rem] lg:gap-12 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LighthouseLogo className="h-10 w-10 lg:h-11 lg:w-11" />
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-[0.14em] text-[rgb(27,49,57)] lg:text-xl">
              LIGHTHOUSE
            </span>
            <span className="mt-0.5 hidden text-xs font-medium tracking-wide text-slate-500 sm:block lg:text-sm">
              Audit console
            </span>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-2 lg:gap-3 xl:gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkBase} ${isActive ? "font-semibold text-[rgb(27,49,57)] after:scale-x-100" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end md:flex-none md:pl-4">
          <div className="flex max-w-[min(100vw-10rem,28rem)] items-center gap-1.5 overflow-x-auto pb-1 md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative shrink-0 whitespace-nowrap rounded-md px-3 py-2.5 text-base font-medium tracking-tight text-slate-600 after:pointer-events-none after:absolute after:inset-x-3 after:bottom-1 after:h-[2.5px] after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[rgb(27,49,57)] hover:after:scale-x-100 focus-visible:after:scale-x-100 ${
                    isActive
                      ? "font-semibold text-[rgb(27,49,57)] after:scale-x-100"
                      : ""
                  }`}
                >
                  {item.label.replace(" Overview", "").replace(" Map", "")}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
