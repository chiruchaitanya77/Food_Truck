import { useGetTruckLocation } from "@workspace/api-client-react";
import { MapPin, Navigation2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function LocationSection() {
  const { data: location, isLoading } = useGetTruckLocation();

  if (isLoading) return null;

  return (
    <section id="location" className="py-24 bg-card relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-5xl text-foreground mb-4">Find The Truck</h2>
        <div className="w-24 h-2 bg-primary mx-auto rounded-full mb-12 transform rotate-1" />

        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5 border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-primary animate-bounce" />
          </div>
          
          <h3 className="text-3xl font-bold text-foreground mb-2">We are currently at:</h3>
          <p className="text-2xl text-secondary font-display tracking-wider mb-8">
            {location?.currentLocation || "Location updating..."}
          </p>

          {location?.updatedAt && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium mb-8">
              <Clock className="w-4 h-4" />
              Updated {formatDistanceToNow(new Date(location.updatedAt), { addSuffix: true })}
            </div>
          )}

          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(location?.currentLocation || 'Food Truck')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-14 px-8 text-lg font-bold bg-foreground text-background rounded-xl hover:scale-105 transition-transform hover:shadow-xl shadow-black/10"
          >
            <Navigation2 className="w-5 h-5 mr-2" />
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
