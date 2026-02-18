import { useState, useCallback } from "react";
import {
  type ERPDocument,
  type DocumentStatus,
  type DocumentLine,
  type DocumentAttachment,
  canTransition,
  calculateTotals,
  createAuditEntry,
  generateId,
  generatePaymentSchedule,
  getTransitionDetails,
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
      attachments: [],
      paymentSchedule: [],
      stockMovementRecorded: false,
      stockRestored: false,
    };
    setDocuments((prev) => [doc, ...prev]);
    toast({ title: "Document créé", description: `${doc.number} créé avec succès.` });
    return doc;
  }, [documents.length, module]);

  const transitionDocument = useCallback((docId: string, toStatus: DocumentStatus, reason?: string) => {
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

        const details = getTransitionDetails(doc.status, toStatus, doc);
        const entry = createAuditEntry(docId, `Transition ${doc.status} → ${toStatus}`, doc.status, toStatus, details, reason);

        const updated: ERPDocument = {
          ...doc,
          status: toStatus,
          auditLog: [...doc.auditLog, entry],
        };

        // Stock decrement on delivery
        if (toStatus === "livre") {
          updated.stockMovementRecorded = true;
        }

        // Generate payment schedule on invoicing
        if (toStatus === "facture") {
          updated.paymentSchedule = generatePaymentSchedule(doc.totalTTC, doc.paymentCondition);
        }

        // Mark paid
        if (toStatus === "paye") {
          updated.amountPaid = doc.totalTTC;
          updated.paymentSchedule = doc.paymentSchedule.map(p => ({ ...p, paid: true, paidDate: new Date().toLocaleDateString("fr-MA") }));
        }

        // Restore stock on cancel after delivery
        if (toStatus === "annule" && (doc.status === "livre" || doc.status === "facture")) {
          updated.stockRestored = true;
        }

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

  const addAttachment = useCallback((docId: string, attachment: DocumentAttachment) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        if (doc.status === "clos" || doc.status === "annule") {
          toast({ title: "Action impossible", description: "Impossible d'ajouter des pièces jointes sur un document clos ou annulé.", variant: "destructive" });
          return doc;
        }
        const entry = createAuditEntry(docId, `Pièce jointe ajoutée : ${attachment.name}`, doc.status, doc.status);
        return {
          ...doc,
          attachments: [...doc.attachments, attachment],
          auditLog: [...doc.auditLog, entry],
        };
      })
    );
  }, []);

  const removeAttachment = useCallback((docId: string, attachmentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        if (doc.status === "clos" || doc.status === "annule") {
          toast({ title: "Action impossible", description: "Document verrouillé.", variant: "destructive" });
          return doc;
        }
        const att = doc.attachments.find(a => a.id === attachmentId);
        const entry = createAuditEntry(docId, `Pièce jointe supprimée : ${att?.name || ""}`, doc.status, doc.status);
        return {
          ...doc,
          attachments: doc.attachments.filter(a => a.id !== attachmentId),
          auditLog: [...doc.auditLog, entry],
        };
      })
    );
  }, []);

  return { documents, createDocument, transitionDocument, deleteDocument, addAttachment, removeAttachment };
}
