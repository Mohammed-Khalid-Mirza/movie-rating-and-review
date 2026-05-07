"use client";

import { useEffect, useState, useMemo } from "react";
import {
  SearchIcon,
  Delete02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ role: UserRole } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const storedAuth = localStorage.getItem(STORAGE_AUTH);
      if (!storedAuth) return;

      try {
        // Fetch users
        const usersResponse = await fetch(`${API_BASE}/auth/users`, {
          headers: { Authorization: storedAuth },
        });

        // Fetch current user for permission check
        const meResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: storedAuth },
        });

        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data);
        }

        if (meResponse.ok) {
          const meData = await meResponse.json();
          setCurrentUser(meData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    try {
      const response = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: storedAuth ?? "",
        },
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user. You might not have permission.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const storedAuth = localStorage.getItem(STORAGE_AUTH);

    try {
      const response = await fetch(`${API_BASE}/auth/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: storedAuth ?? "",
        },
        body: JSON.stringify(newAdmin),
      });

      if (response.ok) {
        const addedAdmin = await response.json();
        setUsers([addedAdmin, ...users]);
        setIsModalOpen(false);
        setNewAdmin({ name: "", email: "", password: "" });
      } else {
        const error = await response.text();
        alert(error || "Failed to add admin");
      }
    } catch (error) {
      console.error("Add admin failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "ADMIN": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Users</h1>
          <p className="text-muted-foreground">View and manage all registered users in the system.</p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-primary px-2 py-2 h-auto text-lg font-semibold shadow-lg shadow-primary/20 transition-all"
          >
            Add Admin User
          </Button>
        )}
      </div>

      {/* Filters Section */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 h-11 bg-background/50 border-border/60 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="h-11 px-4 rounded-md border border-border/60 bg-background/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-6 py-4 text-sm font-semibold text-foreground">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-foreground">Joined Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-10 w-48 bg-muted rounded-lg" /></td>
                    <td className="px-6 py-6"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                    <td className="px-6 py-6"><div className="h-6 w-24 bg-muted rounded-lg" /></td>
                    <td className="px-6 py-6"><div className="h-8 w-8 bg-muted rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getRoleBadgeColor(user.role)
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-border/60 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 rounded-lg border-border/60"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 rounded-lg border-border/60"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Admin User"
      >
        <form onSubmit={handleAddAdmin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              required
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              required
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              required
              className="bg-background/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-8 bg-primary shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
