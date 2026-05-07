"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  Logout03Icon,
  UserCircleIcon,
  Menu01Icon,
  Cancel01Icon,
  Bookmark01Icon,
  Comment01Icon,
  Settings01Icon,
  Film01Icon,
} from "@hugeicons/core-free-icons";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | string;

type MeResponse = {
  role?: UserRole;
  name?: string;
  email?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthPage = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/register"),
    [pathname],
  );

  useEffect(() => {
    if (isAuthPage) {
      return;
    }

    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    if (!storedAuth) {
      setIsReady(true);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: storedAuth,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(STORAGE_AUTH);
          setRole(null);
          setIsReady(true);
          return;
        }

        const profile = (await response.json()) as MeResponse;
        setRole(profile.role ?? null);
      } catch {
        setRole(null);
      } finally {
        setIsReady(true);
      }
    };

    void loadProfile();
  }, [isAuthPage]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return null;
  }

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_AUTH);
    router.replace("/login");
  };

  const navLinks = [
    { href: "/watchlist", label: "my watchlist", icon: Bookmark01Icon },
    { href: "/comments", label: "my reviews", icon: Comment01Icon },
    { href: "/movies", label: "Movies", icon: Film01Icon, variant: "outline" as const },
    { href: "/search", label: "Search", icon: SearchIcon, variant: "outline" as const },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="leading-tight">
            <div className="text-sm font-bold uppercase tracking-[0.28em] text-foreground transition-colors group-hover:text-primary">
              Movie App
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-end gap-2 lg:gap-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={link.variant || "ghost"}
                className={cn(
                  "rounded-full px-4 text-foreground transition-all duration-300",
                  link.variant === "outline"
                    ? "border-border bg-card/60 hover:bg-accent hover:text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.icon && <HugeiconsIcon icon={link.icon} className={cn("h-4 w-4", link.variant === "outline" ? "mr-2" : "hidden")} />}
                {link.label}
              </Button>
            </Link>
          ))}

          {isAdmin && (
            <Link href="/admins">
              <Button className="rounded-full bg-primary px-4 text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95">
                Admin Panel
              </Button>
            </Link>
          )}

          <div className="h-6 w-px bg-border/60 mx-1" />

          <ModeToggle />

          {isReady && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="rounded-full border-border bg-card/60 px-4 text-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <HugeiconsIcon icon={Logout03Icon} className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <HugeiconsIcon
              icon={isMenuOpen ? Cancel01Icon : Menu01Icon}
              className="h-6 w-6 transition-transform duration-300 ease-in-out"
              style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/60 transition-all duration-300 ease-in-out md:hidden",
          isMenuOpen ? "max-h-[80vh] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        )}
      >
        <div className="mx-auto flex flex-col gap-2 px-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl px-4 py-6 text-lg font-medium text-foreground hover:bg-accent"
              >
                <HugeiconsIcon icon={link.icon} className="mr-4 h-5 w-5 text-primary" />
                {link.label}
              </Button>
            </Link>
          ))}

          {isAdmin && (
            <Link href="/admins" onClick={() => setIsMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl px-4 py-6 text-lg font-medium text-primary hover:bg-primary/10"
              >
                <HugeiconsIcon icon={Settings01Icon} className="mr-4 h-5 w-5" />
                Admin Panel
              </Button>
            </Link>
          )}

          <div className="my-2 h-px bg-border/60" />

          {isReady && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start rounded-xl px-4 py-6 text-lg font-medium text-destructive hover:bg-destructive/10"
            >
              <HugeiconsIcon icon={Logout03Icon} className="mr-4 h-5 w-5" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
