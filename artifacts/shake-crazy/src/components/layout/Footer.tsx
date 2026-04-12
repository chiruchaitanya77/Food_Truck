import { Instagram, MapPin, Mail, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { useGetAnalyticsCount } from "@workspace/api-client-react";

export function Footer() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;

  // const { data: countData } = useQuery({
  //   queryKey: ["/api/analytics/count"],
  //   queryFn: async () => {
  //     const res = await fetch(getApiUrl("/api/analytics/count"));
  //     if (!res.ok) return null;
  //     return res.json();
  //   },
  //   staleTime: 60_000,
  // });


  const { data: countData } = useGetAnalyticsCount();

  return (
    <footer className="bg-foreground text-background py-16 overflow-hidden relative">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center -rotate-6 shadow-lg shadow-primary/30">
              <span className="text-white font-display text-2xl pt-1">SC</span>
            </div>
            <span className="font-display text-4xl text-white tracking-widest">Shake Crazy</span>
          </div>
          <p className="text-background/70 font-medium mb-6">
            Serving happiness on the go. The craziest shakes, juiciest burgers, and loaded pizzas in town!
          </p>
          <div className="flex gap-4 mb-6">
            <a href="https://instagram.com/shakecrazyofficial" target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1 duration-200">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="mailto:contact@shakecrazy.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors hover:-translate-y-1 hover:text-foreground duration-200">
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Visitor counter */}
          {countData?.totalVisits > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white">
                {countData.totalVisits.toLocaleString()} happy visitors
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-2xl mb-6 text-secondary tracking-wide">Quick Links</h3>
          <ul className="space-y-3 font-medium text-background/80">
            <li><a href="#menu" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Our Menu</a></li>
            <li><a href="#challenge" className="hover:text-white hover:translate-x-1 inline-block transition-transform">10s Challenge</a></li>
            <li><a href="#gallery" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Love Gallery</a></li>
            <li><a href="#location" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Find the Truck</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-2xl mb-6 text-primary tracking-wide">Visit Us</h3>
          <div className="flex items-start gap-3 text-background/80 font-medium">
            <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
            <p>
              We're always on the move! Check our live location tracker above to find where we're serving happiness today.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-center text-background/50 font-medium text-sm">
        <p>© {new Date().getFullYear()} Shake Crazy Food Truck. All rights reserved.</p>
      </div>
    </footer>
  );
}
