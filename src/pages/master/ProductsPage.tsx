import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { useCrud } from "@/hooks/useCrud";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  purchase_price: number;
  sale_price: number;
  tva_rate: number;
  min_stock: number;
  is_active: boolean;
}

const fields: FieldConfig[] = [
  { key: "code", label: "Code", required: true, placeholder: "ART-001" },
  { key: "name", label: "Désignation", required: true, placeholder: "Nom du produit" },
  { key: "category", label: "Catégorie", placeholder: "Ex: Matières premières" },
  { key: "unit", label: "Unité", required: true, placeholder: "Unité, Kg, L...", defaultValue: "Unité" },
  { key: "purchase_price", label: "Prix d'achat (MAD)", type: "number", required: true, defaultValue: 0 },
  { key: "sale_price", label: "Prix de vente (MAD)", type: "number", required: true, defaultValue: 0 },
  { key: "tva_rate", label: "TVA (%)", type: "number", defaultValue: 20 },
  { key: "min_stock", label: "Stock minimum", type: "number", defaultValue: 0 },
  { key: "barcode", label: "Code-barres", placeholder: "EAN13", showInTable: false },
  { key: "description", label: "Description", type: "textarea", showInTable: false },
];

const tableFields: FieldConfig[] = fields.map(f => {
  if (f.key === "purchase_price" || f.key === "sale_price") {
    return { ...f, showInTable: true, render: (v: number) => `${Number(v || 0).toLocaleString("fr-MA")} MAD` };
  }
  if (f.key === "tva_rate") {
    return { ...f, showInTable: true, render: (v: number) => `${v}%` };
  }
  return f;
});

export default function ProductsPage() {
  const { data, loading, create, update, remove } = useCrud<Product>({ table: "products", orderBy: "code", ascending: true });

  return (
    <AppLayout title="Produits & Articles" subtitle="Catalogue des produits et services">
      <MasterDataPage
        title="Produit"
        icon={<Package className="h-8 w-8" />}
        data={data}
        loading={loading}
        fields={tableFields}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
      />
    </AppLayout>
  );
}
