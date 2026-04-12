import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetTruckLocation, useAdminUpdateLocation } from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {MapPin, Navigation, Loader2, ExternalLink, Clock, Map} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const locationSchema = z.object({
  currentLocation: z.string().min(1, "Location name required"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
});

type LocationForm = z.infer<typeof locationSchema>;

interface GeoResult {
  city: string;
  town: string;
  village: string;
  suburb: string;
  county: string;
  state: string;
  country: string;
  displayName: string;
  road?: string;
  neighbourhood?: string;
}

export default function LocationManager() {
  const queryClient = useQueryClient();
  const { data: locationData } = useGetTruckLocation();
  const updateLocation = useAdminUpdateLocation({ request: withAuth() });
  const { toast } = useToast();
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: { currentLocation: "", latitude: null, longitude: null },
  });

  useEffect(() => {
    if (locationData) {
      form.reset({
        currentLocation: locationData.currentLocation,
        latitude: locationData.latitude ?? null,
        longitude: locationData.longitude ?? null,
      });
    }
  }, [locationData, form]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported by your browser", variant: "destructive" });
      return;
    }

    setGeoLoading(true);
    setGeoResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        form.setValue("latitude", lat);
        form.setValue("longitude", lng);

        try {
          // Nominatim reverse geocoding (OpenStreetMap - free, no key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
            { headers: { "Accept-Language": "en", "User-Agent": "ShakeCrazyFoodTruck/1.0" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
          const place = addr.road || addr.neighbourhood || addr.suburb || addr.quarter || "";
          const state = addr.state || "";
          const country = addr.country || "";

          const result: GeoResult = {
            city,
            town: addr.town || "",
            village: addr.village || "",
            suburb: addr.suburb || "",
            county: addr.county || "",
            state,
            country,
            displayName: data.display_name || "",
            road: addr.road,
            neighbourhood: addr.neighbourhood || addr.suburb,
          };

          setGeoResult(result);

          // Build a clean human-readable location string
          const parts = [place, city, state, country].filter(Boolean);
          const locationStr = parts.length > 0 ? parts.join(", ") : data.display_name;
          form.setValue("currentLocation", locationStr);

          toast({ title: "📍 Location fetched!", description: `${city || state}, ${country}` });
        } catch {
          toast({ title: "Coordinates set, but address lookup failed", description: `Lat: ${lat}, Lng: ${lng}` });
        }

        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        const messages: Record<number, string> = {
          1: "Location permission denied. Please allow location access.",
          2: "Location unavailable. Check your GPS.",
          3: "Location request timed out. Try again.",
        };
        toast({ title: messages[error.code] || "Location error", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onSubmit = async (values: LocationForm) => {
    try {
      await updateLocation.mutateAsync({ data: values });
      toast({ title: "📍 Location Updated!", description: "Customers can now see the new location." });
      queryClient.invalidateQueries({ queryKey: ["/api/location"] });
      setGeoResult(null);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const lat = form.watch("latitude");
  const lng = form.watch("longitude");
  const mapsUrl = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null;

  const hasCoords = lat && lng;

  const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Live Location</h1>
        <p className="text-gray-500 font-medium mt-1">Update where the truck is parked right now.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="max-w-2xl lg:col-span-2">
        {/* Current broadcast card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Currently Broadcasting</p>
              <p className="text-xl font-bold text-gray-900 leading-snug truncate">
                {locationData?.currentLocation || "Not set yet"}
              </p>
              {locationData?.updatedAt && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDistanceToNow(new Date(locationData.updatedAt), { addSuffix: true })}
                  {locationData.updatedBy && ` · by ${locationData.updatedBy}`}
                </p>
              )}
              {locationData?.latitude && locationData?.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Update form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Update Location</h2>
            <Button
              type="button"
              onClick={fetchCurrentLocation}
              disabled={geoLoading}
              variant="outline"
              className="rounded-xl h-10 px-4 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold gap-2"
            >
              {geoLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
                : <><Navigation className="w-4 h-4" /> Fetch My Location</>
              }
            </Button>
          </div>

          {/* Geo result pill */}
          {geoResult && (
            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">📍 Detected Location</p>
              <div className="flex flex-wrap gap-2">
                {geoResult.road && (
                  <span className="text-sm bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🛣️ {geoResult.road}
                  </span>
                )}
                {geoResult.neighbourhood && (
                  <span className="text-sm bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🏘️ {geoResult.neighbourhood}
                  </span>
                )}
                {geoResult.city && (
                  <span className="text-sm bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🏙️ {geoResult.city}
                  </span>
                )}
                {geoResult.state && (
                  <span className="text-sm bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    📌 {geoResult.state}
                  </span>
                )}
                {geoResult.country && (
                  <span className="text-sm bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🌍 {geoResult.country}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-1 line-clamp-2">{geoResult.displayName}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="currentLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base">Address / Landmark Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 text-lg rounded-xl bg-gray-50 border-gray-200"
                      placeholder="e.g. Road, Area, City, State"
                    />
                  </FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="latitude" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm text-gray-600">Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        className="h-12 rounded-xl font-mono text-sm"
                        placeholder="17.385044"
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="longitude" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm text-gray-600">Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        className="h-12 rounded-xl font-mono text-sm"
                        placeholder="78.486671"
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Live Maps preview link */}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview coordinates on Google Maps
                </a>
              )}

              <Button
                type="submit"
                disabled={updateLocation.isPending}
                className="w-full h-14 text-lg rounded-xl shadow-md bg-primary hover:bg-primary/90 font-bold mt-2"
              >
                <Navigation className="w-5 h-5 mr-2" />
                {updateLocation.isPending ? "Broadcasting..." : "Broadcast New Location"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      {/* Map */}
      <div className="lg:col-span-2 bg-background rounded-3xl overflow-hidden shadow-2xl border border-border min-h-[320px] relative">
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
    </AdminLayout>
  );
}
