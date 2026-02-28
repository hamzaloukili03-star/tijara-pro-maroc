import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { PURCHASE_REQUEST_STATUS, getStatus } from "@/lib/status-config";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  item: any;
  onClose: () => void;
}

export function PurchaseRequestDetail({ item, onClose }: Props) {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any).from("purchase_request_lines")
      .select("*, product:products(name, code)")
      .eq("request_id", item.id).order("sort_order")
      .then(({ data }: any) => { setLines(data || []); setLoading(false); });
  }, [item.id]);

  const cfg = getStatus(PURCHASE_REQUEST_STATUS, item.status);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {item.number}
            <Badge className={`${cfg.className} border-0 text-xs`}>{cfg.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Fournisseur :</span> <strong>{item.supplier?.name || "—"}</strong></div>
            <div><span className="text-muted-foreground">Réf. fournisseur :</span> <strong>{item.supplier_reference || "—"}</strong></div>
            <div><span className="text-muted-foreground">Arrivée prévue :</span> <strong>{item.needed_date || "—"}</strong></div>
            <div><span className="text-muted-foreground">Devise :</span> <strong>{item.currency?.code || "MAD"}</strong></div>
            <div><span className="text-muted-foreground">Demandeur :</span> <strong>{item.requester?.full_name || "—"}</strong></div>
          </div>

          {item.notes && (
            <div className="text-sm bg-muted/50 rounded-md p-3">
              <span className="text-muted-foreground">Notes : </span>{item.notes}
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Lignes de demande</h4>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Produit / Description</th>
                      <th className="text-right px-3 py-2 font-medium">Qté</th>
                      <th className="text-right px-3 py-2 font-medium">Unité</th>
                      <th className="text-right px-3 py-2 font-medium">Coût estim.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="px-3 py-2">
                          {l.product && <span className="font-mono text-xs text-muted-foreground mr-2">{l.product.code}</span>}
                          {l.description}
                        </td>
                        <td className="px-3 py-2 text-right">{l.quantity}</td>
                        <td className="px-3 py-2 text-right">{l.unit || "Unité"}</td>
                        <td className="px-3 py-2 text-right">{Number(l.estimated_cost || 0).toLocaleString("fr-MA")} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
