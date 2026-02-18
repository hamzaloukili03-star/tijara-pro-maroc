import { AppLayout } from "@/components/AppLayout";
import { DocumentListView } from "@/components/DocumentListView";
import { useDocuments } from "@/hooks/useDocuments";

const sampleLines = [
  { ref: "MAT-001", description: "Matière première X", qty: 100, unitPrice: 25.0, tva: 20 },
  { ref: "MAT-002", description: "Fourniture Y", qty: 50, unitPrice: 80.0, tva: 20 },
];

const Achats = () => {
  const { documents, createDocument, transitionDocument, deleteDocument, addAttachment, removeAttachment } = useDocuments("achats");

  const handleCreate = () => {
    createDocument("bon-commande", "Fournisseur Exemple SARL", sampleLines);
  };

  return (
    <AppLayout title="Achats" subtitle="Gestion des achats et fournisseurs">
      <DocumentListView
        documents={documents}
        onTransition={transitionDocument}
        onDelete={deleteDocument}
        onCreate={handleCreate}
        onAddAttachment={addAttachment}
        onRemoveAttachment={removeAttachment}
        moduleLabel="Achats"
      />
    </AppLayout>
  );
};

export default Achats;
