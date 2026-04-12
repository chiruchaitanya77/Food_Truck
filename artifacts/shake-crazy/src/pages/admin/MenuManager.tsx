import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetMenuItems, useAdminCreateMenuItem, useAdminUpdateMenuItem, useAdminDeleteMenuItem } from "@workspace/api-client-react";
import { withAuth, getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet, AlertCircle, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

const formSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  isVeg: z.boolean(),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean()
});

const EXCEL_COLUMNS = ["ID (leave blank for new)", "Name *", "Category *", "Type (Veg/Non-Veg) *", "Price (₹) *", "Description", "Image URL", "Available (Yes/No) *"];
const CATEGORIES = ["Pizza", "Burger", "Sandwich", "Rolls", "Must Try", "Shakes", "Dessert"];

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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Image upload within the form
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageUploading, setImageUploading] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

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
    form.reset({ ...item, description: item.description || "", imageUrl: item.imageUrl || "" });
    setOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(getApiUrl("/api/admin/menu/upload-image"), {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      form.setValue("imageUrl", data.imageUrl);
      toast({ title: "Image uploaded!", description: "URL set automatically." });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    }
    setImageUploading(false);
    e.target.value = "";
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
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Error saving item";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
      toast({ title: "Deleted successfully" });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const handleDownloadExcel = () => {
    if (!items || items.length === 0) {
      toast({ title: "No menu items to export", variant: "destructive" });
      return;
    }

    const rows = items.map(item => ({
      "ID (leave blank for new)": item.id,
      "Name *": item.name,
      "Category *": item.category,
      "Type (Veg/Non-Veg) *": item.isVeg ? "Veg" : "Non-Veg",
      "Price (₹) *": item.price,
      "Description": item.description || "",
      "Image URL": item.imageUrl || "",
      "Available (Yes/No) *": item.isAvailable ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLUMNS });

    // Style the header row width
    worksheet["!cols"] = [
      { wch: 22 }, { wch: 35 }, { wch: 15 }, { wch: 18 },
      { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

    // Add a second sheet with instructions
    const instrRows = [
      { "Column": "ID (leave blank for new)", "Notes": "Leave blank to create new item. Fill with existing ID to update that item." },
      { "Column": "Name *", "Notes": "Required. Full display name of the item." },
      { "Column": "Category *", "Notes": `Required. Must be one of: ${CATEGORIES.join(", ")}` },
      { "Column": "Type (Veg/Non-Veg) *", "Notes": "Required. Enter exactly 'Veg' or 'Non-Veg'" },
      { "Column": "Price (₹) *", "Notes": "Required. Enter a number (e.g. 99 or 149.50)" },
      { "Column": "Description", "Notes": "Optional. Short description of the item." },
      { "Column": "Image URL", "Notes": "Optional. Full URL to an image." },
      { "Column": "Available (Yes/No) *", "Notes": "Required. Enter 'Yes' to show or 'No' to hide." },
    ];
    const instrSheet = XLSX.utils.json_to_sheet(instrRows);
    instrSheet["!cols"] = [{ wch: 28 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(workbook, instrSheet, "Instructions");

    XLSX.writeFile(workbook, "ShakeCrazy_Menu.xlsx");
    toast({ title: "Menu downloaded as Excel!" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const errors: string[] = [];
        const parsed = rows.map((row, i) => {
          const rowNum = i + 2;
          const name = String(row["Name *"] || "").trim();
          const category = String(row["Category *"] || "").trim();
          const type = String(row["Type (Veg/Non-Veg) *"] || "").trim();
          const price = parseFloat(String(row["Price (₹) *"] || "0").replace(/[^0-9.]/g, ""));
          const available = String(row["Available (Yes/No) *"] || "Yes").trim().toLowerCase();
          const id = row["ID (leave blank for new)"] ? parseInt(row["ID (leave blank for new)"]) : null;

          if (!name) errors.push(`Row ${rowNum}: Name is required`);
          if (!category) errors.push(`Row ${rowNum}: Category is required`);
          if (!["veg", "non-veg"].includes(type.toLowerCase())) errors.push(`Row ${rowNum}: Type must be 'Veg' or 'Non-Veg'`);
          if (isNaN(price) || price < 0) errors.push(`Row ${rowNum}: Price must be a valid number`);

          return {
            id: id || null,
            name,
            category,
            isVeg: type.toLowerCase() === "veg",
            price,
            description: String(row["Description"] || "").trim(),
            imageUrl: String(row["Image URL"] || "").trim() || null,
            isAvailable: !["no", "false", "0"].includes(available),
          };
        }).filter(r => r.name);

        setUploadErrors(errors);
        setUploadPreview(parsed);
        setUploadOpen(true);
      } catch {
        toast({ title: "Error reading Excel file. Please use the downloaded template.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleConfirmUpload = async () => {
    if (uploadErrors.length > 0) {
      toast({ title: "Fix errors before uploading", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let created = 0, updated = 0, failed = 0;

    for (const item of uploadPreview) {
      try {
        const payload = {
          name: item.name,
          category: item.category,
          isVeg: item.isVeg,
          price: item.price,
          description: item.description || "",
          imageUrl: item.imageUrl || undefined,
          isAvailable: item.isAvailable,
        };

        if (item.id) {
          await updateItem.mutateAsync({ id: item.id, data: payload });
          updated++;
        } else {
          await createItem.mutateAsync({ data: payload });
          created++;
        }
      } catch {
        failed++;
      }
    }

    setIsUploading(false);
    setUploadOpen(false);
    setUploadPreview([]);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });

    toast({
      title: `Upload complete: ${created} created, ${updated} updated${failed > 0 ? `, ${failed} failed` : ""}`,
    });
  };

  const filteredItems = items?.filter(item => item.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display text-gray-900 tracking-wide">Menu Management</h1>
          <p className="text-gray-500 font-medium mt-1">Add, update, or bulk import menu items.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={handleDownloadExcel}
            className="rounded-xl h-11 px-5 border-green-300 text-green-700 hover:bg-green-50 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl h-11 px-5 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button onClick={handleOpenNew} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Excel info banner */}
      <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Excel Import/Export:</span> Download the menu as Excel, edit it (add new rows or update existing ones), then upload it back. New rows (empty ID column) will be created; rows with an existing ID will be updated.
        </div>
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
          <span className="text-sm text-gray-400 mr-2 shrink-0">{filteredItems.length} items</span>
        </div>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-gray-600">Name</TableHead>
              <TableHead className="font-bold text-gray-600">Category</TableHead>
              <TableHead className="font-bold text-gray-600">Type</TableHead>
              <TableHead className="font-bold text-gray-600">Price</TableHead>
              <TableHead className="font-bold text-gray-600">Image</TableHead>
              <TableHead className="font-bold text-gray-600">Status</TableHead>
              <TableHead className="font-bold text-gray-600">Updated</TableHead>
              <TableHead className="text-right font-bold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No items found</TableCell></TableRow>
            ) : filteredItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50/50">
                <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                <TableCell><span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold">{item.category}</span></TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-bold">₹{item.price}</TableCell>
                <TableCell>
                  <img
                      src={item.imageUrl}
                      alt="menu item"
                      className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isAvailable ? 'AVAILABLE' : 'HIDDEN'}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-400">
                  {new Date(item.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editingId ? "Edit Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({field}) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Crispy Chicken Blast Burger" /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-1">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({field}) => (
                  <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.50" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({field}) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Short description..." /></FormControl></FormItem>
              )} />
              {/* Image — URL or upload */}
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel>Image</FormLabel>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                      <button type="button"
                        onClick={() => setImageMode("url")}
                        className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${imageMode === "url" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                        <LinkIcon className="w-3 h-3" /> URL
                      </button>
                      <button type="button"
                        onClick={() => setImageMode("upload")}
                        className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${imageMode === "upload" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                        <ImageIcon className="w-3 h-3" /> Upload
                      </button>
                    </div>
                  </div>
                  {imageMode === "url" ? (
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                  ) : (
                    <div>
                      <Button type="button" variant="outline" disabled={imageUploading}
                        onClick={() => imageFileRef.current?.click()}
                        className="w-full h-10 border-dashed rounded-xl font-semibold">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {imageUploading ? "Uploading..." : "Choose Image File (max 5MB)"}
                      </Button>
                      <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                    </div>
                  )}
                  {field.value && (
                    <img src={field.value} alt="preview" className="w-full h-28 object-cover rounded-xl mt-2 border border-gray-200"
                      onError={e => (e.currentTarget.style.display = "none")} />
                  )}
                </FormItem>
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
              <Button type="submit" className="w-full h-12 mt-4 text-lg rounded-xl font-bold">
                {editingId ? "Save Changes" : "Create Item"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-500" />
              Excel Upload Preview
            </DialogTitle>
            <DialogDescription>
              Review the items below before confirming the import.
            </DialogDescription>
          </DialogHeader>

          {uploadErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                <AlertCircle className="w-4 h-4" /> {uploadErrors.length} error(s) found — fix in your Excel file and re-upload
              </div>
              {uploadErrors.map((e, i) => <p key={i} className="text-sm text-red-600">{e}</p>)}
            </div>
          )}

          <div className="text-sm text-gray-600 font-medium mb-3">
            {uploadPreview.filter(r => !r.id).length} new items to create &nbsp;·&nbsp;
            {uploadPreview.filter(r => r.id).length} existing items to update
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-bold text-gray-600">Action</th>
                  <th className="text-left p-3 font-bold text-gray-600">Name</th>
                  <th className="text-left p-3 font-bold text-gray-600">Category</th>
                  <th className="text-left p-3 font-bold text-gray-600">Type</th>
                  <th className="text-left p-3 font-bold text-gray-600">Price</th>
                  <th className="text-left p-3 font-bold text-gray-600">Available</th>
                </tr>
              </thead>
              <tbody>
                {uploadPreview.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.id ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {item.id ? `UPDATE #${item.id}` : 'NEW'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{item.name}</td>
                    <td className="p-3 text-gray-600">{item.category}</td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${item.isVeg ? 'text-green-600' : 'text-red-600'}`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">₹{item.price}</td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${item.isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setUploadOpen(false)} className="flex-1 rounded-xl h-11">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={uploadErrors.length > 0 || isUploading || uploadPreview.length === 0}
              className="flex-1 rounded-xl h-11 font-bold bg-primary text-white"
            >
              {isUploading ? "Uploading..." : `Confirm Import (${uploadPreview.length} items)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
