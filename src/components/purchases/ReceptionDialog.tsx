import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Props { order: any; hook: any; stock: any; onClose: () => void; }

export function ReceptionDialog({ order, hook, stock, onClose }: Props) {
  const [lines, setLines] = useState<any[]>([]);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hook.getLines(order.id).then((l: any[]) => {
      setLines(l);
      const q: Record<string, number> = {};
      l.forEach((line: any) => { q[line.id] = Math.max(0, Number(line.quantity) - Number(line.received_qty || 0)); });
      setQtys(q);
      setLoading(false);
    });
  }, [order.id]);

  const handleValidate = async () => {
    const toReceive = lines.filter(l => (qtys[l.id] || 0) > 0).map(l => ({
      purchase_order_line_id: l.id, product_id: l.product_id, description: l.description,
      quantity: qtys[l.id], unit_price: Number(l.unit_price), discount_percent: Number(l.discount_percent || 0), tva_rate: Number(l.tva_rate),
    }));
    if (toReceive.length === 0) { toast({ title: "Aucune quantité à réceptionner", variant: "destructive" }); return; }
    setSaving(true);
    await hook.createReception(order.id, toReceive, stock.addStock);
    await stock.fetchAll();
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Réception — {order.number}</DialogTitle></DialogHeader>
        {loading ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Indiquez les quantités effectivement reçues :</p>
            {lines.map(l => {
              const remaining = Math.max(0, Number(l.quantity) - Number(l.received_qty || 0));
              return (
                <div key={l.id} className="flex items-center gap-3 bg-muted/30 rounded p-2">
                  <span className="text-sm flex-1">{l.product?.code && <span className="font-mono text-xs text-muted-foreground mr-2">{l.product.code}</span>}{l.description}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Cmd: {l.quantity} | Reçu: {l.received_qty || 0} | Restant: {remaining}</span>
                  <Input type="number" className="w-20 h-8 text-sm" min={0} max={remaining} value={qtys[l.id] ?? 0}
                    onChange={e => setQtys({ ...qtys, [l.id]: Math.min(Number(e.target.value), remaining) })} />
                </div>
              );
            })}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleValidate} disabled={saving || loading}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Valider la réception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
