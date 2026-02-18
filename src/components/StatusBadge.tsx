import { STATUS_CONFIG, type DocumentStatus } from "@/lib/document-lifecycle";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, Truck, FileText, Wallet, Lock, X } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  pencil: <Pencil className="h-3 w-3" />,
  check: <Check className="h-3 w-3" />,
  truck: <Truck className="h-3 w-3" />,
  "file-text": <FileText className="h-3 w-3" />,
  wallet: <Wallet className="h-3 w-3" />,
  lock: <Lock className="h-3 w-3" />,
  x: <X className="h-3 w-3" />,
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.color} ${config.textColor} border-0 gap-1 font-medium`}>
      {iconMap[config.icon]}
      {config.label}
    </Badge>
  );
}
