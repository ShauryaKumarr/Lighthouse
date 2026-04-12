"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Root URL opens the same Harbor dashboard as production (`/harbor`). */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/harbor");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-beacon-pulse rounded-full bg-beacon/20" />
        <p className="text-sm text-muted-foreground">Opening Harbor Overview…</p>
      </div>
    </div>
  );
}
