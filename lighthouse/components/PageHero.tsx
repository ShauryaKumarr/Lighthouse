import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MaxWidth = "6xl" | "7xl";

interface PageHeroProps {
  kicker: string;
  title: string;
  description?: ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
  children?: ReactNode;
}

const maxW: Record<MaxWidth, string> = {
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

/** Enterprise-style page lead: accent kicker, headline, optional body copy. */
export function PageHero({
  kicker,
  title,
  description,
  maxWidth = "7xl",
  className,
  children,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        "border-b border-border/50 bg-gradient-to-br from-[oklch(0.13_0.035_252)] via-background to-background",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 pb-10 pt-10 sm:px-6 lg:px-8",
          maxW[maxWidth]
        )}
      >
        <p className="pro-kicker text-brand">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
