import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Loader2 } from "lucide-react";

interface Props {
  title: string;
  items: any[];
  loading: boolean;
  onCreate?: () => void;
  onValidate?: (id: string) => void;
  onCancel?: (id: string) => void;
  docType: "request" | "order";
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  validated: "bg-primary/15 text-primary",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};
const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  validated: "Validé",
  received: "Réceptionné",
  cancelled: "Annulé",
};

export function PurchaseDocList({ title, items, loading, onCreate, onValidate, onCancel, docType }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {onCreate && <Button onClick={onCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouveau</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun document</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>{docType === "order" ? "Fournisseur" : "Demandeur"}</TableHead>
                <TableHead>Date</TableHead>
                {docType === "order" && <TableHead className="text-right">Total TTC</TableHead>}
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.number}</TableCell>
                  <TableCell>{item.supplier?.name || "—"}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  {docType === "order" && <TableCell className="text-right font-medium">{Number(item.total_ttc || 0).toLocaleString("fr-MA")} MAD</TableCell>}
                  <TableCell>
                    <Badge className={statusColors[item.status] || ""}>{statusLabels[item.status] || item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {item.status === "draft" && onValidate && (
                      <Button size="sm" variant="outline" onClick={() => onValidate(item.id)}><Check className="h-3 w-3 mr-1" /> Valider</Button>
                    )}
                    {item.status === "draft" && onCancel && (
                      <Button size="sm" variant="ghost" onClick={() => onCancel(item.id)}><X className="h-3 w-3" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
