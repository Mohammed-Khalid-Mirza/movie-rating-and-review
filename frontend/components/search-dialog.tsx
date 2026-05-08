"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Film01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  cardUrl: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/movies?search=${encodeURIComponent(searchQuery)}&size=8`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.content || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSelect = (movieId: number) => {
    router.push(`/movies/${movieId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl gap-0 p-0 overflow-hidden border-none bg-background/90 backdrop-blur-2xl shadow-2xl rounded-3xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search Movies</DialogTitle>
        
        <DialogHeader className="p-4 border-b border-border/20">
          <div className="relative flex items-center">
            <HugeiconsIcon
              icon={isLoading ? Loading03Icon : SearchIcon}
              className={cn(
                "absolute left-3 h-5 w-5 text-primary/60 transition-all duration-300",
                isLoading && "animate-spin text-primary"
              )}
            />
            <Input
              placeholder="Search for movies..."
              className="pl-11 h-12 text-lg border-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-3 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border/20 text-[10px] font-medium text-muted-foreground">
              <span>ESC</span>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Movies found ({results.length})
              </div>
              {results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelect(movie.id)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 group text-left border border-transparent hover:border-primary/10"
                >
                  <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg border border-border/20">
                    {movie.cardUrl ? (
                      <img
                        src={movie.cardUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <HugeiconsIcon icon={Film01Icon} className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] font-bold text-primary uppercase">
                        Movie
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted/50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                     <HugeiconsIcon 
                        icon={SearchIcon} 
                        className="h-4 w-4 text-primary" 
                      />
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="py-16 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 mb-4">
                <HugeiconsIcon icon={Film01Icon} className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-foreground font-medium">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">We couldn't find any movies matching "{query}"</p>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground animate-in fade-in duration-500">
              <HugeiconsIcon icon={SearchIcon} className="h-10 w-10 mx-auto mb-4 opacity-10" />
              <p className="text-sm">Enter a movie title to begin searching...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
