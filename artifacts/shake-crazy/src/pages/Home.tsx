import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { MenuSection } from "@/components/sections/MenuSection";
import { StopwatchSection } from "@/components/sections/StopwatchSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { useTrackVisit, useGetActiveDiscounts } from "@workspace/api-client-react";
import { Tag } from "lucide-react";

export default function Home() {
  const trackVisit = useTrackVisit();
  const { data: discounts } = useGetActiveDiscounts();

  useEffect(() => {
    try {
      trackVisit.mutate({ data: { visitorIp: "guest", page: "/" } });
    } catch {
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {discounts && discounts.length > 0 && (
        <div className="bg-secondary text-secondary-foreground py-3 pt-24 px-4 text-center font-bold tracking-wide flex justify-center items-center gap-3">
          <Tag className="w-5 h-5 animate-bounce" />
          {discounts[0].name} - GET {discounts[0].discountPercentage}% OFF TODAY!
        </div>
      )}

      <main className="flex-grow">
        <Hero />
        <MenuSection />
        <StopwatchSection />
        <LocationSection />
        <GallerySection />
      </main>

      <Footer />
    </div>
  );
}
