import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { useCrud } from "@/hooks/useCrud";
import { Users } from "lucide-react";

interface Customer {
  id: string;
  code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  ice: string;
  payment_terms: string;
  credit_limit: number;
  is_active: boolean;
}

const fields: FieldConfig[] = [
  { key: "code", label: "Code", required: true, placeholder: "CLI-001" },
  { key: "name", label: "Raison sociale", required: true, placeholder: "Nom de l'entreprise" },
  { key: "contact_name", label: "Contact", placeholder: "Nom du contact" },
  { key: "email", label: "Email", type: "email", placeholder: "email@entreprise.ma" },
  { key: "phone", label: "Téléphone", placeholder: "+212..." },
  { key: "city", label: "Ville", placeholder: "Casablanca" },
  { key: "ice", label: "ICE", placeholder: "ICE", showInTable: false },
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
  { key: "credit_limit", label: "Plafond crédit (MAD)", type: "number", defaultValue: 0, showInTable: false },
  { key: "notes", label: "Notes", type: "textarea", showInTable: false },
];

export default function CustomersPage() {
  const { data, loading, create, update, remove } = useCrud<Customer>({ table: "customers", orderBy: "code", ascending: true, companyScoped: true });

  return (
    <AppLayout title="Clients" subtitle="Gestion du portefeuille clients">
      <MasterDataPage
        title="Client"
        icon={<Users className="h-8 w-8" />}
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
