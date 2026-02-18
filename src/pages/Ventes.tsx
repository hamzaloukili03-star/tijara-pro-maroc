import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DocumentListView } from "@/components/DocumentListView";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "@/hooks/use-toast";

const sampleLines = [
  { ref: "ART-001", description: "Produit A", qty: 10, unitPrice: 150.0, tva: 20 },
  { ref: "ART-002", description: "Service B", qty: 5, unitPrice: 300.0, tva: 20 },
];

const Ventes = () => {
  const { documents, createDocument, transitionDocument, deleteDocument } = useDocuments("ventes");

  const handleCreate = () => {
    createDocument("devis", "Client Exemple SA", sampleLines);
  };

  return (
    <AppLayout title="Ventes" subtitle="Gestion commerciale et suivi des ventes">
      <DocumentListView
        documents={documents}
        onTransition={transitionDocument}
        onDelete={deleteDocument}
        onCreate={handleCreate}
        moduleLabel="Ventes"
      />
    </AppLayout>
  );
};

export default Ventes;
