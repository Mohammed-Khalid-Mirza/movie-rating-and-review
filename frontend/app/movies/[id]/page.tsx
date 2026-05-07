"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft02Icon,
  PlayCircleIcon,
  Clock01Icon,
  PlusSignIcon,
  CheckmarkCircle01Icon,
  StarIcon,
  UserIcon,
  Comment01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Movie {
  id: number;
  title: string;
  description: string;
  cardUrl: string;
  backdropUrl: string;
  releaseDate: string;
  durationMinutes: number;
  genres?: {
    id: number;
    name: string;
  }[];
  type?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const movieId = params.id as string;

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews/movie/${movieId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    const checkWatchlist = async () => {
      const storedAuth = localStorage.getItem("demo_jwt_auth");
      if (!storedAuth) return;

      try {
        const response = await fetch(`${API_BASE}/watchlist/me`, {
          headers: { Authorization: storedAuth },
        });
        if (response.ok) {
          const items = await response.json();
          const found = items.some(
            (item: any) => item.movie.id === Number(movieId),
          );
          setIsInWatchlist(found);
        }
      } catch (error) {
        console.error("Failed to check watchlist:", error);
      }
    };

    checkWatchlist();
    fetchReviews();
  }, [movieId]);

  const handleAddToWatchlist = async () => {
    const storedAuth = localStorage.getItem("demo_jwt_auth");
    if (!storedAuth) {
      toast.error("Please login to add movies to your watchlist");
      return;
    }

    if (isInWatchlist) {
      toast.info("Movie already in your watchlist");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`${API_BASE}/watchlist/${movieId}`, {
        method: "POST",
        headers: {
          Authorization: storedAuth,
        },
      });

      if (response.ok) {
        setIsInWatchlist(true);
        toast.success(`"${movie?.title}" added to watchlist!`);
      } else if (response.status === 409) {
        setIsInWatchlist(true);
        toast.info("Already in your watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setIsReviewModalOpen(false);
        fetchReviews(); // Refresh reviews
      } else if (response.status === 409) {
        toast.info("You have already reviewed this movie");
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

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`${API_BASE}/movies/${movieId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch movie");
        }
        const data = (await response.json()) as Movie;
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted flex items-center justify-center">
        <div className="text-foreground text-xl animate-pulse">
          Loading movie details...
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted flex items-center justify-center">
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error || "Movie not found"}</p>
            <Link href="/">
              <Button className="w-full" variant="outline">
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  className="w-4 h-4 mr-2"
                />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted/40">
      {/* Hero Section with Background */}
      <div
        className="relative w-full h-100 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${movie.backdropUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="bg-background/25 border-border text-foreground hover:bg-background/40 backdrop-blur-md transition-all duration-300"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Poster */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={movie.cardUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>

          {/* Right Column: Details & Reviews */}
          <div className="md:col-span-2 space-y-12">
            {/* Movie Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                    {movie.title}
                  </h1>
                </div>
                {movie.type && (
                  <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">
                      {movie.type}
                    </span>
                  </div>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 text-foreground/80">
                {movie.releaseDate && (
                  <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50">
                    <HugeiconsIcon
                      icon={Calendar01Icon}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-medium">
                      {new Date(movie.releaseDate).getFullYear()}
                    </span>
                  </div>
                )}
                {movie.durationMinutes && (
                  <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50">
                    <HugeiconsIcon
                      icon={Clock01Icon}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-medium">
                      {movie.durationMinutes} min
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  {movie.genres &&
                    movie.genres.map((g) => (
                      <div
                        key={g.id}
                        className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl"
                      >
                        <span className="font-bold font-noto-sans-arabic text-sm">
                          {g.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Overview</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-noto-sans-arabic max-w-2xl">
                  {movie.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Dialog
                  open={isReviewModalOpen}
                  onOpenChange={setIsReviewModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl gap-2 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="w-6 h-6" />
                      add review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 text-foreground rounded-2xl max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        Rate this movie
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Share your cinematic experience with the community.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleSubmitReview}
                      className="space-y-6 pt-4"
                    >
                      {/* Star Rating */}
                      <div className="flex flex-col items-center gap-4 py-4 bg-muted/20 rounded-2xl border border-border/40">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                          Select Rating
                        </span>
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
                                    ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                                    : "text-muted-foreground group-hover:text-yellow-500/50",
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        {userRating > 0 && (
                          <span className="text-xl font-bold text-yellow-500 animate-in fade-in zoom-in duration-300">
                            {userRating === 5
                              ? "Amazing!"
                              : userRating === 4
                                ? "Great!"
                                : userRating === 3
                                  ? "Good"
                                  : userRating === 2
                                    ? "Meh"
                                    : "Bad"}
                          </span>
                        )}
                      </div>

                      {/* Comment */}
                      <div className="space-y-3">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                          Your Thoughts
                        </span>
                        <Textarea
                          placeholder="What did you think of the story, acting, and visuals?"
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          className="min-h-[150px] bg-background/50 border-border/60 focus:ring-primary rounded-xl text-lg font-noto-sans-arabic"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary text-lg font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:bg-primary/90"
                      >
                        {isSubmitting ? "Submitting..." : "Post My Review"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "h-14 px-8 border-border font-bold rounded-xl gap-2 transition-all duration-300 hover:scale-105 active:scale-95",
                    isInWatchlist
                      ? "bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20"
                      : "text-foreground bg-card/40 backdrop-blur-md hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={handleAddToWatchlist}
                  disabled={isAdding}
                >
                  <HugeiconsIcon
                    icon={isInWatchlist ? CheckmarkCircle01Icon : PlusSignIcon}
                    className="w-6 h-6"
                  />
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-16 border-t border-border/40 space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    <HugeiconsIcon
                      icon={Comment01Icon}
                      className="w-3.5 h-3.5"
                    />
                    Community Reviews
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">
                    Latest <span className="text-primary">Activity</span>
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    See what other viewers are saying about this movie.
                  </p>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-4 bg-card/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-border/40">
                    <div className="text-center px-4 border-r border-border/40">
                      <div className="text-2xl font-bold text-foreground">
                        {reviews.length}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Total Reviews
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-yellow-500 flex items-center gap-1.5">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="w-5 h-5 fill-yellow-500"
                        />
                        {(
                          reviews.reduce((acc, r) => acc + r.rating, 0) /
                          reviews.length
                        ).toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Avg Rating
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {reviews.length > 0 ? (
                  reviews.slice(0, 6).map((review) => (
                    <Card
                      key={review.id}
                      className="group bg-card/20 backdrop-blur-md border-border/40 transition-all duration-300 hover:bg-card/40 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 rounded-2xl overflow-hidden py-0"
                    >
                      <CardContent className="p-6 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 transition-transform ">
                                <HugeiconsIcon
                                  icon={UserIcon}
                                  className="w-6 h-6 text-primary"
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground text-lg tracking-tight">
                                {review.user.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <HugeiconsIcon
                                  icon={Calendar01Icon}
                                  className="w-3.5 h-3.5"
                                />
                                {new Date(review.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20  transition-transform">
                            <HugeiconsIcon
                              icon={StarIcon}
                              className="w-4 h-4 text-yellow-500 fill-yellow-500"
                            />
                            <span className="text-sm font-bold text-yellow-500">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-2 top-0 text-4xl text-primary/10 font-serif leading-none">
                            "
                          </div>
                          <p className="text-muted-foreground/90 text-sm leading-relaxed font-noto-sans-arabic italic px-2">
                            {review.comment ||
                              "The user didn't leave a detailed comment, but their rating speaks for itself."}
                          </p>
                          <div className="absolute -right-2 bottom-0 text-4xl text-primary/10 font-serif leading-none rotate-180">
                            "
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-card/10 backdrop-blur-sm rounded-3xl border border-dashed border-border/60">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HugeiconsIcon
                        icon={StarIcon}
                        className="w-10 h-10 text-muted-foreground/40 opacity-20"
                      />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2">
                      No reviews yet
                    </h4>
                    <p className="text-muted-foreground italic max-w-xs mx-auto">
                      Be the first to share your opinion and help the community!
                    </p>
                    <Button
                      variant="link"
                      className="mt-4 text-primary font-bold"
                      onClick={() => setIsReviewModalOpen(true)}
                    >
                      Write the first review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
