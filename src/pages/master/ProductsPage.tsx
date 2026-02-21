import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useProducts, Product } from "@/hooks/useProducts";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { ProductImportExport } from "@/components/products/ProductImportExport";
import { ProductKanban } from "@/components/master/ProductKanban";
import { ViewToggle } from "@/components/ViewToggle";
import { Package, Loader2, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";

const TYPE_LABELS: Record<string, string> = {
  stockable: "Stockable",
  consumable: "Consommable",
  service: "Service",
};

export default function ProductsPage() {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");

  const openCreate = () => { setEditingProduct(null); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setDialogOpen(true); };

  const handleSave = async (data: Partial<Product>) => {
    if (editingProduct) {
      return await updateProduct(editingProduct.id, data);
    }
    return await createProduct(data);
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || (p.category || "").toLowerCase().includes(s);
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
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            <ProductImportExport products={products} onImportDone={fetchProducts} />
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Nouveau produit
            </Button>
          </div>
        </div>

        {products.length === 0 && !search ? (
          <EmptyState icon={<Package className="h-8 w-8" />} title="Aucun produit" description="Ajoutez votre premier produit." actionLabel="Ajouter" onAction={openCreate} />
        ) : view === "kanban" ? (
          <ProductKanban
            products={filtered}
            onView={openEdit}
            onEdit={openEdit}
          />
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix vente</TableHead>
                  <TableHead className="text-right">Prix achat</TableHead>
                  <TableHead className="text-right">TVA</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id} className={`cursor-pointer hover:bg-muted/30 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`} onClick={() => openEdit(p)}>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[p.product_type] || p.product_type}</Badge>
                    </TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell className="text-right">{p.sale_price.toLocaleString("fr-MA")} MAD</TableCell>
                    <TableCell className="text-right">{p.purchase_price.toLocaleString("fr-MA")} MAD</TableCell>
                    <TableCell className="text-right">{p.tva_rate}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteProduct(p.id)}>
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

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSave={handleSave}
        />
      </div>
    </AppLayout>
  );
}
