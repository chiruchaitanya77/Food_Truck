import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const compRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      });
      gsap.from(".hero-truck", {
        x: 200,
        opacity: 0,
        duration: 1.5,
        delay: 0.4,
        ease: "elastic.out(1, 0.7)",
      });
      gsap.to(".floating-shape", {
        y: -20,
        rotation: 10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });
    }, compRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={compRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/food-pattern.png)`,
          backgroundSize: '400px'
        }}
      />

      {/* Shimmer Layer */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-white/20 to-transparent animate-[shimmer_4s_linear_infinite]" />
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-10 w-16 h-16 bg-secondary/30 rounded-full blur-xl floating-shape" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl floating-shape" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground font-semibold mb-6 hero-text">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Serving happiness on the go!
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-foreground leading-[0.9] mb-6 hero-text drop-shadow-sm">
              GET <span className="text-primary inline-block transform -rotate-2">CRAZY</span><br />
              WITH EVERY <span className="text-secondary inline-block transform rotate-2">BITE!</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-10 max-w-lg mx-auto lg:mx-0 hero-text">
              Experience the best street food in town. From monstrous burgers to overloaded shakes, we're bringing the flavor revolution to your neighborhood.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start hero-text">
              <a href="/menu">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform group">
                  Explore Menu
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="#challenge">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl border-2 border-border hover:border-secondary hover:bg-secondary/10 transition-colors">
                  Take the 10s Challenge
                </Button>
              </a>
            </div>
          </div>

          <div className="relative hero-truck perspective-1000 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl transform scale-75 -z-10" />
            <img
              src={`${import.meta.env.BASE_URL}images/hero-truck.png`}
              alt="Shake Crazy Food Truck"
              className="w-full h-auto drop-shadow-2xl transform scale-150 rotate-y-[-10deg] rotate-x-[5deg]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
