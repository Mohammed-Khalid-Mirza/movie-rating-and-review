import HeroSlider from "@/components/hero-slider";
import RecentMoviesSection from "@/components/recent-movies-section";
import LatestReviewsSection from "@/components/latest-reviews-section";

export default function Home() {
  return (
    <main className="w-full bg-background">
      <HeroSlider />
      <RecentMoviesSection />
      <LatestReviewsSection />
    </main>
  );
}
