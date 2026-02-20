import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Eye, Check, X, ThumbsDown, FileText } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { PurchaseRequestDetail } from "@/components/purchases/PurchaseRequestDetail";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:     { label: "Brouillon",  className: "bg-muted text-muted-foreground" },
  submitted: { label: "Soumise",    className: "bg-yellow-100 text-yellow-800" },
  approved:  { label: "Approuvée",  className: "bg-primary/15 text-primary" },
  refused:   { label: "Refusée",    className: "bg-destructive/15 text-destructive" },
  cancelled: { label: "Annulée",    className: "bg-muted text-muted-foreground line-through" },
  validated: { label: "Approuvée",  className: "bg-primary/15 text-primary" },
};

interface Props {
  items: any[];
  loading: boolean;
  onNew: () => void;
  onEdit: (item: any) => void;
  onSubmit: (id: string) => void;
  onApprove: (id: string) => void;
  onRefuse: (id: string, reason?: string) => void;
  onCancel: (id: string, reason?: string) => void;
  onCreatePO: (id: string) => Promise<any>;
}

export function PurchaseRequestList({ items, loading, onNew, onEdit, onSubmit, onApprove, onRefuse, onCancel, onCreatePO }: Props) {
  const { roles } = useAuth();
  const isAdmin = roles.some(r => ["super_admin", "admin"].includes(r));
  const [detail, setDetail] = useState<any>(null);
  const [cancelDialog, setCancelDialog] = useState<{ id: string; action: "refuse" | "cancel" } | null>(null);
  const [reason, setReason] = useState("");
  const [creatingPO, setCreatingPO] = useState<string | null>(null);

  const handleCreatePO = async (id: string) => {
    setCreatingPO(id);
    await onCreatePO(id);
    setCreatingPO(null);
  };

  const confirmAction = async () => {
    if (!cancelDialog) return;
    if (cancelDialog.action === "refuse") await onRefuse(cancelDialog.id, reason);
    else await onCancel(cancelDialog.id, reason);
    setCancelDialog(null);
    setReason("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Demandes d'achat</h2>
        <Button onClick={onNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouvelle demande</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune demande d'achat</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Dépôt</TableHead>
                <TableHead>Date besoin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const cfg = statusConfig[item.status] || statusConfig.draft;
                const locked = ["approved", "refused", "cancelled", "validated"].includes(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm font-medium">{item.number}</TableCell>
                    <TableCell>{item.supplier?.name || <span className="text-muted-foreground text-xs">Non défini</span>}</TableCell>
                    <TableCell>{item.warehouse?.name || "—"}</TableCell>
                    <TableCell>{item.needed_date || "—"}</TableCell>
                    <TableCell><Badge className={`${cfg.className} border-0`}>{cfg.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Voir" onClick={() => setDetail(item)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {item.status === "draft" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Modifier</Button>
                            <Button size="sm" variant="outline" className="border-primary/50 text-primary" onClick={() => onSubmit(item.id)}>
                              <Check className="h-3 w-3 mr-1" /> Soumettre
                            </Button>
                          </>
                        )}
                        {item.status === "submitted" && isAdmin && (
                          <>
                            <Button size="sm" variant="outline" className="border-primary/40 text-primary" onClick={() => onApprove(item.id)}>
                              <Check className="h-3 w-3 mr-1" /> Approuver
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" title="Refuser" onClick={() => { setCancelDialog({ id: item.id, action: "refuse" }); }}>
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {(item.status === "approved" || item.status === "validated") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/50 text-primary"
                            disabled={creatingPO === item.id}
                            onClick={() => handleCreatePO(item.id)}
                          >
                            {creatingPO === item.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                            Créer BC (brouillon)
                          </Button>
                        )}
                        {!locked && isAdmin && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" title="Annuler" onClick={() => setCancelDialog({ id: item.id, action: "cancel" })}>
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

      {detail && <PurchaseRequestDetail item={detail} onClose={() => setDetail(null)} />}

      <AlertDialog open={!!cancelDialog} onOpenChange={() => { setCancelDialog(null); setReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{cancelDialog?.action === "refuse" ? "Refuser la demande" : "Annuler la demande"}</AlertDialogTitle>
            <AlertDialogDescription>Indiquez un motif (optionnel).</AlertDialogDescription>
          </AlertDialogHeader>
          <Input placeholder="Motif..." value={reason} onChange={e => setReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>{cancelDialog?.action === "refuse" ? "Refuser" : "Annuler"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
