import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/hooks/useProducts";

interface PurchasesTabProps {
  form: Partial<Product>;
  updateField: (key: string, value: any) => void;
}

export function PurchasesTab({ form, updateField }: PurchasesTabProps) {
  if (!form.can_be_purchased) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Ce produit n'est pas marqué comme achetable</p>
        <p className="text-sm mt-1">Activez "Peut être acheté" dans l'onglet Informations générales.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
      <div>
        <Label htmlFor="purchase_price_tab">Coût d'achat (MAD)</Label>
        <Input id="purchase_price_tab" type="number" value={form.purchase_price ?? 0} onChange={(e) => updateField("purchase_price", Number(e.target.value))} />
      </div>
      <div>
        <Label htmlFor="purchase_unit_tab">Unité d'achat</Label>
        <Input id="purchase_unit_tab" value={form.purchase_unit || "Unité"} onChange={(e) => updateField("purchase_unit", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <p className="text-sm text-muted-foreground">
          Le coût d'achat peut être surchargé au niveau de chaque variante.
        </p>
      </div>
    </div>
  );
}
