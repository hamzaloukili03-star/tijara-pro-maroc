import { useState } from "react";
import { Paperclip, Upload, Download, Trash2, Eye, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface AttachmentSectionProps {
  attachments: Attachment[];
  onUpload?: (file: File) => void;
  onDelete?: (id: string) => void;
  onDownload?: (attachment: Attachment) => void;
  readOnly?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="h-4 w-4 text-primary" />;
  if (type === "application/pdf") return <FileText className="h-4 w-4 text-destructive" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png";

export function AttachmentSection({
  attachments,
  onUpload,
  onDelete,
  onDownload,
  readOnly = false,
}: AttachmentSectionProps) {
  const [preview, setPreview] = useState<Attachment | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    onUpload?.(file);
    e.target.value = "";
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          Pièces jointes ({attachments.length})
        </h3>
        {!readOnly && onUpload && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-3.5 w-3.5 mr-1" />
                Ajouter
              </span>
            </Button>
          </label>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Aucune pièce jointe
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              {getFileIcon(att.type)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{att.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(att.size)} · {att.uploadedBy} · {att.uploadedAt}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {att.type.startsWith("image/") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreview(att)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDownload?.(att)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {!readOnly && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(att.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="bg-card rounded-lg shadow-lg max-w-2xl max-h-[80vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">{preview.name}</p>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                Fermer
              </Button>
            </div>
            <img src={preview.url} alt={preview.name} className="w-full rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}
