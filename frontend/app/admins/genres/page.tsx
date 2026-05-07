"use client";

import { useEffect, useState, useMemo } from "react";
import {
  PlusSignIcon,
  SearchIcon,
  Delete02Icon,
  PencilEdit02Icon,
  TagsFreeIcons,
  ArrowLeft01Icon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/modal";
import { GenreForm } from "@/components/genre-form";
import { cn } from "@/lib/utils";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface Genre {
  id: number;
  name: string;
  createdAt: string;
}

export default function ManageGenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchGenres = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/genres`);
      if (response.ok) {
        const data = await response.json();
        setGenres(data);
      }
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const filteredGenres = useMemo(() => {
    return genres.filter((genre) =>
      genre.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [genres, searchQuery]);

  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);
  const paginatedGenres = filteredGenres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteGenre = async (id: number) => {
    if (!confirm("Are you sure you want to delete this genre? This may affect movies using it.")) return;

    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    try {
      const response = await fetch(`${API_BASE}/genres/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: storedAuth ?? "",
        },
      });
      if (response.ok) {
        setGenres(genres.filter(g => g.id !== id));
      } else {
        alert("Failed to delete genre. It might be in use by some movies.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSubmit = async (formData: { name: string }) => {
    setIsSubmitting(true);
    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    const method = editingGenre ? "PUT" : "POST";
    const url = editingGenre ? `${API_BASE}/genres/${editingGenre.id}` : `${API_BASE}/genres`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: storedAuth ?? "",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGenres();
        setIsModalOpen(false);
        setEditingGenre(null);
      } else {
        const error = await response.text();
        alert(error || "Failed to save genre");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Genres</h1>
          <p className="text-muted-foreground">Define and organize categories for your movie collection.</p>
        </div>
        <Button
          onClick={() => {
            setEditingGenre(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-primary px-6 py-6 h-auto text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-5 w-5" />
          Add New Genre
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by genre name..."
              className="pl-10 h-11 bg-background/50 border-border/60 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Genres Table */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-6 py-4 text-sm font-semibold text-foreground">Genre Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-6 w-32 bg-muted rounded-lg" /></td>
                    <td className="px-6 py-6"><div className="h-6 w-24 bg-muted rounded-lg" /></td>
                    <td className="px-6 py-6"><div className="h-8 w-20 bg-muted rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedGenres.length > 0 ? (
                paginatedGenres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <HugeiconsIcon icon={TagsFreeIcons} className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{genre.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {new Date(genre.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingGenre(genre);
                          setIsModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGenre(genre.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No genres found matching your search.
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
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredGenres.length)}</span> of <span className="font-medium">{filteredGenres.length}</span> genres
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGenre(null);
        }}
        title={editingGenre ? "Edit Genre" : "Add New Genre"}
      >
        <GenreForm
          initialData={editingGenre || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingGenre(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </main>
  );
}
