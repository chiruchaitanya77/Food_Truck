import { useGetApprovedSubmissions, useCreateSubmission } from "@workspace/api-client-react";
import { Camera, Heart, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const submissionSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  experienceText: z.string().min(10, "Tell us a bit more!"),
  imageUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  location: z.string().optional()
});

export function GallerySection() {
  const { data: submissions } = useGetApprovedSubmissions();
  const createSub = useCreateSubmission();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { userName: "", experienceText: "", imageUrl: "", location: "" }
  });

  const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
    try {
      await createSub.mutateAsync({ data: values });
      toast({ title: "Submitted!", description: "Thanks for sharing! We'll review it soon." });
      setOpen(false);
      form.reset();
    } catch {
      toast({ title: "Error", description: "Failed to submit. Try again.", variant: "destructive" });
    }
  };

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div>
            <h2 className="font-display text-5xl text-foreground mb-4">Crazy Love Gallery</h2>
            <p className="text-xl text-muted-foreground font-medium">Real smiles, real food comas from our amazing fam.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20 hover:-translate-y-1 transition-all">
                <Camera className="w-5 h-5 mr-2" /> Share Your Pic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-8 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-display text-3xl mb-2 text-center text-primary">Share The Love</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Your Name</FormLabel>
                        <FormControl><Input placeholder="Crazy foodie..." className="h-12 bg-muted/50 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Your Experience</FormLabel>
                        <FormControl><Textarea placeholder="Best burger ever..." className="min-h-[100px] resize-none bg-muted/50 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Image URL (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://..." className="h-12 bg-muted/50 rounded-xl" {...field} /></FormControl>
                        <p className="text-xs text-muted-foreground font-medium">Paste a link to your Instagram pic or image host.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createSub.isPending} className="w-full h-14 text-lg rounded-xl shadow-lg bg-primary hover:bg-primary/90">
                    {createSub.isPending ? "Submitting..." : "Submit to Gallery"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {submissions?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Gallery is empty. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {submissions?.map((sub) => (
              <div key={sub.id} className="break-inside-avoid bg-card rounded-3xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-shadow group">
                {sub.imageUrl && (
                  <div className="overflow-hidden">
                    <img src={sub.imageUrl} alt="Customer pic" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-foreground font-medium text-lg leading-relaxed mb-4 italic">
                    "{sub.experienceText}"
                  </p>
                  <p className="text-muted-foreground font-bold">— {sub.userName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
