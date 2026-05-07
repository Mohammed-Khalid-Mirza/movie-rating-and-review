"use client";

import { useEffect, useState } from "react";
import MovieCard from "./movie-card";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  description: string;
  cardUrl: string;
  backdropUrl: string;
  releaseDate: string;
  durationMinutes: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function RecentMoviesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMovies = async () => {
      try {
        const response = await fetch(`${API_BASE}/movies/recent?limit=10`);
        if (!response.ok) throw new Error("Failed to fetch movies");
        const data = (await response.json()) as Movie[];
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMovies();
  }, []);

  if (loading) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-12 bg-linear-to-b from-background via-background/95 to-muted">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-12 bg-linear-to-b from-background via-background/95 to-muted/40">
      <div className="container mx-auto space-y-6">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-linear-to-b from-primary to-primary/60 rounded" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Recently Added
            </h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base ml-4">
            Discover the latest movies added to our collection
          </p>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                cardUrl={movie.cardUrl}
                description={movie.description}
                releaseDate={movie.releaseDate}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-64 rounded-lg bg-card/60 border border-border">
            <p className="text-muted-foreground text-lg">No movies available</p>
          </div>
        )}

        {/* View All Button */}
        {movies.length > 0 && (
          <div className="flex justify-center pt-6">
            <Link href="/movies">
            <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
              View All Movies
            </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
