"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  StarIcon,
  UserIcon,
  Comment01Icon,
  ArrowRight01Icon,
  Calendar01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function LatestReviewsSection() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const response = await fetch(`${API_BASE}/reviews/latest?limit=6`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch latest reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviews();
  }, []);

  if (loading || (reviews.length === 0 && !loading)) return null;

  return (
    <section className="py-20 px-4 md:px-8 lg:px-12 bg-muted/20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              What People are <span className="text-primary">Saying</span>
            </h2>
          </div>

          <Link href="/search" className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            Browse All Movies
            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="bg-card/40 backdrop-blur-md border-border/50 overflow-hidden rounded-3xl transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group py-0"
            >
              <CardContent className="p-0">
                {/* Movie Header */}
                <Link href={`/movies/${review.movieId}`} className="block relative h-40 overflow-hidden group/header">
                  <img
                    src={review.moviePosterUrl}
                    alt={review.movieTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/header:scale-102"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1 drop-shadow-md transition-colors group-hover/header:text-primary">
                      {review.movieTitle}
                    </h3>
                  </div>
                </Link>

                <div className="p-6 space-y-6">
                  {/* User & Rating Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground tracking-tight">{review.userName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <HugeiconsIcon icon={Calendar01Icon} className="w-3 h-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                      <HugeiconsIcon icon={StarIcon} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-black text-yellow-500">{review.rating}.0</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="relative">
                    <p className="text-muted-foreground text-sm font-noto-sans-arabic leading-relaxed line-clamp-3 italic opacity-90 transition-opacity group-hover:opacity-100">
                      "{review.comment || "Great movie! Highly recommended for everyone."}"
                    </p>
                  </div>

                  {/* Action */}
                  <Link href={`/movies/${review.movieId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Read more
                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
