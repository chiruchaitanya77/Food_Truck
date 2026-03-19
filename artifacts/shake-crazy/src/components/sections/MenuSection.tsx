import { useState, useMemo } from "react";
import { useGetMenuItems } from "@workspace/api-client-react";
import { Leaf, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MenuSection() {
  const { data: menuItems, isLoading } = useGetMenuItems();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    if (!menuItems) return ["All"];
    const cats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  const displayedItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item => 
      item.isAvailable && (activeCategory === "All" || item.category === activeCategory)
    );
  }, [menuItems, activeCategory]);

  return (
    <section id="menu" className="py-24 bg-card relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-foreground mb-4">Our Crazy Menu</h2>
          <div className="w-24 h-2 bg-secondary mx-auto rounded-full mb-8 transform -rotate-2" />
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-foreground text-background shadow-lg scale-105"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-background rounded-3xl p-6 shadow-sm border border-border">
                <Skeleton className="w-full h-48 rounded-2xl mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-4" />
                <Skeleton className="w-1/4 h-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedItems.map((item) => (
              <div 
                key={item.id}
                className="tilt-card group bg-background rounded-3xl p-6 shadow-lg shadow-black/5 border border-border hover:border-primary/30 relative overflow-hidden"
              >
                <div className="tilt-card-content">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
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
                      <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    {item.category === 'Must Try' && (
                      <Flame className="text-accent w-6 h-6 animate-bounce" />
                    )}
                  </div>
                  
                  {item.imageUrl ? (
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 relative">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-2xl bg-muted/50 mb-4 flex items-center justify-center">
                      <span className="font-display text-4xl text-border opacity-50">SHAKE CRAZY</span>
                    </div>
                  )}

                  <p className="text-muted-foreground font-medium mb-6 line-clamp-2">
                    {item.description || "Incredibly delicious."}
                  </p>

                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-3xl font-display text-foreground">₹{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
