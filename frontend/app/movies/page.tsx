"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/movie-card";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FilterIcon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  cardUrl: string;
  description: string;
  releaseDate: string;
}

interface PageResponse {
  content: Movie[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface Genre {
  id: number;
  name: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function MoviesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "0");
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters (derived from URL)
  const [genres, setGenres] = useState<Genre[]>([]);
  const selectedGenre = searchParams.get("genreId") || "all";
  const selectedType = searchParams.get("type") || "all";

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

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/movies?page=${page}&size=12`;
        if (selectedGenre !== "all") url += `&genreId=${selectedGenre}`;
        if (selectedType !== "all") url += `&type=${selectedType}`;

        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, selectedGenre, selectedType, API_BASE]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/movies?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/movies?${params.toString()}`);
  };

  const movies = Array.isArray(data) ? data : data?.content || [];
  const totalPages = Array.isArray(data) ? 1 : data?.totalPages || 1;
  const totalElements = Array.isArray(data)
    ? data.length
    : data?.totalElements || 0;
  const number = Array.isArray(data) ? 0 : data?.currentPage || 0;
  const size = Array.isArray(data) ? data.length : data?.size || 12;
  const hasNext = Array.isArray(data) ? false : data?.hasNext || false;
  const hasPrevious = Array.isArray(data) ? false : data?.hasPrevious || false;

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Loading library...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filters Bar */}
      <div className="bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-border/40 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Filter Library
          </span>
        </div>

        <select
          className="h-12 bg-background/50 border-border/60 rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[140px] font-medium"
          value={selectedType}
          onChange={(e) => handleFilterChange("type", e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="MOVIE">Movies Only</option>
          <option value="SERIES">Series Only</option>
        </select>

        <select
          className="h-12 bg-background/50 border-border/60 rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[140px] font-medium"
          value={selectedGenre}
          onChange={(e) => handleFilterChange("genreId", e.target.value)}
        >
          <option value="all">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {(selectedGenre !== "all" || selectedType !== "all") && (
          <Button
            variant="ghost"
            className="h-12 text-muted-foreground hover:text-primary font-bold rounded-xl"
            onClick={() => {
              router.push("/movies");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length > 0 ? (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
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

          {/* Pagination */}
          <div className="flex flex-col items-center justify-center gap-6 pt-12 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={!hasPrevious}
                onClick={() => handlePageChange(page - 1)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "ghost"}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold",
                      page === i
                        ? "shadow-lg shadow-primary/20"
                        : "text-muted-foreground",
                    )}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={!hasNext}
                onClick={() => handlePageChange(page + 1)}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
              Showing {number * size + 1} -{" "}
              {Math.min((number + 1) * size, totalElements)} of {totalElements}{" "}
              Titles
            </p>
          </div>
        </>
      ) : (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
          <HugeiconsIcon
            icon={PlayCircleIcon}
            className="w-16 h-16 text-muted-foreground/20"
          />
          <h3 className="text-2xl font-bold">No movies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              handleFilterChange("genreId", "all");
              handleFilterChange("type", "all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AllMoviesPage() {
  const searchParams = useSearchParams();
  const key = searchParams.toString();

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted/40 pb-24 pt-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">
                Initializing library...
              </p>
            </div>
          }
        >
          <MoviesList key={key} />
        </Suspense>
      </div>
    </div>
  );
}
