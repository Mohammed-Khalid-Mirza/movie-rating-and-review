"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Comment01Icon,
  StarIcon,
  Delete02Icon,
  ArrowLeft02Icon,
  PlayCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  cardUrl: string;
  releaseDate: string;
  durationMinutes: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  movie: Movie;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function MyCommentsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchMyReviews = async () => {
    const storedAuth = localStorage.getItem("demo_jwt_auth");
    if (!storedAuth) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reviews/me`, {
        headers: { Authorization: storedAuth },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load your comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(reviewId);
    try {
      const storedAuth = localStorage.getItem("demo_jwt_auth");
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: storedAuth || "" },
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success("Comment deleted successfully");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Loading your activity...
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
        <Card className="max-w-md w-full bg-card/60 backdrop-blur-xl border-border shadow-2xl overflow-hidden text-center">
          <div className="h-2 bg-linear-to-r from-primary to-primary/60" />
          <div className="p-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <HugeiconsIcon icon={Comment01Icon} className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                View your contributions
              </h2>
              <p className="text-muted-foreground">
                Sign in to see and manage the reviews you've shared with the
                community.
              </p>
            </div>
            <Link href="/login" className="block">
              <Button className="w-full h-12 text-lg font-semibold rounded-xl">
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-linear-to-b from-primary to-primary/60 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                My <span className="text-primary">Comments</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-4 max-w-xl">
              You've shared {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}. Thank you for
              contributing to the community!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="bg-card/40 backdrop-blur-md border-border/60 overflow-hidden rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group py-0"
              >
                {/* Poster Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={review.movie.cardUrl}
                    alt={review.movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20">
                    <HugeiconsIcon
                      icon={StarIcon}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-sm font-bold text-yellow-500">
                      {review.rating}
                    </span>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link
                      href={`/movies/${review.movie.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="text-lg font-bold  line-clamp-1 drop-shadow-md">
                        {review.movie.title}
                      </h3>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(review.movie.releaseDate).getFullYear()}
                      </span>
                      <span className="w-1 h-1 bg-primary/40 rounded-full" />
                      <span>{review.movie.durationMinutes} min</span>
                    </div>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <div className="relative min-h-[80px]">
                    <p className="text-muted-foreground text-sm font-noto-sans-arabic leading-relaxed line-clamp-4 italic">
                      "{review.comment || "No written feedback provided."}"
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Link href={`/movies/${review.movie.id}`}>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-primary text-xs font-bold hover:no-underline"
                      >
                        View Movie
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => handleDelete(review.id)}
                      disabled={isDeleting === review.id}
                    >
                      {isDeleting === review.id ? (
                        <div className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="w-4 h-4"
                        />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
            <div className="w-20 h-20 bg-muted/40 rounded-2xl flex items-center justify-center text-muted-foreground">
              <HugeiconsIcon icon={Comment01Icon} className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                No reviews yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your cinematic opinions will appear here. Start by sharing what
                you think of your favorite movies!
              </p>
            </div>
            <Link href="/">
              <Button className="rounded-xl px-8 h-12 font-semibold gap-2">
                <HugeiconsIcon icon={PlayCircleIcon} className="w-5 h-5" />
                Browse Movies
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
