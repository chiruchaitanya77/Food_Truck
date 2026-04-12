import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminGetDiscounts,
  useAdminCreateDiscount,
  useAdminUpdateDiscount,
  useAdminDeleteDiscount,
} from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, CalendarDays, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const FESTIVAL_PRESETS = [
  "Cricket IPL Special", "Christmas Special", "Ugadi Special",
  "Holi Special", "Sankranthi Special", "Diwali Special",
  "New Year Special", "Independence Day Special", "Eid Special",
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  discountPercentage: z.coerce.number().min(1, "Must be at least 1%").max(100, "Max 100%"),
  isActive: z.boolean(),
  isAuto: z.boolean(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function StatusBadge({ discount }: { discount: any }) {
  const now = new Date().toISOString().split("T")[0];
  const autoOn = discount.isAuto && discount.startDate && discount.endDate
    && now >= discount.startDate && now <= discount.endDate;
  const active = discount.isActive || autoOn;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {active ? "🟢 ACTIVE" : "⚫ INACTIVE"}
    </span>
  );
}

export default function DiscountsManager() {
  const queryClient = useQueryClient();
  const { data: discounts, isLoading } = useAdminGetDiscounts({ request: withAuth() });
  const createDiscount = useAdminCreateDiscount({ request: withAuth() });
  const updateDiscount = useAdminUpdateDiscount({ request: withAuth() });
  const deleteDiscount = useAdminDeleteDiscount({ request: withAuth() });
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", discountPercentage: 10, isActive: false,
      isAuto: false, startDate: null, endDate: null, posterUrl: null,
    },
  });

  const isAuto = form.watch("isAuto");

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({
      name: "", discountPercentage: 10, isActive: false,
      isAuto: false, startDate: null, endDate: null, posterUrl: null,
    });
    setOpen(true);
  };

  const handleOpenEdit = (d: any) => {
    setEditingId(d.id);
    form.reset({
      name: d.name,
      discountPercentage: d.discountPercentage,
      isActive: d.isActive,
      isAuto: d.isAuto,
      startDate: d.startDate || null,
      endDate: d.endDate || null,
      posterUrl: d.posterUrl || null,
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        discountPercentage: values.discountPercentage,
        isActive: values.isActive,
        isAuto: values.isAuto,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        posterUrl: values.posterUrl || null,
      };
      if (editingId) {
        await updateDiscount.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Discount updated!" });
      } else {
        await createDiscount.mutateAsync({ data: payload });
        toast({ title: "Discount created!" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discounts"] });
      setOpen(false);
    } catch {
      toast({ title: "Error saving discount", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this discount?")) return;
    try {
      await deleteDiscount.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discounts"] });
      toast({ title: "Discount deleted" });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const handleQuickToggle = async (d: any) => {
    try {
      await updateDiscount.mutateAsync({
        id: d.id,
        data: {
          name: d.name,
          discountPercentage: d.discountPercentage,
          isActive: !d.isActive,
          isAuto: d.isAuto,
          startDate: d.startDate || null,
          endDate: d.endDate || null,
          posterUrl: d.posterUrl || null,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discounts"] });
      toast({ title: d.isActive ? "Discount turned off" : "Discount is now live!" });
    } catch {
      toast({ title: "Toggle failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display text-gray-900 tracking-wide">Festival Discounts</h1>
          <p className="text-gray-500 font-medium mt-1">Create and manage promotional banners shown on the website.</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Discount
        </Button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <Tag className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
        <div className="text-sm text-yellow-800">
          <span className="font-semibold">How it works:</span> Active discounts appear as a banner on the customer homepage.
          Use <span className="font-semibold">Manual</span> to toggle on/off anytime, or <span className="font-semibold">Auto</span> to activate automatically between your chosen dates.
        </div>
      </div>

      {/* Discount Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : discounts && discounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discounts.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Top color strip based on active status */}
              <div className={`h-1.5 ${d.isActive || (d.isAuto && d.startDate && d.endDate) ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gray-200"}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black ${d.isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                      {d.discountPercentage}%
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg leading-tight">{d.name}</p>
                      <StatusBadge discount={d} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(d)} className="rounded-lg">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="rounded-lg">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {d.isAuto ? (
                      <>
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-600">Auto</span>
                        {d.startDate && d.endDate ? (
                          <span>{format(new Date(d.startDate), "d MMM")} – {format(new Date(d.endDate), "d MMM yyyy")}</span>
                        ) : (
                          <span className="text-gray-400">No dates set</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-gray-600">Manual</span>
                        <span className="text-gray-400">· Toggle to activate</span>
                      </>
                    )}
                  </div>

                  {/* Quick toggle */}
                  <button
                    onClick={() => handleQuickToggle(d)}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    title={d.isActive ? "Turn off" : "Turn on"}
                  >
                    {d.isActive
                      ? <><ToggleRight className="w-6 h-6 text-green-500" /><span className="text-green-600">On</span></>
                      : <><ToggleLeft className="w-6 h-6 text-gray-400" /><span className="text-gray-400">Off</span></>
                    }
                  </button>
                </div>

                {d.posterUrl && (
                  <div className="mt-3">
                    <img src={d.posterUrl} alt="Poster" className="w-full h-24 object-cover rounded-lg border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-400">No discounts yet</p>
          <p className="text-gray-400 mt-1 mb-6">Create your first festival discount to get started.</p>
          <Button onClick={handleOpenNew} className="bg-primary text-white rounded-xl h-11 px-6 font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Create First Discount
          </Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editingId ? "Edit Discount" : "New Festival Discount"}</DialogTitle>
            <DialogDescription>Fill in the details below. Active discounts show as banners on the customer site.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">

              {/* Name + Presets */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Festival / Offer Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Holi Special, Christmas Offer..." className="h-11 rounded-xl" />
                  </FormControl>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {FESTIVAL_PRESETS.map(p => (
                      <button key={p} type="button"
                        onClick={() => form.setValue("name", p)}
                        className="text-xs px-2.5 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium border border-orange-200 transition-colors">
                        {p}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Discount % */}
              <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Discount Percentage</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field} className="h-11 rounded-xl w-32 text-xl font-bold text-center" />
                    </FormControl>
                    <span className="text-3xl font-black text-gray-400">%</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {[5, 8, 10, 15, 20, 25].map(v => (
                        <button key={v} type="button"
                          onClick={() => form.setValue("discountPercentage", v)}
                          className={`text-sm px-3 py-1.5 rounded-lg font-bold transition-colors border ${form.watch("discountPercentage") === v ? "bg-primary text-white border-primary" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}>
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Activation Mode */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <FormField control={form.control} name="isAuto" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="font-bold text-base">Auto-activate by Dates</FormLabel>
                      <p className="text-xs text-gray-500 mt-0.5">When ON, discount goes live automatically between start and end date.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />

                {isAuto ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-sm">Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} className="h-10 rounded-xl" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-sm">End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} className="h-10 rounded-xl" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                ) : (
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel className="font-bold text-base">Active Now</FormLabel>
                        <p className="text-xs text-gray-500 mt-0.5">Toggle to immediately show or hide this discount.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}
              </div>

              {/* Poster URL */}
              <FormField control={form.control} name="posterUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Poster Image URL <span className="font-normal text-gray-400">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://... (image link for the event poster)" className="h-11 rounded-xl" />
                  </FormControl>
                  {field.value && (
                    <img src={field.value} alt="preview" className="w-full h-28 object-cover rounded-xl mt-2 border border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                </FormItem>
              )} />

              <Button type="submit" disabled={createDiscount.isPending || updateDiscount.isPending} className="w-full h-12 text-lg rounded-xl font-bold">
                {createDiscount.isPending || updateDiscount.isPending ? "Saving..." : editingId ? "Save Changes" : "Create Discount"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
