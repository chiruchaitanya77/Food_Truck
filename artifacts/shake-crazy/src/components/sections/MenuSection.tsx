import { useMemo } from "react";
import { useGetMenuItems } from "@workspace/api-client-react";
import { Flame, ChevronRight, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function MenuSection() {
  const { data: menuItems, isLoading } = useGetMenuItems();

  const specials = useMemo(() => {
    if (!menuItems) return [];
    const mustTry = menuItems.filter(i => i.isAvailable && i.category === "Must Try");
    if (mustTry.length >= 4) return mustTry.slice(0, 6);
    const rest = menuItems.filter(i => i.isAvailable && i.category !== "Must Try");
    return [...mustTry, ...rest].slice(0, 6);
  }, [menuItems]);

  return (
    <section id="menu" className="py-24 bg-card relative z-10 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-sm mb-4">
              <Flame className="w-4 h-4" /> Fan Favorites & Specials
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-2">Must Try Items</h2>
            <p className="text-lg text-muted-foreground font-medium">Our most-loved items that keep people coming back.</p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background font-bold text-base hover:bg-foreground/90 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
          >
            Full Menu <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-background rounded-3xl p-6 shadow-sm border border-border">
                <Skeleton className="w-full h-52 rounded-2xl mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-4" />
                <Skeleton className="w-1/4 h-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specials.map((item, idx) => (
              <div
                key={item.id}
                className="group bg-background rounded-3xl overflow-hidden shadow-lg border border-border hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {item.imageUrl ? (
                  <div className="w-full h-52 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" /> #{idx + 1} Favorite
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="text-2xl font-display text-white drop-shadow-lg">₹{item.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                    <span className="font-display text-4xl text-border/40">SHAKE CRAZY</span>
                    <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3" /> #{idx + 1} Favorite
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {item.isVeg ? (
                      <div className="flex items-center justify-center w-5 h-5 border-2 border-green-600 rounded-sm">
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-5 h-5 border-2 border-red-600 rounded-sm">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                      </div>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {!item.imageUrl && (
                    <span className="text-2xl font-display text-foreground mt-3 block">₹{item.price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-muted-foreground font-medium mb-5">
            Craving something else? We've got loads more.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Explore Full Menu <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
