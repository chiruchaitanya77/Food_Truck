import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetMenuItems, useAdminCreateMenuItem, useAdminUpdateMenuItem, useAdminDeleteMenuItem } from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  isVeg: z.boolean(),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean()
});

export default function MenuManager() {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useAdminGetMenuItems({ request: withAuth() });
  const createItem = useAdminCreateMenuItem({ request: withAuth() });
  const updateItem = useAdminUpdateMenuItem({ request: withAuth() });
  const deleteItem = useAdminDeleteMenuItem({ request: withAuth() });
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", category: "", isVeg: true, price: 0, isAvailable: true, description: "", imageUrl: "" }
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({ name: "", category: "", isVeg: true, price: 0, isAvailable: true, description: "", imageUrl: "" });
    setOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    form.reset(item);
    setOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, data: values });
        toast({ title: "Updated successfully" });
      } else {
        await createItem.mutateAsync({ data: values });
        toast({ title: "Created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
      setOpen(false);
    } catch {
      toast({ title: "Error saving item", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteItem.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
      toast({ title: "Deleted successfully" });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const filteredItems = items?.filter(item => item.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display text-gray-900 tracking-wide">Menu Management</h1>
          <p className="text-gray-500 font-medium mt-1">Add or update food items.</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6">
          <Plus className="w-5 h-5 mr-2" /> Add Item
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="text-gray-400 w-5 h-5 ml-2" />
          <Input 
            placeholder="Search menu..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-lg bg-transparent"
          />
        </div>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-gray-600">Name</TableHead>
              <TableHead className="font-bold text-gray-600">Category</TableHead>
              <TableHead className="font-bold text-gray-600">Type</TableHead>
              <TableHead className="font-bold text-gray-600">Price</TableHead>
              <TableHead className="font-bold text-gray-600">Status</TableHead>
              <TableHead className="text-right font-bold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                <TableCell><span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold">{item.category}</span></TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-bold">₹{item.price}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isAvailable ? 'AVAILABLE' : 'HIDDEN'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}><Pencil className="w-4 h-4 text-gray-500 hover:text-primary" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-gray-500 hover:text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editingId ? "Edit Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({field}) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="price" render={({field}) => (
                  <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({field}) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({field}) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-6 mt-4">
                <FormField control={form.control} name="isVeg" render={({field}) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Vegetarian</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isAvailable" render={({field}) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Available</FormLabel>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full h-12 mt-4 text-lg rounded-xl">{editingId ? "Save Changes" : "Create Item"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
