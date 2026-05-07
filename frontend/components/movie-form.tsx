"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_AUTH = "demo_jwt_auth";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface Genre {
  id: number;
  name: string;
}

interface MovieFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function MovieForm({ initialData, onSubmit, onCancel, isSubmitting }: MovieFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    cardUrl: initialData?.cardUrl || "",
    backdropUrl: initialData?.backdropUrl || "",
    releaseDate: initialData?.releaseDate || "",
    durationMinutes: initialData?.durationMinutes || "",
    type: initialData?.type || "MOVIE",
    genres: initialData?.genres || [],
  });

  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_BASE}/genres`);
        if (response.ok) {
          const data = await response.json();
          setGenres(data);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    const isSelected = formData.genres.some((g: any) => g.id === genre.id);
    if (isSelected) {
      setFormData({
        ...formData,
        genres: formData.genres.filter((g: any) => g.id !== genre.id),
      });
    } else {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Movie title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="MOVIE">Movie</option>
            <option value="SERIES">Series</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Movie plot, summary..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardUrl">Card Image URL</Label>
          <Input
            id="cardUrl"
            value={formData.cardUrl}
            onChange={(e) => setFormData({ ...formData, cardUrl: e.target.value })}
            required
            placeholder="https://example.com/card.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="backdropUrl">Backdrop Image URL (Big Image)</Label>
          <Input
            id="backdropUrl"
            value={formData.backdropUrl}
            onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
            required
            placeholder="https://example.com/backdrop.jpg"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Genres</Label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-background/50">
          {genres.map((g) => {
            const isSelected = formData.genres.some((selected: any) => selected.id === g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                )}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="releaseDate">Release Date</Label>
          <Input
            id="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (mins)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            required
            placeholder="120"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-8">
          {isSubmitting ? "Saving..." : initialData ? "Update Movie" : "Add Movie"}
        </Button>
      </div>
    </form>
  );
}
