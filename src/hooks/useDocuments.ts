import { useState, useCallback } from "react";
import {
  type ERPDocument,
  type DocumentStatus,
  type DocumentLine,
  canTransition,
  calculateTotals,
  createAuditEntry,
  generateId,
} from "@/lib/document-lifecycle";
import { toast } from "@/hooks/use-toast";

export function useDocuments(module: "ventes" | "achats") {
  const [documents, setDocuments] = useState<ERPDocument[]>([]);

  const createDocument = useCallback((type: ERPDocument["type"], clientOrSupplier: string, lines: DocumentLine[]) => {
    const totals = calculateTotals(lines);
    const id = generateId();
    const prefix = type.substring(0, 3).toUpperCase();
    const doc: ERPDocument = {
      id,
      type,
      module,
      number: `${prefix}-${new Date().getFullYear()}-${String(documents.length + 1).padStart(4, "0")}`,
      date: new Date().toLocaleDateString("fr-MA"),
      status: "brouillon",
      clientOrSupplier,
      lines,
      ...totals,
      amountPaid: 0,
      notes: "",
      auditLog: [createAuditEntry(id, "Création du document", undefined, "brouillon")],
    };
    setDocuments((prev) => [doc, ...prev]);
    toast({ title: "Document créé", description: `${doc.number} créé avec succès.` });
    return doc;
  }, [documents.length, module]);

  const transitionDocument = useCallback((docId: string, toStatus: DocumentStatus) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        if (!canTransition(doc.status, toStatus)) {
          toast({
            title: "Transition impossible",
            description: `Impossible de passer de "${doc.status}" à "${toStatus}".`,
            variant: "destructive",
          });
          return doc;
        }

        const entry = createAuditEntry(docId, `Transition ${doc.status} → ${toStatus}`, doc.status, toStatus);
        let details = "";

        if (toStatus === "livre") {
          details = "Stock décrémenté automatiquement.";
        } else if (toStatus === "facture") {
          details = "Échéance de paiement générée.";
        } else if (toStatus === "annule" && doc.status === "livre") {
          details = "Stock restauré suite à annulation après livraison.";
        }

        if (details) entry.details = details;

        const updated: ERPDocument = {
          ...doc,
          status: toStatus,
          auditLog: [...doc.auditLog, entry],
        };

        toast({ title: "Statut mis à jour", description: `${doc.number} → ${toStatus}` });
        return updated;
      })
    );
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === docId);
      if (doc && doc.status !== "brouillon") {
        toast({ title: "Suppression impossible", description: "Seuls les brouillons peuvent être supprimés.", variant: "destructive" });
        return prev;
      }
      toast({ title: "Document supprimé" });
      return prev.filter((d) => d.id !== docId);
    });
  }, []);

  return { documents, createDocument, transitionDocument, deleteDocument };
}
