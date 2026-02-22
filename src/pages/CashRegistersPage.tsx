import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function CashRegistersPage() {
  const { registers, movements, loading, create, addMovement, fetchMovements } = useCashRegisters();
  const [showCreate, setShowCreate] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  // Create form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);

  // Movement form
  const [mvtType, setMvtType] = useState<"in" | "out">("in");
  const [mvtAmount, setMvtAmount] = useState(0);
  const [mvtRef, setMvtRef] = useState("");
  const [mvtNotes, setMvtNotes] = useState("");

  useEffect(() => {
    (supabase as any).from("warehouses").select("id, name").eq("is_active", true).then(({ data }: any) => setWarehouses(data || []));
  }, []);

  const handleCreate = async () => {
    // Front-end uniqueness checks
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    
    if (registers.some(r => r.code.toLowerCase() === trimmedCode.toLowerCase())) {
      toast({ title: "Erreur", description: "Code caisse déjà utilisé.", variant: "destructive" });
      return;
    }
    if (registers.some(r => r.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({ title: "Erreur", description: "Nom de caisse déjà utilisé.", variant: "destructive" });
      return;
    }

    setCreating(true);
    const ok = await create({ name: trimmedName, code: trimmedCode, warehouse_id: warehouseId || null, opening_balance: openingBalance } as any);
    setCreating(false);
    if (ok) {
      setShowCreate(false);
      setName(""); setCode(""); setOpeningBalance(0); setWarehouseId("");
    }
  };

  const handleAddMovement = async () => {
    if (!showMovement || mvtAmount <= 0) return;
    await addMovement(showMovement, mvtType, mvtAmount, mvtRef, mvtNotes);
    setShowMovement(null);
    setMvtAmount(0); setMvtRef(""); setMvtNotes("");
  };

  const viewMovements = async (registerId: string) => {
    setSelectedRegister(registerId);
    await fetchMovements(registerId);
  };

  return (
    <AppLayout title="Caisses enregistreuses" subtitle="Gestion des caisses et mouvements d'espèces">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Caisses</h2>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Nouvelle caisse</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : registers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune caisse configurée</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registers.map(r => (
              <Card key={r.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => viewMovements(r.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{r.name}</CardTitle>
                    <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.code} {r.warehouse?.name ? `— ${r.warehouse.name}` : ""}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{Number(r.current_balance).toLocaleString("fr-MA")} MAD</p>
                  <p className="text-xs text-muted-foreground mt-1">Solde d'ouverture: {Number(r.opening_balance).toLocaleString("fr-MA")} MAD</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={(e) => { e.stopPropagation(); setShowMovement(r.id); }}>
                    Mouvement
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Movements list */}
        {selectedRegister && movements.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Mouvements récents</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.created_at).toLocaleDateString("fr-MA")}</TableCell>
                      <TableCell>
                        {m.movement_type === "in" ? <ArrowDownCircle className="h-4 w-4 text-green-600 inline mr-1" /> : <ArrowUpCircle className="h-4 w-4 text-destructive inline mr-1" />}
                        {m.movement_type === "in" ? "Entrée" : m.movement_type === "out" ? "Sortie" : m.movement_type}
                      </TableCell>
                      <TableCell className="text-right font-medium">{Number(m.amount).toLocaleString("fr-MA")} MAD</TableCell>
                      <TableCell className="text-sm">{m.reference || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <Dialog open onOpenChange={() => setShowCreate(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle caisse</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nom *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Caisse principale" /></div>
              <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CAISSE-01" /></div>
              <div>
                <Label>Dépôt (optionnel)</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Solde d'ouverture</Label><Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={!name.trim() || !code.trim() || creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Movement Dialog */}
      {showMovement && (
        <Dialog open onOpenChange={() => setShowMovement(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau mouvement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={mvtType} onValueChange={(v) => setMvtType(v as "in" | "out")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrée</SelectItem>
                    <SelectItem value="out">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Montant</Label><Input type="number" value={mvtAmount} onChange={(e) => setMvtAmount(Number(e.target.value))} /></div>
              <div><Label>Référence</Label><Input value={mvtRef} onChange={(e) => setMvtRef(e.target.value)} placeholder="REF-001" /></div>
              <div><Label>Notes</Label><Input value={mvtNotes} onChange={(e) => setMvtNotes(e.target.value)} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMovement(null)}>Annuler</Button>
                <Button onClick={handleAddMovement} disabled={mvtAmount <= 0}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
