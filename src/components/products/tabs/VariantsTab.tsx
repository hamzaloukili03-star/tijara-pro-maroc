import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductAttributes, useProductVariants } from "@/hooks/useProducts";
import { Plus, Trash2, Wand2, X, Loader2, Pencil, Check, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";

interface VariantsTabProps {
  productId: string | null;
}

export function VariantsTab({ productId }: VariantsTabProps) {
  const { attributes, createAttribute, addAttributeValue, deleteAttributeValue } = useProductAttributes();
  const { variants, loading: variantsLoading, generateVariants, updateVariant, deleteVariant } = useProductVariants(productId);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState("dropdown");
  const [newValueMap, setNewValueMap] = useState<Record<string, string>>({});
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<string, any>>({});

  // Auto-select attributes already linked to this product
  useEffect(() => {
    if (!productId || !attributes.length) return;
    const loadExistingSelection = async () => {
      const { data: lines } = await (supabase as any)
        .from("product_attribute_lines")
        .select("id, attribute_id")
        .eq("product_id", productId);
      if (!lines || lines.length === 0) return;

      const lineIds = lines.map((l: any) => l.id);
      const { data: lineValues } = await (supabase as any)
        .from("product_attribute_line_values")
        .select("line_id, value_id")
        .in("line_id", lineIds);

      const sel: Record<string, string[]> = {};
      for (const line of lines) {
        sel[line.attribute_id] = (lineValues || [])
          .filter((lv: any) => lv.line_id === line.id)
          .map((lv: any) => lv.value_id);
      }
      setSelectedAttrs(sel);
    };
    loadExistingSelection();
  }, [productId, attributes]);

  if (!productId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-lg font-medium">Enregistrez d'abord le produit</p>
        <p className="text-sm mt-1">Les attributs et variantes seront disponibles après la création du produit.</p>
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
      toast({ title: "Sélectionnez des valeurs", description: "Cliquez sur les valeurs d'attributs à inclure.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    // Save attribute lines to DB
    for (const line of lines) {
      const { data: lineData } = await (supabase as any)
        .from("product_attribute_lines")
        .upsert(
          { product_id: productId, attribute_id: line.attribute_id, company_id: companyId },
          { onConflict: "product_id,attribute_id" }
        )
        .select()
        .single();
      if (lineData) {
        for (const vid of line.value_ids) {
          await (supabase as any)
            .from("product_attribute_line_values")
            .upsert(
              { line_id: lineData.id, value_id: vid, company_id: companyId },
              { onConflict: "line_id,value_id" }
            );
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

  const combinationCount = Object.values(selectedAttrs)
    .filter((v) => v.length > 0)
    .reduce((acc, v) => acc * v.length, 1);
  const hasSelection = Object.values(selectedAttrs).some((v) => v.length > 0);

  return (
    <div className="space-y-8">
      {/* ── Attribute Management ── */}
      <div>
        <h3 className="text-base font-semibold mb-4">Attributs disponibles</h3>
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <Label>Nouvel attribut</Label>
            <Input
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              placeholder="Ex: Poids, Couleur, Taille..."
              onKeyDown={(e) => e.key === "Enter" && handleCreateAttribute()}
            />
          </div>
          <div className="w-40">
            <Label>Type d'affichage</Label>
            <select
              value={newAttrType}
              onChange={(e) => setNewAttrType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="dropdown">Liste déroulante</option>
              <option value="radio">Boutons radio</option>
              <option value="color">Pastille couleur</option>
            </select>
          </div>
          <Button onClick={handleCreateAttribute} size="sm" className="gap-1" disabled={!newAttrName.trim()}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="space-y-4">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">{attr.name}</span>
                <Badge variant="outline" className="text-xs">{attr.display_type === "color" ? "Couleur" : attr.display_type === "radio" ? "Radio" : "Liste"}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {attr.values.map((v) => {
                  const isSelected = (selectedAttrs[attr.id] || []).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleAttrValue(attr.id, v.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {attr.display_type === "color" && v.color_hex && (
                        <span className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: v.color_hex }} />
                      )}
                      {v.value}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAttributeValue(v.id); }}
                        className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  );
                })}
                {attr.values.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Aucune valeur définie</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newValueMap[attr.id] || ""}
                  onChange={(e) => setNewValueMap((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                  placeholder="Ajouter une valeur..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddValue(attr.id)}
                />
                <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => handleAddValue(attr.id)} disabled={!newValueMap[attr.id]?.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {attributes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Créez un attribut ci-dessus (ex: Poids, Couleur) puis ajoutez ses valeurs.
            </p>
          )}
        </div>
      </div>

      {/* ── Generate Button ── */}
      <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border">
        <Button onClick={handleGenerate} disabled={generating || !hasSelection} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Générer les variantes
        </Button>
        <span className="text-sm text-muted-foreground">
          {hasSelection
            ? `${combinationCount} combinaison(s) possible(s)`
            : "Sélectionnez des valeurs d'attributs ci-dessus"}
        </span>
      </div>

      {/* ── Variants Table ── */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3">Variantes générées ({variants.length})</h3>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Variante</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Code-barres</TableHead>
                  <TableHead className="text-right">Prix vente</TableHead>
                  <TableHead className="text-right">Coût d'achat</TableHead>
                  <TableHead className="text-center">Actif</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : variants.map((v) => {
                  const isEditing = editingVariant === v.id;
                  const edits = variantEdits[v.id] || {};
                  return (
                    <TableRow key={v.id} className={!v.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                        ) : (
                          <span className="text-sm">{v.sku || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-32" value={edits.barcode ?? v.barcode ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, barcode: e.target.value } }))} />
                        ) : (
                          <span className="text-sm">{v.barcode || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input className="h-8 w-24 text-right" type="number" step="0.01" value={edits.sale_price ?? v.sale_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, sale_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (
                          <span className="text-sm">{v.sale_price != null ? `${Number(v.sale_price).toLocaleString("fr-MA")} MAD` : <span className="text-muted-foreground">Parent</span>}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input className="h-8 w-24 text-right" type="number" step="0.01" value={edits.purchase_price ?? v.purchase_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, purchase_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (
                          <span className="text-sm">{v.purchase_price != null ? `${Number(v.purchase_price).toLocaleString("fr-MA")} MAD` : <span className="text-muted-foreground">Parent</span>}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
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
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => handleVariantSave(v.id)}>
                              <Check className="h-3 w-3" /> OK
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingVariant(v.id)} title="Modifier">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteVariant(v.id)} title="Supprimer">
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
