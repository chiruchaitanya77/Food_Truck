import { useGetTruckLocation } from "@workspace/api-client-react";
import { MapPin, Navigation2, Clock, Truck, Wifi, WifiOff, ExternalLink, Map } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function LocationSection() {
  const { data: location, isLoading, dataUpdatedAt } = useGetTruckLocation();

  const hasCoords = location?.latitude && location?.longitude;

  const googleMapsUrl = hasCoords
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent(location?.currentLocation || "Food Truck")}`;

  const mapEmbedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`
    : location?.currentLocation
    ? `https://maps.google.com/maps?q=${encodeURIComponent(location.currentLocation)}&z=14&output=embed`
    : null;

  const updatedAt = location?.updatedAt ? new Date(location.updatedAt) : null;
  const minutesAgo = updatedAt ? (Date.now() - updatedAt.getTime()) / 60000 : null;
  const isLive = minutesAgo !== null && minutesAgo < 60;

  if (isLoading) return (
    <section id="location" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-2xl w-64 mx-auto" />
          <div className="h-[400px] bg-muted rounded-3xl" />
        </div>
      </div>
    </section>
  );

  return (
    <section id="location" className="py-24 bg-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              <Truck className="w-4 h-4" /> Live Truck Tracker
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-foreground">Find The Truck</h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 text-green-600 font-bold text-sm border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live — Updated {minutesAgo && minutesAgo < 1 ? "just now" : `${Math.round(minutesAgo!)}m ago`}
              </span>
            ) : updatedAt ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                <Clock className="w-3.5 h-3.5" />
                Last seen {formatDistanceToNow(updatedAt, { addSuffix: true })}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                <WifiOff className="w-3.5 h-3.5" /> Location not shared yet
              </span>
            )}
            {updatedAt && (
              <span className="text-xs text-muted-foreground font-medium">
                {format(updatedAt, "EEEE, MMM d 'at' h:mm a")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Info Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Current Location Card */}
            <div className="bg-background rounded-3xl p-6 shadow-lg border border-border flex-1">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Currently Parked At</p>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {location?.currentLocation || "Updating location..."}
                  </h3>
                </div>
              </div>

              {hasCoords && (
                <div className="bg-muted/50 rounded-2xl px-4 py-3 mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">GPS Coordinates</p>
                  <p className="font-mono text-sm text-foreground font-medium">
                    {location.latitude!.toFixed(5)}, {location.longitude!.toFixed(5)}
                  </p>
                </div>
              )}

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-13 py-3.5 px-6 text-base font-bold bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
              >
                <Navigation2 className="w-5 h-5" />
                Get Directions
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>

            {/* Hours / Tips */}
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl p-6 border border-secondary/20">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-secondary" />
                <h4 className="font-bold text-foreground">Typical Hours</h4>
              </div>
              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mon – Fri</span>
                  <span className="text-foreground font-bold">11 AM – 10 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sat – Sun</span>
                  <span className="text-foreground font-bold">10 AM – 11 PM</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium italic">
                * Hours may vary. Follow us @shakecrazyofficial for real-time updates.
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 bg-background rounded-3xl overflow-hidden shadow-2xl border border-border min-h-[320px] relative">
            {mapEmbedUrl ? (
                <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: 320 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-muted/50 to-muted">
                  <Map className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">Map loading...</p>
                  <p className="text-sm text-muted-foreground/70 font-medium mt-1">Location will appear here when the truck checks in</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
