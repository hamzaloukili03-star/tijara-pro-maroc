import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Eye, Check, X, Package, FileText, Printer } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ReceptionDialog } from "@/components/purchases/ReceptionDialog";
import { useStockEngine } from "@/hooks/useStockEngine";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:              { label: "Brouillon",         className: "bg-muted text-muted-foreground" },
  confirmed:          { label: "Confirmée",          className: "bg-primary/15 text-primary" },
  partially_received: { label: "Partiellement reçue",className: "bg-yellow-100 text-yellow-800" },
  received:           { label: "Reçue",              className: "bg-green-100 text-green-700" },
  invoiced:           { label: "Facturée",           className: "bg-blue-100 text-blue-700" },
  cancelled:          { label: "Annulée",            className: "bg-destructive/10 text-destructive" },
  // legacy
  validated:          { label: "Confirmée",          className: "bg-primary/15 text-primary" },
};

interface Props {
  items: any[];
  loading: boolean;
  onNew: () => void;
  onEdit: (item: any) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string, reason: string) => void;
  onCreateReception: () => void;
  hook: any;
}

export function PurchaseOrderList({ items, loading, onNew, onEdit, onConfirm, onCancel, hook }: Props) {
  const { roles } = useAuth();
  const stock = useStockEngine();
  const isAdmin = roles.some(r => ["super_admin", "admin"].includes(r));
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [receptionOrder, setReceptionOrder] = useState<any>(null);

  const confirmCancel = async () => {
    if (!cancelDialog || !reason.trim()) return;
    await onCancel(cancelDialog, reason);
    setCancelDialog(null);
    setReason("");
  };

  const canReceive = (s: string) => ["confirmed", "partially_received", "validated"].includes(s);
  const canInvoice = (s: string) => ["received", "partially_received"].includes(s);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Bons de commande fournisseurs</h2>
        <Button onClick={onNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouveau BC</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun bon de commande</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° BC</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Dépôt</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const cfg = statusConfig[item.status] || statusConfig.draft;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm font-medium">{item.number}</TableCell>
                    <TableCell>{item.supplier?.name || "—"}</TableCell>
                    <TableCell>{item.warehouse?.name || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{Number(item.total_ttc || 0).toLocaleString("fr-MA")} MAD</TableCell>
                    <TableCell><Badge className={`${cfg.className} border-0`}>{cfg.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {item.status === "draft" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Modifier</Button>
                            <Button size="sm" variant="outline" className="border-primary/50 text-primary" onClick={() => onConfirm(item.id)}>
                              <Check className="h-3 w-3 mr-1" /> Confirmer
                            </Button>
                          </>
                        )}
                        {canReceive(item.status) && (
                          <Button size="sm" variant="outline" onClick={() => setReceptionOrder(item)}>
                            <Package className="h-3 w-3 mr-1" /> Réceptionner
                          </Button>
                        )}
                        {canInvoice(item.status) && (
                          <Button size="sm" variant="outline" className="border-primary/40 text-primary" onClick={async () => {
                            // Find last validated reception for this order and invoice it
                            const { data } = await (await import("@/integrations/supabase/client")).supabase
                              .from("receptions").select("id, invoice_id").eq("purchase_order_id", item.id).eq("status", "validated").is("invoice_id", null).order("created_at", { ascending: false }).limit(1) as any;
                            if (data && data[0]) await hook.createInvoiceFromReception(data[0].id);
                          }}>
                            <FileText className="h-3 w-3 mr-1" /> Facturer
                          </Button>
                        )}
                        {item.status !== "cancelled" && isAdmin && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" title="Annuler" onClick={() => setCancelDialog(item.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {receptionOrder && (
        <ReceptionDialog order={receptionOrder} hook={hook} stock={stock} onClose={() => setReceptionOrder(null)} />
      )}

      <AlertDialog open={!!cancelDialog} onOpenChange={() => { setCancelDialog(null); setReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le BC</AlertDialogTitle>
            <AlertDialogDescription>Un motif est requis pour annuler un BC confirmé.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input placeholder="Motif d'annulation..." value={reason} onChange={e => setReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={!reason.trim()}>Annuler le BC</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
