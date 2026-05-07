"use client";

import { useEffect, useState } from "react";
import {
  PlusSignIcon,
  SearchIcon,
  Delete02Icon,
  PencilEdit02Icon,
  Calendar01Icon,
  Clock01Icon,
  Film01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/modal";
import { MovieForm } from "@/components/movie-form";
import { cn } from "@/lib/utils";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface Movie {
  id: number;
  title: string;
  description: string;
  cardUrl: string;
  backdropUrl: string;
  releaseDate: string;
  durationMinutes: number;
  type: string;
  genres: { id: number; name: string }[];
}

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/movies`);
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and flat responses
        setMovies(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    try {
      const response = await fetch(`${API_BASE}/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: storedAuth ?? "",
        },
      });
      if (response.ok) {
        setMovies(movies.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const storedAuth = localStorage.getItem(STORAGE_AUTH);
    const method = editingMovie ? "PUT" : "POST";
    const url = editingMovie ? `${API_BASE}/movies/${editingMovie.id}` : `${API_BASE}/movies`;

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
        await fetchMovies();
        setIsModalOpen(false);
        setEditingMovie(null);
      } else {
        alert("Failed to save movie");
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Movies</h1>
          <p className="text-muted-foreground">Add, edit, or remove movies and series from the library.</p>
        </div>
        <Button
          onClick={() => {
            setEditingMovie(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-primary px-6 py-6 h-auto text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-5 w-5" />
          Add New Movie
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          className="pl-10 h-11 bg-card/40 border-border/60 backdrop-blur-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className="group relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl py-0">
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src={movie.cardUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="secondary"
                      className="flex-1 rounded-full h-10 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                      onClick={() => {
                        setEditingMovie(movie);
                        setIsModalOpen(true);
                      }}
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-10 w-10 rounded-full p-0 flex items-center justify-center bg-red-500/80 hover:bg-red-600"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{movie.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {movie.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-y-2 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5 mr-4">
                    <HugeiconsIcon icon={Film01Icon} className="h-3.5 w-3.5 text-primary" />
                    {movie.genres?.map(g => g.name).join(", ") || "No Genre"}
                  </div>
                  <div className="flex items-center gap-1.5 mr-4">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                    {new Date(movie.releaseDate).getFullYear()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5" />
                    {movie.durationMinutes}m
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMovie(null);
        }}
        title={editingMovie ? "Edit Movie" : "Add New Movie"}
      >
        <MovieForm
          initialData={editingMovie}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMovie(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </main>
  );
}
