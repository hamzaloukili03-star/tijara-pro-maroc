import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Package } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface ProductKanbanProps {
  products: Product[];
  stockLevels?: Record<string, { on_hand: number; reserved: number; available: number }>;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function ProductKanban({ products, stockLevels, onView, onEdit }: ProductKanbanProps) {
  const fmt = (n: number) => n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStockBadge = (p: Product) => {
    const sl = stockLevels?.[p.id];
    if (!sl || p.product_type === "service") return null;
    const available = sl.available;
    const minStock = p.min_stock || 0;
    if (available <= 0)
      return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-destructive/15 text-destructive border-destructive/30">Rupture</Badge>;
    if (available <= minStock)
      return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-warning/15 text-warning-foreground border-warning/30">Stock faible</Badge>;
    return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-success/15 text-success border-success/30">En stock</Badge>;
  };

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground py-12">Aucun produit trouvé.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const sl = stockLevels?.[p.id];
        const available = sl?.available ?? 0;

        return (
          <div
            key={p.id}
            className="bg-card rounded-xl border border-border p-4 transition-all hover:shadow-[var(--shadow-card-hover)] cursor-pointer group"
            onClick={() => onView(p)}
          >
            {/* Image + Name */}
            <div className="flex items-start gap-3 mb-3">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{p.name}</h3>
                <span className="font-mono text-[11px] text-muted-foreground">{p.code}</span>
                <div className="mt-1">{getStockBadge(p)}</div>
              </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-3">
              <div>
                <span className="text-muted-foreground">Catégorie</span>
                <div className="font-medium text-foreground truncate">{p.category || "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Stock dispo</span>
                <div className={`font-semibold ${available <= 0 ? "text-destructive" : available <= (p.min_stock || 0) ? "text-warning" : "text-foreground"}`}>
                  {p.product_type === "service" ? "—" : available}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Prix vente</span>
                <div className="font-semibold text-foreground">{fmt(p.sale_price)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Coût</span>
                <div className="font-medium text-foreground">{fmt(p.purchase_price)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onView(p)}>
                <Eye className="h-3 w-3" /> Détails
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onEdit(p)}>
                <Edit className="h-3 w-3" /> Modifier
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
