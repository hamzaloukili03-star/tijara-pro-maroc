import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductImageUploadProps {
  productId?: string;
  imageUrl?: string | null;
  onImageChange: (url: string | null) => void;
}

export function ProductImageUpload({ productId, imageUrl, onImageChange }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageUrl || null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Type non supporté", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Maximum 5 Mo.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${productId || crypto.randomUUID()}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("company-assets").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("company-assets").getPublicUrl(path);
    setPreview(publicUrl);
    onImageChange(publicUrl);
    setUploading(false);
    toast({ title: "Image ajoutée" });
  }, [productId, onImageChange]);

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Image produit</p>
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl border border-border overflow-hidden bg-muted group">
          <img src={preview} alt="Produit" className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 cursor-pointer transition-colors">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Cliquer pour ajouter</span>
              <span className="text-xs text-muted-foreground/60">JPG, PNG • Max 5 Mo</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
