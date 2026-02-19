import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductAttributes, useProductVariants } from "@/hooks/useProducts";
import { Plus, Trash2, Wand2, X, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VariantsTabProps {
  productId: string | null;
}

export function VariantsTab({ productId }: VariantsTabProps) {
  const { attributes, createAttribute, addAttributeValue, deleteAttributeValue, fetchAttributes } = useProductAttributes();
  const { variants, loading: variantsLoading, generateVariants, updateVariant, deleteVariant } = useProductVariants(productId);

  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState("dropdown");
  const [newValueMap, setNewValueMap] = useState<Record<string, string>>({});
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<string, any>>({});

  if (!productId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Enregistrez d'abord le produit</p>
        <p className="text-sm mt-1">Les variantes seront disponibles après la création.</p>
      </div>
    );
  }

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim()) return;
    await createAttribute(newAttrName.trim(), newAttrType);
    setNewAttrName("");
  };

  const handleAddValue = async (attrId: string) => {
    const val = newValueMap[attrId]?.trim();
    if (!val) return;
    await addAttributeValue(attrId, val);
    setNewValueMap((prev) => ({ ...prev, [attrId]: "" }));
  };

  const toggleAttrValue = (attrId: string, valueId: string) => {
    setSelectedAttrs((prev) => {
      const current = prev[attrId] || [];
      const next = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      return { ...prev, [attrId]: next };
    });
  };

  const handleGenerate = async () => {
    const lines = Object.entries(selectedAttrs)
      .filter(([, vals]) => vals.length > 0)
      .map(([attrId, vals]) => ({ attribute_id: attrId, value_ids: vals }));
    if (lines.length === 0) {
      toast({ title: "Sélectionnez des valeurs", variant: "destructive" });
      return;
    }

    // Save attribute lines to DB
    setGenerating(true);
    for (const line of lines) {
      const { data: lineData } = await (supabase as any)
        .from("product_attribute_lines")
        .upsert({ product_id: productId, attribute_id: line.attribute_id }, { onConflict: "product_id,attribute_id" })
        .select()
        .single();
      if (lineData) {
        for (const vid of line.value_ids) {
          await (supabase as any)
            .from("product_attribute_line_values")
            .upsert({ line_id: lineData.id, value_id: vid }, { onConflict: "line_id,value_id" });
        }
      }
    }
    await generateVariants(productId, lines);
    setGenerating(false);
  };

  const handleVariantSave = async (variantId: string) => {
    const edits = variantEdits[variantId];
    if (!edits) return;
    await updateVariant(variantId, edits);
    setEditingVariant(null);
    setVariantEdits((prev) => { const n = { ...prev }; delete n[variantId]; return n; });
  };

  return (
    <div className="space-y-8">
      {/* Attribute Management */}
      <div>
        <h3 className="text-base font-semibold mb-4">Attributs disponibles</h3>
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <Label>Nouvel attribut</Label>
            <Input value={newAttrName} onChange={(e) => setNewAttrName(e.target.value)} placeholder="Ex: Taille, Couleur..." />
          </div>
          <div className="w-40">
            <Label>Type d'affichage</Label>
            <select
              value={newAttrType}
              onChange={(e) => setNewAttrType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="dropdown">Liste déroulante</option>
              <option value="radio">Boutons radio</option>
              <option value="color">Pastille couleur</option>
            </select>
          </div>
          <Button onClick={handleCreateAttribute} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="space-y-4">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{attr.name}</span>
                <Badge variant="outline" className="text-xs">{attr.display_type}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {attr.values.map((v) => {
                  const isSelected = (selectedAttrs[attr.id] || []).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleAttrValue(attr.id, v.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {attr.display_type === "color" && v.color_hex && (
                        <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: v.color_hex }} />
                      )}
                      {v.value}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAttributeValue(v.id); }}
                        className="ml-1 opacity-50 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newValueMap[attr.id] || ""}
                  onChange={(e) => setNewValueMap((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                  placeholder="Nouvelle valeur..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddValue(attr.id)}
                />
                <Button size="sm" variant="outline" className="h-8" onClick={() => handleAddValue(attr.id)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Générer variantes
        </Button>
        <span className="text-sm text-muted-foreground">
          {Object.values(selectedAttrs).filter((v) => v.length > 0).length > 0
            ? `${Object.values(selectedAttrs).reduce((acc, v) => acc * (v.length || 1), 1)} combinaisons`
            : "Sélectionnez des valeurs ci-dessus"}
        </span>
      </div>

      {/* Variants Table */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3">Variantes ({variants.length})</h3>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Variante</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Prix vente</TableHead>
                  <TableHead>Prix achat</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
                ) : variants.map((v) => {
                  const isEditing = editingVariant === v.id;
                  const edits = variantEdits[v.id] || {};
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {v.attribute_values.map((av, i) => (
                            <Badge key={i} variant="secondary" className="text-xs gap-1">
                              {av.color_hex && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: av.color_hex }} />}
                              {av.value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-28" value={edits.sku ?? v.sku ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, sku: e.target.value } }))} />
                        ) : (v.sku || "—")}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-24" type="number" value={edits.sale_price ?? v.sale_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, sale_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (v.sale_price != null ? `${v.sale_price.toLocaleString("fr-MA")} MAD` : "Parent")}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-24" type="number" value={edits.purchase_price ?? v.purchase_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, purchase_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (v.purchase_price != null ? `${v.purchase_price.toLocaleString("fr-MA")} MAD` : "Parent")}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={isEditing ? (edits.is_active ?? v.is_active) : v.is_active}
                          onCheckedChange={(val) => {
                            if (isEditing) {
                              setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, is_active: val } }));
                            } else {
                              updateVariant(v.id, { is_active: val } as any);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleVariantSave(v.id)}>OK</Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingVariant(v.id)}>
                              <span className="text-xs">✏️</span>
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteVariant(v.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
