import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { useCrud } from "@/hooks/useCrud";
import { Package } from "lucide-react";
import { ProductImageUpload } from "@/components/ProductImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  purchase_price: number;
  sale_price: number;
  tva_rate: number;
  min_stock: number;
  is_active: boolean;
  image_url: string | null;
  barcode: string | null;
}

const fields: FieldConfig[] = [
  { key: "code", label: "Code", required: true, placeholder: "ART-001" },
  { key: "name", label: "Désignation", required: true, placeholder: "Nom du produit" },
  { key: "category", label: "Catégorie", placeholder: "Ex: Matières premières" },
  { key: "unit", label: "Unité", required: true, placeholder: "Unité, Kg, L...", defaultValue: "Unité" },
  { key: "purchase_price", label: "Prix d'achat (MAD)", type: "number", required: true, defaultValue: 0 },
  { key: "sale_price", label: "Prix de vente (MAD)", type: "number", required: true, defaultValue: 0 },
  { key: "tva_rate", label: "TVA (%)", type: "number", defaultValue: 20 },
  { key: "min_stock", label: "Stock minimum", type: "number", defaultValue: 0 },
  { key: "barcode", label: "Code-barres", placeholder: "EAN13", showInTable: false },
  { key: "description", label: "Description", type: "textarea", showInTable: false },
];

const tableFields: FieldConfig[] = fields.filter(f => f.showInTable !== false).map(f => {
  if (f.key === "purchase_price" || f.key === "sale_price") {
    return { ...f, showInTable: true, render: (v: number) => `${Number(v || 0).toLocaleString("fr-MA")} MAD` };
  }
  if (f.key === "tva_rate") {
    return { ...f, showInTable: true, render: (v: number) => `${v}%` };
  }
  return f;
});

export default function ProductsPage() {
  const { data, loading, create, update, remove } = useCrud<Product>({ table: "products", orderBy: "code", ascending: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const openCreate = () => {
    const defaults: Record<string, any> = {};
    fields.forEach((f) => { if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue; });
    defaults.image_url = null;
    setForm(defaults);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (row: any) => {
    const values: Record<string, any> = {};
    fields.forEach((f) => { values[f.key] = row[f.key] ?? ""; });
    values.image_url = row.image_url || null;
    setForm(values);
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = editingId
      ? await update(editingId, form as unknown as Partial<Product>)
      : await create(form as unknown as Partial<Product>);
    setSaving(false);
    if (ok) setDialogOpen(false);
  };

  const filtered = data.filter((row: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return fields.some((f) => {
      const val = row[f.key];
      return val && String(val).toLowerCase().includes(s);
    });
  });

  if (loading) {
    return (
      <AppLayout title="Produits & Articles" subtitle="Catalogue des produits et services">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Produits & Articles" subtitle="Catalogue des produits et services">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        {data.length === 0 && !search ? (
          <EmptyState icon={<Package className="h-8 w-8" />} title="Aucun produit" description="Ajoutez votre premier produit." actionLabel="Ajouter" onAction={openCreate} />
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">Image</TableHead>
                  {tableFields.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row: any, i) => (
                  <TableRow key={row.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <TableCell>
                      {row.image_url ? (
                        <img src={row.image_url} alt={row.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    {tableFields.map((f) => (
                      <TableCell key={f.key}>
                        {f.render ? f.render(row[f.key], row) : (
                          f.type === "number" ? Number(row[f.key] || 0).toLocaleString("fr-MA") : String(row[f.key] || "—")
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(row.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun résultat.</p>}
          </div>
        )}

        {/* Product Dialog — wide, two-column with image upload */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[65vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier" : "Nouveau"} Produit</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Image */}
              <div className="lg:col-span-1">
                <ProductImageUpload
                  productId={editingId || undefined}
                  imageUrl={form.image_url}
                  onImageChange={(url) => setForm({ ...form, image_url: url })}
                />
              </div>
              {/* Right: Fields */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                    {f.type === "textarea" ? (
                      <textarea
                        id={f.key}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={f.key}
                        type={f.type || "text"}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                        placeholder={f.placeholder}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
