"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Film01Icon,
  Comment01Icon,
  ChartBarLineIcon,
  ArrowRight01Icon,
  Tag01Icon
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StatsData {
  totalUsers: number;
  totalMovies: number;
  totalReviews: number;
  totalGenres: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function AdminPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedAuth = localStorage.getItem("demo_jwt_auth");
        const response = await fetch(`${API_BASE}/admins/stats`, {
          headers: {
            Authorization: storedAuth ?? "",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { 
      label: "Total Users", 
      value: statsData?.totalUsers.toLocaleString() ?? "...", 
      icon: UserGroupIcon, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Total Movies", 
      value: statsData?.totalMovies.toLocaleString() ?? "...", 
      icon: Film01Icon, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10" 
    },
    { 
      label: "Total Reviews", 
      value: statsData?.totalReviews.toLocaleString() ?? "...", 
      icon: Comment01Icon, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
    { 
      label: "Total Genres", 
      value: statsData?.totalGenres.toLocaleString() ?? "...", 
      icon: Tag01Icon, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
  ];

  const quickActions = [
    { title: "Manage Users", description: "View, edit and manage user accounts", href: "/admins/users", icon: UserGroupIcon },
    { title: "Movie Content", description: "Add or edit movie listings and details", href: "/admins/movies", icon: Film01Icon },
    { title: "Moderate Comments", description: "Review and manage user feedback", href: "/admins/comments", icon: Comment01Icon },
    { title: "Manage Genres", description: "Create and organize movie categories", href: "/admins/genres", icon: Tag01Icon },
  ];

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Here's what's happening with your application today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <HugeiconsIcon icon={stat.icon} className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time data from database
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="h-full border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:bg-accent/40 hover:border-primary/50">
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <HugeiconsIcon icon={action.icon} className="h-7 w-7" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
