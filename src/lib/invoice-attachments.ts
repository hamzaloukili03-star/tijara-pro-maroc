import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { InvoiceAttachment } from "@/types/invoice";

export async function fetchAttachments(invoiceId?: string, creditNoteId?: string): Promise<InvoiceAttachment[]> {
  let query = (supabase as any).from("invoice_attachments").select("*").order("created_at", { ascending: false });
  if (invoiceId) query = query.eq("invoice_id", invoiceId);
  if (creditNoteId) query = query.eq("credit_note_id", creditNoteId);
  const { data, error } = await query;
  if (error) return [];
  return (data || []) as InvoiceAttachment[];
}

export async function uploadAttachment(
  file: File,
  invoiceId?: string,
  creditNoteId?: string
): Promise<InvoiceAttachment | null> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const path = `${invoiceId || creditNoteId}/${Date.now()}_${file.name}`;

  const { error: uploadErr } = await supabase.storage
    .from("invoice-attachments")
    .upload(path, file);

  if (uploadErr) {
    toast({ title: "Erreur upload", description: uploadErr.message, variant: "destructive" });
    return null;
  }

  const { data: urlData } = supabase.storage.from("invoice-attachments").getPublicUrl(path);

  const { data, error } = await (supabase as any)
    .from("invoice_attachments")
    .insert({
      invoice_id: invoiceId || null,
      credit_note_id: creditNoteId || null,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      file_type: file.type,
      uploaded_by: userId,
    })
    .select()
    .single();

  if (error) {
    toast({ title: "Erreur", description: error.message, variant: "destructive" });
    return null;
  }

  toast({ title: "Fichier ajouté" });
  return data as InvoiceAttachment;
}

export async function deleteAttachment(id: string) {
  const { error } = await (supabase as any).from("invoice_attachments").delete().eq("id", id);
  if (error) {
    toast({ title: "Erreur", description: error.message, variant: "destructive" });
    return false;
  }
  toast({ title: "Fichier supprimé" });
  return true;
}
