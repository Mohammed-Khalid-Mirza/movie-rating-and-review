"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | string;

type MeResponse = {
  role?: UserRole;
};

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedAuth = localStorage.getItem(STORAGE_AUTH);
      if (!storedAuth) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: storedAuth,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(STORAGE_AUTH);
          router.replace("/login");
          return;
        }

        const profile = (await response.json()) as MeResponse;
        const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
