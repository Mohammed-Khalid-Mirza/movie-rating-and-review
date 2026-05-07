import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PlusSignIcon,
  CheckmarkCircle01Icon,
  StarIcon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
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

interface MovieCardProps {
  id: number;
  title: string;
  cardUrl: string;
  description: string;
  releaseDate: string;
}

export default function MovieCard({
  id,
  title,
  cardUrl,
  description,
  releaseDate,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Review states
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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
          const found = items.some((item: any) => item.movie.id === id);
          setIsInWatchlist(found);
        }
      } catch (error) {
        console.error("Failed to check watchlist:", error);
      }
    };

    checkWatchlist();
  }, [id, API_BASE]);

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      const response = await fetch(`${API_BASE}/watchlist/${id}`, {
        method: "POST",
        headers: {
          Authorization: storedAuth,
        },
      });

      if (response.ok) {
        setIsInWatchlist(true);
        toast.success(`"${title}" added to watchlist!`);
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
    e.stopPropagation();

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
      const response = await fetch(`${API_BASE}/reviews/movie/${id}`, {
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
      } else if (response.status === 409) {
        toast.info("You have already reviewed this movie");
        setIsReviewModalOpen(false);
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

  return (
    <Link href={`/movies/${id}`}>
      <div
        className="relative h-96 rounded-lg overflow-hidden bg-card border border-border cursor-pointer group shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Poster Image */}
        <img
          src={cardUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform ease-in-out duration-300"
        />

        {/* Overlay - Always visible */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content - Show on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-4 bg-linear-to-t from-black/95 via-black/60 to-transparent">
            {/* Title */}
            <h3 className="text-white  font-bold text-sm md:text-base mb-2 line-clamp-2 drop-shadow-lg">
              {title}
            </h3>

            {/* Description */}
            <p className="text-white text-xs line-clamp-2 mb-3 drop-shadow">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Dialog
                open={isReviewModalOpen}
                onOpenChange={setIsReviewModalOpen}
              >
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1 flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsReviewModalOpen(true);
                  }}
                >
                  <HugeiconsIcon icon={Comment01Icon} className="w-4 h-4" />
                  Review
                </Button>
                <DialogContent
                  className="bg-card/90 backdrop-blur-2xl border-border/60 text-foreground rounded-2xl max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Review {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      How was your experience with this title?
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={handleSubmitReview}
                    className="space-y-6 pt-4"
                  >
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
                                  : "text-muted-foreground group-hover:text-yellow-500/50",
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

              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "border-border transition-all duration-300 gap-1",
                  isInWatchlist
                    ? "bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={handleAddToWatchlist}
                disabled={isAdding}
              >
                <HugeiconsIcon
                  icon={isInWatchlist ? CheckmarkCircle01Icon : PlusSignIcon}
                  className="w-4 h-4"
                />
              </Button>
            </div>
          </div>
        )}

        {/* Badge - Release Year (top right, always visible) */}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {new Date(releaseDate).getFullYear()}
        </div>
      </div>
    </Link>
  );
}
