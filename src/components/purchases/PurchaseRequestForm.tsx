import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { PurchaseLine } from "@/hooks/usePurchases";

interface Props {
  editItem: any | null;
  hook: any;
  onClose: () => void;
}

const emptyLine = (): Partial<PurchaseLine> => ({
  product_id: null, description: "", quantity: 1, unit: "Unité", estimated_cost: 0, tva_rate: 0,
});

export function PurchaseRequestForm({ editItem, hook, onClose }: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState(editItem?.warehouse_id || "");
  const [supplierId, setSupplierId] = useState(editItem?.supplier_id || "");
  const [neededDate, setNeededDate] = useState(editItem?.needed_date || "");
  const [notes, setNotes] = useState(editItem?.notes || "");
  const [lines, setLines] = useState<Partial<PurchaseLine>[]>(editItem ? [] : [emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (supabase as any).from("suppliers").select("id, name, code").eq("is_active", true).order("name").then(({ data }: any) => setSuppliers(data || []));
    (supabase as any).from("warehouses").select("id, name").eq("is_active", true).then(({ data }: any) => { setWarehouses(data || []); if (!editItem && data?.length) setWarehouseId(data[0].id); });
    (supabase as any).from("products").select("id, name, code, purchase_price, tva_rate").eq("is_active", true).order("name").then(({ data }: any) => setProducts(data || []));

    if (editItem) {
      setLoading(true);
      hook.getLines(editItem.id).then((l: any[]) => {
        setLines(l.map(r => ({ product_id: r.product_id, description: r.description, quantity: r.quantity, unit: r.unit || "Unité", estimated_cost: r.estimated_cost, tva_rate: r.tva_rate })));
        setLoading(false);
      });
    }
  }, []);

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[idx] as any)[field] = value;
    if (field === "product_id") {
      const p = products.find((pr: any) => pr.id === value);
      if (p) { updated[idx].description = p.name; updated[idx].estimated_cost = Number(p.purchase_price); updated[idx].tva_rate = Number(p.tva_rate); }
    }
    setLines(updated);
  };

  const handleSave = async () => {
    if (!warehouseId) return;
    setSaving(true);
    if (editItem) {
      await hook.update(editItem.id, { warehouse_id: warehouseId, supplier_id: supplierId || null, needed_date: neededDate || null, notes }, lines);
    } else {
      await hook.create({ warehouseId, supplierId: supplierId || undefined, neededDate: neededDate || undefined, notes, lines });
    }
    setSaving(false);
    onClose();
  };

  const supplierOptions = suppliers.map(s => ({ value: s.id, label: `${s.code} — ${s.name}` }));
  const productOptions = products.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? `Modifier DA — ${editItem.number}` : "Nouvelle demande d'achat"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dépôt <span className="text-destructive">*</span></Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Choisir un dépôt" /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fournisseur (optionnel)</Label>
              <SearchableSelect options={supplierOptions} value={supplierId} onValueChange={setSupplierId} placeholder="Sélectionner..." />
            </div>
          </div>

          <div>
            <Label>Date souhaitée</Label>
            <Input type="date" value={neededDate} onChange={e => setNeededDate(e.target.value)} />
          </div>

          {loading ? <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
            <div className="space-y-2">
              <Label>Lignes</Label>
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-md">
                    <div className="col-span-3">
                      <SearchableSelect options={productOptions} value={line.product_id || ""} onValueChange={v => updateLine(idx, "product_id", v)} placeholder="Produit..." />
                    </div>
                    <div className="col-span-3">
                      <Input className="h-8 text-xs" placeholder="Description" value={line.description || ""} onChange={e => updateLine(idx, "description", e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <Input className="h-8 text-xs" type="number" placeholder="Qté" min={0} value={line.quantity || ""} onChange={e => updateLine(idx, "quantity", Number(e.target.value))} />
                    </div>
                    <div className="col-span-1">
                      <Select value={line.unit || "Unité"} onValueChange={v => updateLine(idx, "unit", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Unité", "Kg", "L", "m", "m²", "Boîte", "Carton", "Pièce"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input className="h-8 text-xs" type="number" placeholder="Coût estim." min={0} value={line.estimated_cost || ""} onChange={e => updateLine(idx, "estimated_cost", Number(e.target.value))} />
                    </div>
                    <div className="col-span-1">
                      <Input className="h-8 text-xs" type="number" placeholder="TVA%" min={0} value={line.tva_rate || ""} onChange={e => updateLine(idx, "tva_rate", Number(e.target.value))} />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => setLines([...lines, emptyLine()])}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter une ligne
              </Button>
            </div>
          )}

          <div>
            <Label>Notes internes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !warehouseId}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
