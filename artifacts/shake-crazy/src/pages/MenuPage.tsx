import { useState, useMemo } from "react";
import { useGetMenuItems } from "@workspace/api-client-react";
import { Leaf, Flame, ArrowLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type DietFilter = "all" | "veg" | "nonveg";

export default function MenuPage() {
  const { data: menuItems, isLoading } = useGetMenuItems();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [dietFilter, setDietFilter] = useState<DietFilter>("all");

  const categories = useMemo(() => {
    if (!menuItems) return ["All"];
    const cats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  const displayedItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item => {
      if (!item.isAvailable) return false;
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (dietFilter === "veg" && !item.isVeg) return false;
      if (dietFilter === "nonveg" && item.isVeg) return false;
      return true;
    });
  }, [menuItems, activeCategory, dietFilter]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Header */}
        <div className="pt-28 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)"
          }} />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6 font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-6xl md:text-8xl text-white mb-4">Our Menu</h1>
            <p className="text-xl text-primary-foreground/70 font-medium">
              {displayedItems.length} items • Fresh every day
            </p>
          </div>
        </div>

        <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Veg / Non-Veg Toggle */}
            <div className="flex gap-2">
              {(["all", "veg", "nonveg"] as DietFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setDietFilter(f)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 border-2 ${
                    dietFilter === f
                      ? f === "veg"
                        ? "bg-green-600 border-green-600 text-white"
                        : f === "nonveg"
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-foreground border-foreground text-background"
                      : "bg-transparent border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {f === "veg" && (
                    <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                  )}
                  {f === "nonveg" && (
                    <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                  )}
                  {f === "all" ? "All" : f === "veg" ? "Veg" : "Non-Veg"}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-secondary text-secondary-foreground shadow-md scale-105"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-card rounded-3xl p-5 shadow-sm border border-border">
                  <Skeleton className="w-full h-44 rounded-2xl mb-4" />
                  <Skeleton className="w-3/4 h-5 mb-2" />
                  <Skeleton className="w-1/2 h-4 mb-4" />
                  <Skeleton className="w-1/4 h-7" />
                </div>
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🍽️</p>
              <p className="text-2xl font-bold text-foreground mb-2">No items found</p>
              <p className="text-muted-foreground font-medium">Try changing your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card rounded-3xl overflow-hidden shadow-md border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {item.imageUrl ? (
                    <div className="w-full h-44 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      {item.category === "Must Try" && (
                        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Must Try
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted/50 flex items-center justify-center relative">
                      <span className="font-display text-3xl text-border/60">SC</span>
                      {item.category === "Must Try" && (
                        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Must Try
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {item.isVeg ? (
                        <div className="flex items-center justify-center w-5 h-5 border-2 border-green-600 rounded-sm flex-shrink-0">
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-5 h-5 border-2 border-red-600 rounded-sm flex-shrink-0">
                          <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                        </div>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors leading-tight">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground font-medium mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <span className="text-2xl font-display text-foreground">₹{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
