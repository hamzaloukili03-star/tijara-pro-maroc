import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Copy, RotateCcw, Eye, GripVertical,
  ChevronUp, ChevronDown, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDocumentTemplates,
  TEMPLATE_DOC_LABELS,
  getDefaultTemplate,
  type TemplateDocType,
  type TemplateConfig,
  type TemplateBlock,
  type DocumentTemplate,
} from "@/hooks/useDocumentTemplates";
import { TemplatePreview } from "@/components/conception/TemplatePreview";

export default function TemplateEditorPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const docType = type as TemplateDocType;
  const { fetchTemplate, saveTemplate, saveAsCopy, restoreDefault, loading } = useDocumentTemplates();

  const [existingId, setExistingId] = useState<string | undefined>();
  const [config, setConfig] = useState<TemplateConfig>(getDefaultTemplate());
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("logo");
  const [showPreview, setShowPreview] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const tpl = await fetchTemplate(docType);
      if (tpl) {
        setConfig(tpl.template_json as unknown as TemplateConfig);
        setExistingId(tpl.id);
      } else {
        setConfig(getDefaultTemplate());
        setExistingId(undefined);
      }
      setInitialized(true);
    })();
  }, [docType, fetchTemplate]);

  const selectedBlock = config.blocks.find((b) => b.id === selectedBlockId);

  const updateBlock = useCallback((blockId: string, updates: Partial<TemplateBlock>) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }));
  }, []);

  const updateBlockStyle = useCallback((blockId: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, styles: { ...b.styles, [key]: value } } : b
      ),
    }));
  }, []);

  const updateBlockField = useCallback((blockId: string, field: string, visible: boolean) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, fields: { ...b.fields, [field]: visible } } : b
      ),
    }));
  }, []);

  const updateGlobalStyle = useCallback((key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      globalStyles: { ...prev.globalStyles, [key]: value },
    }));
  }, []);

  const moveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    setConfig((prev) => {
      const sorted = [...prev.blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === blockId);
      if (direction === "up" && idx > 0) {
        const tmp = sorted[idx].order;
        sorted[idx].order = sorted[idx - 1].order;
        sorted[idx - 1].order = tmp;
      } else if (direction === "down" && idx < sorted.length - 1) {
        const tmp = sorted[idx].order;
        sorted[idx].order = sorted[idx + 1].order;
        sorted[idx + 1].order = tmp;
      }
      return { ...prev, blocks: sorted };
    });
  }, []);

  const handleSave = async () => {
    await saveTemplate(docType, config, existingId);
  };

  const handleSaveAsCopy = async () => {
    const result = await saveAsCopy(docType, config);
    if (result) setExistingId(result.id);
  };

  const handleRestore = async () => {
    await restoreDefault(docType);
    setConfig(getDefaultTemplate());
    setExistingId(undefined);
    toast.success("Template par défaut restauré");
  };

  if (!initialized) {
    return (
      <AppLayout title="Chargement...">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Chargement du template...
        </div>
      </AppLayout>
    );
  }

  const sortedBlocks = [...config.blocks].sort((a, b) => a.order - b.order);

  const FIELD_LABELS: Record<string, string> = {
    logo: "Logo", company_name: "Raison sociale", forme_juridique: "Forme juridique",
    address: "Adresse", phone: "Téléphone", email: "Email",
    date: "Date", due_date: "Date d'échéance", payment_terms: "Conditions de paiement",
    origin_ref: "Réf. origine",
    name: "Nom", ice: "ICE", rc: "RC", if_number: "IF",
    ref: "Référence", description: "Désignation", qty: "Quantité", unit: "Unité",
    unit_price: "Prix unitaire", discount: "Remise", tva: "TVA",
    total_ht: "Total HT", total_ttc: "Total TTC", total_tva: "Total TVA",
    amount_paid: "Montant payé", remaining: "Solde restant",
    bank_name: "Banque", account_name: "Titulaire", rib: "RIB", swift: "SWIFT",
    patente: "Patente", capital: "Capital", cnss: "CNSS",
  };

  return (
    <AppLayout
      title={`Éditeur — ${TEMPLATE_DOC_LABELS[docType]}`}
      subtitle="Personnalisez la mise en page du document"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate("/systeme/conception")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5">
          <Eye className="h-4 w-4" /> {showPreview ? "Masquer aperçu" : "Aperçu"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleRestore} className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Restaurer défaut
        </Button>
        <Button variant="outline" size="sm" onClick={handleSaveAsCopy} disabled={loading} className="gap-1.5">
          <Copy className="h-4 w-4" /> Copie
        </Button>
        <Button size="sm" onClick={handleSave} disabled={loading} className="gap-1.5">
          <Save className="h-4 w-4" /> Sauvegarder
        </Button>
      </div>

      {showPreview ? (
        <TemplatePreview config={config} docType={docType} />
      ) : (
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: "70vh" }}>
          {/* LEFT: Blocks list */}
          <div className="col-span-3">
            <Card className="p-3">
              <h3 className="text-sm font-semibold text-foreground mb-2">Blocs</h3>
              <div className="space-y-1">
                {sortedBlocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                      selectedBlockId === block.id
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-muted text-foreground"
                    } ${!block.visible ? "opacity-50" : ""}`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{block.label}</span>
                    {!block.visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                      disabled={idx === 0}
                      className="p-0.5 hover:bg-muted-foreground/10 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                      disabled={idx === sortedBlocks.length - 1}
                      className="p-0.5 hover:bg-muted-foreground/10 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CENTER: A4 mini preview */}
          <div className="col-span-5">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Aperçu A4</h3>
              <div
                className="mx-auto bg-background border border-border rounded shadow-sm overflow-hidden"
                style={{ width: "100%", maxWidth: 380, aspectRatio: "210/297" }}
              >
                <div className="p-3 space-y-1.5 text-[6px] text-muted-foreground">
                  {sortedBlocks.filter((b) => b.visible).map((block) => (
                    <div
                      key={block.id}
                      className={`rounded px-1.5 py-1 border transition-colors cursor-pointer ${
                        selectedBlockId === block.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-border"
                      }`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {block.type === "logo" && (
                        <div className="flex justify-between">
                          <div>
                            <div className="w-12 h-3 bg-primary/20 rounded mb-0.5" />
                            <div className="font-bold text-[7px]" style={{ color: config.globalStyles.secondaryColor }}>
                              Ma Société
                            </div>
                          </div>
                          <div className="w-10 h-6 bg-muted rounded" />
                        </div>
                      )}
                      {block.type === "title" && (
                        <div
                          className="rounded px-1.5 py-0.5 text-center font-bold text-[8px]"
                          style={{
                            backgroundColor: block.styles.backgroundColor || config.globalStyles.secondaryColor,
                            color: block.styles.color || "#fff",
                          }}
                        >
                          {TEMPLATE_DOC_LABELS[docType]}
                        </div>
                      )}
                      {block.type === "doc_info" && (
                        <div className="flex gap-1">
                          {["Date", "Échéance", "Conditions"].map((l) => (
                            <div key={l} className="flex-1 bg-muted/50 rounded px-1 py-0.5 border-l-2 border-primary/40">
                              <div className="text-[5px] font-semibold uppercase">{l}</div>
                              <div className="text-[5px]">---</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {block.type === "party" && (
                        <div className="flex gap-1">
                          {["CLIENT", "ÉMETTEUR"].map((l) => (
                            <div key={l} className="flex-1 border border-border rounded overflow-hidden">
                              <div className="text-[5px] font-bold px-1 py-0.5" style={{ backgroundColor: config.globalStyles.secondaryColor, color: "#fff" }}>{l}</div>
                              <div className="px-1 py-0.5 text-[5px]">Nom / Adresse</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {block.type === "lines_table" && (
                        <div>
                          <div className="flex gap-0.5 rounded px-0.5 py-0.5 text-[5px] font-bold text-white" style={{ backgroundColor: config.globalStyles.secondaryColor }}>
                            {["Réf", "Désignation", "Qté", "PU", "HT"].map((h) => (
                              <div key={h} className="flex-1 text-center">{h}</div>
                            ))}
                          </div>
                          {[0, 1, 2].map((i) => (
                            <div key={i} className={`flex gap-0.5 px-0.5 py-0.5 text-[5px] ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                              {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="flex-1 text-center">---</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      {block.type === "totals" && (
                        <div className="flex justify-end">
                          <div className="w-1/2 border border-border rounded overflow-hidden">
                            <div className="flex justify-between px-1 py-0.5 text-[5px] border-b border-border">
                              <span>Total HT</span><span>0.00</span>
                            </div>
                            <div className="flex justify-between px-1 py-0.5 text-[5px] font-bold text-white" style={{ backgroundColor: config.globalStyles.secondaryColor }}>
                              <span>Total TTC</span><span style={{ color: config.globalStyles.primaryColor }}>0.00</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {block.type === "notes" && (
                        <div className="border-l-2 pl-1 py-0.5 text-[5px]" style={{ borderColor: config.globalStyles.primaryColor, backgroundColor: `${config.globalStyles.primaryColor}10` }}>
                          Notes / Conditions...
                        </div>
                      )}
                      {block.type === "bank" && (
                        <div className="bg-muted/30 rounded px-1 py-0.5 text-[5px]">
                          Coordonnées bancaires
                        </div>
                      )}
                      {block.type === "footer" && (
                        <div className="text-center text-[4px] border-t pt-0.5" style={{ borderColor: config.globalStyles.primaryColor }}>
                          Pied de page — ICE / IF / RC
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: Properties panel */}
          <div className="col-span-4">
            <Card className="p-3">
              <ScrollArea className="h-[65vh]">
                {/* Global styles */}
                <h3 className="text-sm font-semibold text-foreground mb-2">Styles globaux</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-xs">Couleur principale</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={config.globalStyles.primaryColor}
                        onChange={(e) => updateGlobalStyle("primaryColor", e.target.value)}
                        className="h-8 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={config.globalStyles.primaryColor}
                        onChange={(e) => updateGlobalStyle("primaryColor", e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Couleur secondaire</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={config.globalStyles.secondaryColor}
                        onChange={(e) => updateGlobalStyle("secondaryColor", e.target.value)}
                        className="h-8 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={config.globalStyles.secondaryColor}
                        onChange={(e) => updateGlobalStyle("secondaryColor", e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Police</Label>
                    <Select value={config.globalStyles.fontFamily} onValueChange={(v) => updateGlobalStyle("fontFamily", v)}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Segoe UI, Arial, sans-serif">Segoe UI</SelectItem>
                        <SelectItem value="Arial, Helvetica, sans-serif">Arial</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Block properties */}
                {selectedBlock ? (
                  <>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {selectedBlock.label}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Visible</Label>
                        <Switch
                          checked={selectedBlock.visible}
                          onCheckedChange={(v) => updateBlock(selectedBlock.id, { visible: v })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Taille de police ({selectedBlock.styles.fontSize || 9}px)</Label>
                        <Slider
                          value={[selectedBlock.styles.fontSize || 9]}
                          onValueChange={([v]) => updateBlockStyle(selectedBlock.id, "fontSize", v)}
                          min={6}
                          max={24}
                          step={1}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Espacement ({selectedBlock.styles.spacing || 10}px)</Label>
                        <Slider
                          value={[selectedBlock.styles.spacing || 10]}
                          onValueChange={([v]) => updateBlockStyle(selectedBlock.id, "spacing", v)}
                          min={0}
                          max={30}
                          step={1}
                          className="mt-1"
                        />
                      </div>

                      {selectedBlock.styles.color !== undefined && (
                        <div>
                          <Label className="text-xs">Couleur texte</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={selectedBlock.styles.color}
                              onChange={(e) => updateBlockStyle(selectedBlock.id, "color", e.target.value)}
                              className="h-7 w-8 rounded border cursor-pointer"
                            />
                            <Input
                              value={selectedBlock.styles.color}
                              onChange={(e) => updateBlockStyle(selectedBlock.id, "color", e.target.value)}
                              className="h-7 text-xs flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {selectedBlock.styles.backgroundColor !== undefined && (
                        <div>
                          <Label className="text-xs">Couleur fond</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={selectedBlock.styles.backgroundColor}
                              onChange={(e) => updateBlockStyle(selectedBlock.id, "backgroundColor", e.target.value)}
                              className="h-7 w-8 rounded border cursor-pointer"
                            />
                            <Input
                              value={selectedBlock.styles.backgroundColor}
                              onChange={(e) => updateBlockStyle(selectedBlock.id, "backgroundColor", e.target.value)}
                              className="h-7 text-xs flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {/* Field visibility toggles */}
                      {selectedBlock.fields && Object.keys(selectedBlock.fields).length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <h4 className="text-xs font-semibold text-foreground">Champs visibles</h4>
                          <div className="space-y-1.5">
                            {Object.entries(selectedBlock.fields).map(([field, visible]) => (
                              <div key={field} className="flex items-center justify-between">
                                <Label className="text-[11px] text-muted-foreground">
                                  {FIELD_LABELS[field] || field}
                                </Label>
                                <Switch
                                  checked={visible as boolean}
                                  onCheckedChange={(v) => updateBlockField(selectedBlock.id, field, v)}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez un bloc pour modifier ses propriétés
                  </p>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
