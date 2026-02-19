import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePurchaseRequests, usePurchaseOrders } from "@/hooks/usePurchases";
import { useStockEngine } from "@/hooks/useStockEngine";
import { PurchaseDocList } from "@/components/purchases/PurchaseDocList";
import { PurchaseFormDialog } from "@/components/purchases/PurchaseFormDialog";
import { ReceptionPanel } from "@/components/purchases/ReceptionPanel";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

const Achats = () => {
  const requests = usePurchaseRequests();
  const orders = usePurchaseOrders();
  const stock = useStockEngine();
  const [showForm, setShowForm] = useState<"request" | "order" | null>(null);
  const [tab, setTab] = useState("commandes");

  return (
    <AppLayout title="Achats" subtitle="Gestion des achats et approvisionnements">
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="demandes">Demandes d'achat</TabsTrigger>
          <TabsTrigger value="commandes">Bons de commande</TabsTrigger>
          <TabsTrigger value="receptions">Réceptions</TabsTrigger>
          <TabsTrigger value="master">Données maîtres</TabsTrigger>
        </TabsList>

        <TabsContent value="demandes">
          <PurchaseDocList
            title="Demandes d'achat"
            items={requests.items}
            loading={requests.loading}
            onCreate={() => setShowForm("request")}
            onValidate={(id) => requests.validate(id)}
            docType="request"
          />
        </TabsContent>

        <TabsContent value="commandes">
          <PurchaseDocList
            title="Bons de commande fournisseurs"
            items={orders.items}
            loading={orders.loading}
            onCreate={() => setShowForm("order")}
            onValidate={(id) => orders.validate(id)}
            onCancel={(id) => orders.cancel(id)}
            docType="order"
          />
        </TabsContent>

        <TabsContent value="receptions">
          <ReceptionPanel orders={orders} stock={stock} />
        </TabsContent>

        <TabsContent value="master">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/achats/fournisseurs" className="bg-card rounded-lg border border-border shadow-card p-6 hover:border-primary/30 hover:bg-accent/30 transition-all group">
              <Truck className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground">Fournisseurs</h3>
              <p className="text-sm text-muted-foreground mt-1">Gérez votre fichier fournisseurs.</p>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      {showForm === "order" && (
        <PurchaseFormDialog
          type="order"
          onClose={() => setShowForm(null)}
          onSubmit={async (supplierId, warehouseId, lines, notes) => {
            await orders.create(supplierId, warehouseId, lines, notes);
            setShowForm(null);
          }}
        />
      )}
      {showForm === "request" && (
        <PurchaseFormDialog
          type="request"
          onClose={() => setShowForm(null)}
          onSubmit={async (_supplierId, _warehouseId, lines, notes) => {
            await requests.create(lines.map(l => ({ product_id: l.product_id || "", description: l.description, quantity: l.quantity })), notes);
            setShowForm(null);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Achats;
