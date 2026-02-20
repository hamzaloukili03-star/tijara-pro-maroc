import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { useCrud } from "@/hooks/useCrud";
import { Truck } from "lucide-react";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  ice: string;
  payment_terms: string;
  is_active: boolean;
}

const fields: FieldConfig[] = [
  { key: "code", label: "Code", required: true, placeholder: "FRN-001" },
  { key: "name", label: "Raison sociale", required: true, placeholder: "Nom du fournisseur" },
  { key: "contact_name", label: "Contact", placeholder: "Nom du contact" },
  { key: "email", label: "Email", type: "email", placeholder: "email@fournisseur.ma" },
  { key: "phone", label: "Téléphone", placeholder: "+212..." },
  { key: "city", label: "Ville", placeholder: "Casablanca" },
  { key: "ice", label: "ICE", showInTable: false },
  { key: "rc", label: "RC", showInTable: false },
  { key: "if_number", label: "IF", showInTable: false },
  { key: "patente", label: "Patente", showInTable: false },
  { key: "address", label: "Adresse", type: "textarea", showInTable: false },
  { key: "payment_terms", label: "Conditions de paiement", type: "select", defaultValue: "30j", options: [
    { value: "comptant", label: "Comptant" },
    { value: "30j", label: "30 jours" },
    { value: "60j", label: "60 jours" },
    { value: "90j", label: "90 jours" },
  ], showInTable: false },
  { key: "notes", label: "Notes", type: "textarea", showInTable: false },
];

export default function SuppliersPage() {
  const { data, loading, create, update, remove } = useCrud<Supplier>({ table: "suppliers", orderBy: "code", ascending: true, companyScoped: true });

  return (
    <AppLayout title="Fournisseurs" subtitle="Gestion des fournisseurs">
      <MasterDataPage
        title="Fournisseur"
        icon={<Truck className="h-8 w-8" />}
        data={data}
        loading={loading}
        fields={fields}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
      />
    </AppLayout>
  );
}
