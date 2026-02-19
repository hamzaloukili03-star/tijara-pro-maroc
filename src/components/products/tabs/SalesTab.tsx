import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/hooks/useProducts";

interface SalesTabProps {
  form: Partial<Product>;
  updateField: (key: string, value: any) => void;
}

export function SalesTab({ form, updateField }: SalesTabProps) {
  if (!form.can_be_sold) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Ce produit n'est pas marqué comme vendable</p>
        <p className="text-sm mt-1">Activez "Peut être vendu" dans l'onglet Informations générales.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
      <div>
        <Label htmlFor="sale_price_tab">Prix de vente (MAD)</Label>
        <Input id="sale_price_tab" type="number" value={form.sale_price ?? 0} onChange={(e) => updateField("sale_price", Number(e.target.value))} />
      </div>
      <div>
        <Label htmlFor="unit_sale">Unité de vente</Label>
        <Input id="unit_sale" value={form.unit || "Unité"} onChange={(e) => updateField("unit", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="tva_vente">TVA vente (%)</Label>
        <Input id="tva_vente" type="number" value={form.tva_rate ?? 20} onChange={(e) => updateField("tva_rate", Number(e.target.value))} />
      </div>
      <div className="sm:col-span-2">
        <p className="text-sm text-muted-foreground">
          Le prix de vente peut être surchargé au niveau de chaque variante dans l'onglet "Attributs & Variantes".
        </p>
      </div>
    </div>
  );
}
