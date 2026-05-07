"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/comments", label: "My Comment" },
  { href: "/search", label: "Search" },
];

export default function Footer() {
  const pathname = usePathname();

  const isAuthPage = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/register"),
    [pathname],
  );

  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-linear-to-b from-background via-background/95 to-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Movie App
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              A cleaner way to discover, track, and review movies.
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-center">
          <p>© {new Date().getFullYear()} Movie App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
