"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  StarIcon,
  UserIcon,
  Film01Icon,
  Calendar01Icon,
  Comment01Icon,
  ArrowLeft02Icon
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReviewSummary {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string;
  userName: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function AdminCommentsPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const storedAuth = localStorage.getItem("demo_jwt_auth");
      const response = await fetch(`${API_BASE}/reviews/latest?limit=50`, {
        headers: { Authorization: storedAuth ?? "" },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(reviewId);
    try {
      const storedAuth = localStorage.getItem("demo_jwt_auth");
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: storedAuth ?? "" },
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading moderation panel...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Link href="/admins" className="hover:underline flex items-center gap-1 text-sm font-medium">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl flex items-center gap-3">
            <HugeiconsIcon icon={Comment01Icon} className="w-10 h-10 text-primary" />
            Moderate <span className="text-primary">Comments</span>
          </h1>
          <p className="text-muted-foreground">
            Review, manage and moderate user feedback across all content.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Showing the latest {reviews.length} reviews from your users.</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/20">
              {reviews.length} Total
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="w-[200px] font-bold">User</TableHead>
                  <TableHead className="w-[250px] font-bold">Movie</TableHead>
                  <TableHead className="font-bold">Comment & Rating</TableHead>
                  <TableHead className="w-[150px] font-bold">Date</TableHead>
                  <TableHead className="w-[100px] text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review.id} className="group border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">{review.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/movies/${review.movieId}`} className="flex items-center gap-3 hover:text-primary transition-colors group/movie">
                          <div className="h-12 w-8 overflow-hidden rounded shadow-md border border-border/40">
                            <img src={review.moviePosterUrl} alt="" className="h-full w-full object-cover transition-transform group-hover/movie:scale-110" />
                          </div>
                          <span className="font-medium line-clamp-1">{review.movieTitle}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <HugeiconsIcon 
                                key={star} 
                                icon={StarIcon} 
                                className={cn(
                                  "h-3.5 w-3.5",
                                  star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                )} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 italic font-noto-sans-arabic">
                            {review.comment ? `"${review.comment}"` : <span className="opacity-50">No comment provided</span>}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => handleDelete(review.id)}
                          disabled={isDeleting === review.id}
                        >
                          {isDeleting === review.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <HugeiconsIcon icon={Comment01Icon} className="h-12 w-12 text-muted-foreground/20" />
                        <p className="text-muted-foreground italic">No comments found to moderate.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
