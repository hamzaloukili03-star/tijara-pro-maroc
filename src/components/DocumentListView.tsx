import { useState } from "react";
import {
  type ERPDocument,
  type DocumentStatus,
  type DocumentAttachment,
  STATUS_CONFIG,
  canAttach,
  isEditable,
  isFinanciallyLocked,
  isFullyLocked,
  generateId,
} from "@/lib/document-lifecycle";
import { StatusBadge } from "./StatusBadge";
import { DocumentActions } from "./DocumentActions";
import { AttachmentSection } from "./AttachmentSection";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileText, Clock, Paperclip, Info } from "lucide-react";

interface DocumentListViewProps {
  documents: ERPDocument[];
  onTransition: (docId: string, to: DocumentStatus, reason?: string) => void;
  onDelete: (docId: string) => void;
  onCreate: () => void;
  onAddAttachment?: (docId: string, attachment: DocumentAttachment) => void;
  onRemoveAttachment?: (docId: string, attachmentId: string) => void;
  moduleLabel: string;
}

export function DocumentListView({
  documents,
  onTransition,
  onDelete,
  onCreate,
  onAddAttachment,
  onRemoveAttachment,
  moduleLabel,
}: DocumentListViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [detailDocId, setDetailDocId] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    const matchSearch = d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.clientOrSupplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const detailDoc = documents.find((d) => d.id === detailDocId);

  const handleFileUpload = (docId: string, file: File) => {
    const att: DocumentAttachment = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedBy: "Utilisateur",
      uploadedAt: new Date().toLocaleDateString("fr-MA"),
    };
    onAddAttachment?.(docId, att);
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title={`Aucun document ${moduleLabel.toLowerCase()}`}
        description={`Commencez par créer votre premier document dans le module ${moduleLabel}.`}
        actionLabel="Créer un document"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | "all")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>N° Document</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client / Fournisseur</TableHead>
              <TableHead>Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc, i) => (
              <TableRow key={doc.id} className={`cursor-pointer ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                <TableCell className="font-medium">{doc.number}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.clientOrSupplier}</TableCell>
                <TableCell className="font-semibold">
                  {doc.totalTTC.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                </TableCell>
                <TableCell><StatusBadge status={doc.status} /></TableCell>
                <TableCell>
                  <DocumentActions
                    status={doc.status}
                    onTransition={(to, reason) => onTransition(doc.id, to, reason)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {doc.attachments.length > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Paperclip className="h-3 w-3" />
                        {doc.attachments.length}
                      </Badge>
                    )}
                    <button
                      onClick={() => setDetailDocId(doc.id)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Détails"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun document trouvé.</p>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailDocId} onOpenChange={() => setDetailDocId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {detailDoc?.number}
              {detailDoc && <StatusBadge status={detailDoc.status} />}
            </DialogTitle>
          </DialogHeader>

          {detailDoc && (
            <div className="space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client / Fournisseur</span>
                  <p className="font-medium text-foreground">{detailDoc.clientOrSupplier}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium text-foreground">{detailDoc.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total TTC</span>
                  <p className="font-semibold text-foreground">
                    {detailDoc.totalTTC.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payé</span>
                  <p className="font-medium text-foreground">
                    {detailDoc.amountPaid.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                  </p>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2 text-xs">
                {isEditable(detailDoc.status) && <Badge variant="outline" className="bg-primary/5">Modifiable</Badge>}
                {!isEditable(detailDoc.status) && !isFullyLocked(detailDoc.status) && <Badge variant="outline">Lecture seule</Badge>}
                {isFinanciallyLocked(detailDoc.status) && <Badge variant="outline" className="bg-destructive/5 text-destructive">Finances verrouillées</Badge>}
                {isFullyLocked(detailDoc.status) && <Badge variant="outline" className="bg-destructive/5 text-destructive">Verrouillé</Badge>}
                {detailDoc.stockMovementRecorded && <Badge variant="outline" className="bg-accent">Stock décrémenté</Badge>}
                {detailDoc.stockRestored && <Badge variant="outline" className="bg-destructive/10 text-destructive">Stock restauré</Badge>}
                {canAttach(detailDoc.status) && <Badge variant="outline" className="bg-primary/5">Pièces jointes autorisées</Badge>}
              </div>

              {/* Payment Schedule */}
              {detailDoc.paymentSchedule.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Échéancier de paiement</h4>
                  <div className="space-y-1">
                    {detailDoc.paymentSchedule.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded border border-border">
                        <span>{p.dueDate}</span>
                        <span className="font-medium">{p.amount.toLocaleString("fr-MA")} MAD</span>
                        <Badge variant={p.paid ? "default" : "outline"} className="text-[10px]">
                          {p.paid ? "Payé" : "En attente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <AttachmentSection
                attachments={detailDoc.attachments.map(a => ({
                  id: a.id,
                  name: a.name,
                  type: a.type,
                  size: a.size,
                  url: a.url,
                  uploadedBy: a.uploadedBy,
                  uploadedAt: a.uploadedAt,
                }))}
                onUpload={canAttach(detailDoc.status) ? (file) => handleFileUpload(detailDoc.id, file) : undefined}
                onDelete={canAttach(detailDoc.status) ? (attId) => onRemoveAttachment?.(detailDoc.id, attId) : undefined}
                readOnly={isFullyLocked(detailDoc.status)}
              />

              {/* Audit Log */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Historique d'audit
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailDoc.auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-xs border-b border-border pb-2 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{entry.action}</p>
                        {entry.details && <p className="text-muted-foreground">{entry.details}</p>}
                        {entry.reason && <p className="text-destructive">Motif : {entry.reason}</p>}
                        <p className="text-muted-foreground mt-0.5">
                          {entry.timestamp.toLocaleString("fr-MA")} — {entry.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
