"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark01Icon,
  Delete02Icon,
  ArrowLeft02Icon,
  StarIcon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Movie {
  id: number;
  title: string;
  description: string;
  cardUrl: string;
  backdropUrl: string;
  releaseDate: string;
  durationMinutes: number;
}

interface WatchListItem {
  id: number;
  addedAt: string;
  watched: boolean;
  movie: Movie;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  // Review states
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);

  const fetchWatchlist = async () => {
    const storedAuth = localStorage.getItem("demo_jwt_auth");
    if (!storedAuth) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/watchlist/me`, {
        headers: { Authorization: storedAuth },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId: number, title: string) => {
    const storedAuth = localStorage.getItem("demo_jwt_auth");
    if (!storedAuth) return;

    setIsRemoving(movieId);
    try {
      const response = await fetch(`${API_BASE}/watchlist/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: storedAuth },
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.movie.id !== movieId));
        toast.success(`"${title}" removed from watchlist`);
      } else {
        toast.error("Failed to remove movie");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleSubmitReview = async (movieId: number, title: string) => {
    const storedAuth = localStorage.getItem("demo_jwt_auth");
    if (!storedAuth) {
      toast.error("Please login to leave a review");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/reviews/movie/${movieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: storedAuth,
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment,
        }),
      });

      if (response.ok) {
        toast.success("Review submitted!");
        setUserRating(0);
        setUserComment("");
        setActiveReviewId(null);
      } else if (response.status === 409) {
        toast.info("You have already reviewed this movie");
        setActiveReviewId(null);
      } else {
        const msg = await response.text();
        toast.error(msg || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Loading your library...
          </p>
        </div>
      </div>
    );
  }

  const storedAuth =
    typeof window !== "undefined"
      ? localStorage.getItem("demo_jwt_auth")
      : null;
  if (!storedAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card/60 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
          <div className="h-2 bg-linear-to-r from-primary to-primary/60" />
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <HugeiconsIcon
                icon={Bookmark01Icon}
                className="w-8 h-8 text-primary"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Sign in to sync
              </h2>
              <p className="text-muted-foreground">
                Your watchlist is waiting! Log in to see the movies and shows
                you've saved.
              </p>
            </div>
            <Link href="/login" className="block">
              <Button className="w-full h-12 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300">
                Log In Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted/40 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-linear-to-b from-primary to-primary/60 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  My <span className="text-primary">Watchlist</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {items.map((item) => {
              if (!item.movie) return null;

              return (
                <div key={item.id} className="group relative">
                  {/* Movie Card Container */}
                  <Card className="h-fit bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 border-none py-0">
                    <Link
                      href={`/movies/${item.movie.id}`}
                      className="block relative h-[420px]"
                    >
                      <img
                        src={item.movie.cardUrl}
                        alt={item.movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      />

                      {/* Glass Overlay on Hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-end">
                        <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 drop-shadow-md">
                          {item.movie.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-200 mb-4">
                          <span>
                            {new Date(item.movie.releaseDate).getFullYear()}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span>{item.movie.durationMinutes} min</span>
                        </div>

                        <div className="flex gap-2">
                          <Dialog
                            open={activeReviewId === item.movie.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setActiveReviewId(null);
                                setUserRating(0);
                                setUserComment("");
                              }
                            }}
                          >
                            <Button 
                              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl gap-2 h-11"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveReviewId(item.movie.id);
                              }}
                            >
                              <HugeiconsIcon
                                icon={Comment01Icon}
                                className="w-5 h-5"
                              />
                              Review
                            </Button>
                            
                            <DialogContent 
                              className="bg-card/90 backdrop-blur-2xl border-border/60 text-foreground rounded-2xl max-w-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Review {item.movie.title}</DialogTitle>
                                <DialogDescription className="text-muted-foreground">How was your experience with this title?</DialogDescription>
                              </DialogHeader>

                              <form onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSubmitReview(item.movie.id, item.movie.title);
                              }} className="space-y-6 pt-4">
                                <div className="flex flex-col items-center gap-4 py-4 bg-muted/20 rounded-2xl border border-border/40">
                                  <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setUserRating(star)}
                                        className="transition-all duration-300 hover:scale-125 group"
                                      >
                                        <HugeiconsIcon
                                          icon={StarIcon}
                                          className={cn(
                                            "w-10 h-10 transition-colors",
                                            star <= userRating
                                              ? "text-yellow-500 fill-yellow-500"
                                              : "text-muted-foreground group-hover:text-yellow-500/50"
                                          )}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  {userRating > 0 && (
                                    <span className="text-lg font-bold text-yellow-500">
                                      {userRating}.0 / 5.0
                                    </span>
                                  )}
                                </div>

                                <Textarea
                                  placeholder="Write your comment..."
                                  value={userComment}
                                  onChange={(e) => setUserComment(e.target.value)}
                                  className="min-h-[100px] bg-background/50 border-border focus:ring-primary rounded-xl font-noto-sans-arabic"
                                />

                                <Button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="w-full h-12 bg-primary font-bold rounded-xl"
                                >
                                  {isSubmitting ? "Submitting..." : "Post Review"}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Link>

                    {/* Perfectly Aligned Top Controls */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                      {/* Date Added Badge */}
                      <div className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-full w-9 h-9 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto bg-red-500/80 backdrop-blur-md hover:bg-red-500 hover:scale-110 active:scale-95"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item.movie.id, item.movie.title);
                        }}
                        disabled={isRemoving === item.movie.id}
                      >
                        {isRemoving === item.movie.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="w-4 h-4 text-white"
                          />
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="w-24 h-24 bg-muted/40 rounded-3xl flex items-center justify-center">
              <HugeiconsIcon
                icon={Bookmark01Icon}
                className="w-12 h-12 text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Your watchlist is empty
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover your next favorite movie and click the "+" button to
                save it here.
              </p>
            </div>
            <Link href="/">
              <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 h-12 text-lg font-semibold gap-2">
                <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
                Browse Movies
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
