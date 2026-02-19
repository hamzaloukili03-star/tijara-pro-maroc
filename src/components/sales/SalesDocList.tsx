import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Props {
  title: string;
  items: any[];
  loading: boolean;
  onCreate?: () => void;
  onValidate?: (id: string) => void;
  onCancel?: (id: string) => void;
  onConvert?: (id: string, warehouseId: string) => void;
  docType: "quotation" | "order";
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  validated: "bg-primary/15 text-primary",
  converted: "bg-accent text-accent-foreground",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};
const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  validated: "Validé",
  converted: "Converti",
  delivered: "Livré",
  cancelled: "Annulé",
};

export function SalesDocList({ title, items, loading, onCreate, onValidate, onCancel, onConvert, docType }: Props) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>("");

  useEffect(() => {
    (supabase as any).from("warehouses").select("id, name").eq("is_active", true).then(({ data }: any) => {
      setWarehouses(data || []);
      if (data?.length) setSelectedWh(data[0].id);
    });
  }, []);

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
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.number}</TableCell>
                  <TableCell>{item.customer?.name || "—"}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="text-right font-medium">{Number(item.total_ttc).toLocaleString("fr-MA")} MAD</TableCell>
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
                    {item.status === "validated" && onConvert && docType === "quotation" && (
                      <div className="inline-flex items-center gap-1">
                        <Select value={selectedWh} onValueChange={setSelectedWh}>
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => onConvert(item.id, selectedWh)}><ArrowRight className="h-3 w-3 mr-1" /> BC</Button>
                      </div>
                    )}
                    {item.status === "validated" && onCancel && (
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
