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
import { useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";

const locationSchema = z.object({
  currentLocation: z.string().min(1, "Location name required"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
});

export default function LocationManager() {
  const queryClient = useQueryClient();
  const { data: locationData } = useGetTruckLocation();
  const updateLocation = useAdminUpdateLocation({ request: withAuth() });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: { currentLocation: "", latitude: null, longitude: null }
  });

  useEffect(() => {
    if (locationData) {
      form.reset(locationData);
    }
  }, [locationData, form]);

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    try {
      await updateLocation.mutateAsync({ data: values });
      toast({ title: "Location Updated", description: "The live map now shows the new location." });
      queryClient.invalidateQueries({ queryKey: ["/api/location"] });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-gray-900 tracking-wide">Live Location</h1>
          <p className="text-gray-500 font-medium mt-1">Update where the truck is parked right now.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Current Broadcast</p>
              <p className="text-2xl font-bold text-gray-900">{locationData?.currentLocation || "Unknown"}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="currentLocation" render={({field}) => (
                <FormItem>
                  <FormLabel className="text-base font-bold">Address / Landmark</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-14 text-lg rounded-xl bg-gray-50" placeholder="e.g. Central Park Plaza" />
                  </FormControl>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-6">
                <FormField control={form.control} name="latitude" render={({field}) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-600">Latitude (Optional)</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} value={field.value || ''} className="h-12 rounded-xl" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="longitude" render={({field}) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-600">Longitude (Optional)</FormLabel>
                    <FormControl><Input type="number" step="any" {...field} value={field.value || ''} className="h-12 rounded-xl" /></FormControl>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" disabled={updateLocation.isPending} className="w-full h-14 text-lg rounded-xl shadow-lg bg-primary hover:bg-primary/90 mt-4">
                <Navigation className="w-5 h-5 mr-2" />
                {updateLocation.isPending ? "Broadcasting..." : "Broadcast New Location"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}
