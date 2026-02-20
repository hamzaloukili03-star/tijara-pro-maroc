import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, ArrowRight, Loader2, Paperclip, Eye, Send } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { DocAttachmentsDialog } from "@/components/DocAttachmentsDialog";
import { useCompany } from "@/hooks/useCompany";
import { printSalesDocPdf } from "@/lib/pdf";
import { PrintButton } from "@/components/PrintButton";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import {
  QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
} from "@/hooks/useSales";

interface Props {
  title: string;
  items: any[];
  loading: boolean;
  onCreate?: () => void;
  onView?: (id: string) => void;
  onValidate?: (id: string) => void;
  onCancel?: (id: string) => void;
  onConvert?: (id: string, warehouseId: string) => void;
  onAdminValidate?: (id: string) => void;
  docType: "quotation" | "order";
}

export function SalesDocList({
  title, items, loading, onCreate, onView,
  onValidate, onCancel, onConvert, onAdminValidate, docType,
}: Props) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>("");
  const [attachDialog, setAttachDialog] = useState<{ id: string; number: string } | null>(null);
  const { activeCompany } = useCompany();
  const { settings: companySettings } = useCompanySettings();

  useEffect(() => {
    (supabase as any).from("warehouses").select("id, name").eq("is_active", true).then(({ data }: any) => {
      setWarehouses(data || []);
      if (data?.length) setSelectedWh(data[0].id);
    });
  }, []);

  const handlePrint = async (item: any, download = false) => {
    const { data: lines } = await (supabase as any)
      .from(docType === "quotation" ? "quotation_lines" : "sales_order_lines")
      .select("*, product:products(code,name,unit,tva_rate)")
      .eq(docType === "quotation" ? "quotation_id" : "sales_order_id", item.id)
      .order("sort_order");
    await printSalesDocPdf(item, lines || [], docType === "quotation" ? "devis" : "commande_client", activeCompany?.id, download);
  };

  const statusLabels = docType === "quotation" ? QUOTATION_STATUS_LABELS : ORDER_STATUS_LABELS;
  const statusColors = docType === "quotation" ? QUOTATION_STATUS_COLORS : ORDER_STATUS_COLORS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {onCreate && (
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nouveau
          </Button>
        )}
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
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm font-medium">{item.number}</TableCell>
                  <TableCell>{item.customer?.name || "—"}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(item.total_ttc).toLocaleString("fr-MA")} MAD
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[item.status] || "bg-muted text-muted-foreground"} border text-xs`}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {/* View / Open */}
                      {onView && (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => onView(item.id)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Ouvrir
                        </Button>
                      )}

                      {/* Print */}
                      <PrintButton iconOnly onPrint={() => handlePrint(item)} onDownload={() => handlePrint(item, true)} />

                      {/* Attachments */}
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0" title="Pièces jointes"
                        onClick={() => setAttachDialog({ id: item.id, number: item.number })}
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>

                      {/* Quotation: mark sent */}
                      {docType === "quotation" && item.status === "draft" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onValidate?.(item.id)}>
                          <Send className="h-3 w-3 mr-1" /> Envoyer
                        </Button>
                      )}

                      {/* Quotation: confirm */}
                      {docType === "quotation" && item.status === "sent" && onValidate && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-success/50 text-success" onClick={() => onValidate(item.id)}>
                          <Check className="h-3 w-3 mr-1" /> Confirmer
                        </Button>
                      )}

                      {/* Pending admin validation */}
                      {item.status === "pending_admin" && onAdminValidate && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-warning/50 text-warning-foreground" onClick={() => onAdminValidate(item.id)}>
                          <Check className="h-3 w-3 mr-1" /> Approuver
                        </Button>
                      )}

                      {/* Order: confirm */}
                      {docType === "order" && item.status === "draft" && onValidate && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onValidate(item.id)}>
                          <Check className="h-3 w-3 mr-1" /> Confirmer
                        </Button>
                      )}

                      {/* Convert quotation → order */}
                      {item.status === "confirmed" && onConvert && docType === "quotation" && (
                        <div className="inline-flex items-center gap-1">
                          <Select value={selectedWh} onValueChange={setSelectedWh}>
                            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="h-8 text-xs" onClick={() => onConvert(item.id, selectedWh)}>
                            <ArrowRight className="h-3 w-3 mr-1" /> Créer BC
                          </Button>
                        </div>
                      )}

                      {/* Cancel */}
                      {["draft", "sent", "confirmed"].includes(item.status) && onCancel && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Annuler" onClick={() => onCancel(item.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {attachDialog && (
        <DocAttachmentsDialog
          open={!!attachDialog}
          onClose={() => setAttachDialog(null)}
          docType={docType === "quotation" ? "quotation" : "sales_order"}
          docId={attachDialog.id}
          docNumber={attachDialog.number}
          companyId={activeCompany?.id}
        />
      )}
    </div>
  );
}
