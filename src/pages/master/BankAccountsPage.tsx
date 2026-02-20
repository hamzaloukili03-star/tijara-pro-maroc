import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { useCrud } from "@/hooks/useCrud";
import { Landmark } from "lucide-react";

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  rib: string;
  swift: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  is_default: boolean;
  is_active: boolean;
}

const fields: FieldConfig[] = [
  { key: "bank_name", label: "Banque", required: true, placeholder: "Attijariwafa Bank" },
  { key: "account_name", label: "Intitulé du compte", required: true, placeholder: "Compte courant principal" },
  { key: "account_number", label: "N° de compte", placeholder: "00000000" },
  { key: "rib", label: "RIB", placeholder: "RIB complet" },
  { key: "swift", label: "SWIFT", placeholder: "BCMAMAMC", showInTable: false },
  { key: "currency", label: "Devise", defaultValue: "MAD", showInTable: false },
  { key: "initial_balance", label: "Solde initial (MAD)", type: "number", defaultValue: 0, showInTable: false },
  { key: "current_balance", label: "Solde actuel (MAD)", type: "number", defaultValue: 0,
    render: (v: number) => `${Number(v || 0).toLocaleString("fr-MA")} MAD`
  },
];

export default function BankAccountsPage() {
  const { data, loading, create, update, remove } = useCrud<BankAccount>({ table: "bank_accounts", companyScoped: true });

  return (
    <AppLayout title="Comptes Bancaires" subtitle="Gestion des comptes bancaires de l'entreprise">
      <MasterDataPage
        title="Compte bancaire"
        icon={<Landmark className="h-8 w-8" />}
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
