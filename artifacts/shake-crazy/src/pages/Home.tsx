import { useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { MenuSection } from "@/components/sections/MenuSection";
import { StopwatchSection } from "@/components/sections/StopwatchSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { GallerySection } from "@/components/sections/GallerySection";
import {useGetActiveDiscounts, useTrackVisit} from "@workspace/api-client-react";
import { requestGeoLocation } from "@/hooks/useGeoLocation";
import { getApiUrl } from "@/lib/api";
import {CameraIcon, Plus, Tag} from "lucide-react";
import {TbCameraSpark} from "react-icons/tb";

export default function Home() {
  const { data: discounts } = useGetActiveDiscounts();
    const trackVisitMutation = useTrackVisit();

    useEffect(() => {
        Promise.race([
            requestGeoLocation(),
            new Promise<null>((res) => setTimeout(() => res(null), 2500)),
        ]).then((geo) => {
            trackVisitMutation.mutate({
                data: {
                    page: "/",
                    userAgent: navigator.userAgent,
                    latitude: geo?.latitude ?? null,
                    longitude: geo?.longitude ?? null,
                },
            });
        });
    }, []);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {discounts && discounts.length > 0 && (
          <div className="bg-secondary text-secondary-foreground py-3 pt-24 px-4 text-center font-bold tracking-wide flex justify-center items-center gap-3">
            <Tag className="w-5 h-5 animate-bounce" />
            {discounts[0].name} - GET {discounts[0].discountPercentage}% OFF TODAY!
          </div>
        )}

        <main className="flex-grow">
          {/*<Hero />*/}
            <Hero hasDiscount={!!(discounts && discounts.length > 0)} />
          <MenuSection />
          <StopwatchSection />
          <LocationSection />
          <GallerySection />
        </main>
          <div className="fixed bottom-6 right-6 z-[9999] group">
              <button
                  id="fab-btn"
                  onClick={() => {
                      console.log("Photo Clicked");

                      const el = document.getElementById("gallery");
                      if (el) {
                          const yOffset = -80;
                          const y =
                              el.getBoundingClientRect().top + window.pageYOffset + yOffset;

                          window.scrollTo({ top: y, behavior: "smooth" });
                      }

                      const btn = document.getElementById("fab-btn");
                      btn?.classList.add("animate-click");

                      const flash = document.getElementById("camera-flash");
                      flash?.classList.add("opacity-80");

                      setTimeout(() => {
                          btn?.classList.remove("animate-click");
                          flash?.classList.remove("opacity-80");
                      }, 300);
                  }}
                  className="bg-linear-to-br from-yellow-300 via-yellow-500/80 to-yellow-600/80
               text-black p-4 rounded-full
               shadow-[0_10px_30px_rgba(255,200,0,0.7)]
               hover:scale-110 hover:shadow-[0_12px_35px_rgba(255,200,0,0.9)]
               active:scale-95
               transition-all duration-200"
              >
                  <TbCameraSpark className="w-8 h-8" />
              </button>

              {/* Tooltip */}
              <div
                  className="absolute bottom-16 right-0 whitespace-nowrap
               bg-black text-white text-sm px-3 py-1.5 rounded-lg shadow-lg
               opacity-0 group-hover:opacity-100
               translate-y-2 group-hover:translate-y-0
               transition-all duration-200"
              >
                  Share your experience
              </div>
          </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
