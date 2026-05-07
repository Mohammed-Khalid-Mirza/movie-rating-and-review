"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

export default function HeroSlider() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchRecentMovies = async () => {
      try {
        const response = await fetch(`${API_BASE}/movies/recent?limit=5`);
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
      <div className="w-full h-125 bg-linear-to-r from-background via-background/95 to-muted flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="w-full h-125 bg-linear-to-r from-background via-background/95 to-muted flex items-center justify-center">
        <div className="text-foreground text-xl">No movies available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-[0_0_100%] min-w-0 relative group"
            >
              {/* Background Image with Overlay */}
              <div
                className="relative w-full h-125 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${movie.backdropUrl})`,
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                  <div className="max-w-2xl space-y-4">
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg line-clamp-3">
                      {movie.title}
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg text-gray-200 drop-shadow max-w-2xl line-clamp-2">
                      {movie.description}
                    </p>

                    {/* Movie Info */}
                    <div className="flex items-center gap-4 text-sm md:text-base text-gray-300">
                      {movie.releaseDate && (
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      )}
                      {movie.durationMinutes && (
                        <span>{movie.durationMinutes} min</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Link href={`/movies/${movie.id}`}>
                        <Button
                          size="lg"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {movies.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/25 hover:bg-background/40 backdrop-blur-md disabled:opacity-30 transition-all p-2 rounded-full text-foreground"
            aria-label="Previous slide"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="w-6 h-6 text-white"
            />
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/25 hover:bg-background/40 backdrop-blur-md  disabled:opacity-30 transition-all p-2 rounded-full text-foreground"
            aria-label="Next slide"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="w-6 h-6 text-white"
            />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-all"
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
