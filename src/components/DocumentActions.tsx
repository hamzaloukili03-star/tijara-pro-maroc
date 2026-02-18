import { useState } from "react";
import { getAvailableActions, TRANSITION_ACTIONS, type DocumentStatus } from "@/lib/document-lifecycle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DocumentActionsProps {
  status: DocumentStatus;
  onTransition: (to: DocumentStatus, reason?: string) => void;
}

export function DocumentActions({ status, onTransition }: DocumentActionsProps) {
  const actions = getAvailableActions(status);
  const [confirm, setConfirm] = useState<{ to: DocumentStatus; message: string; isDestructive: boolean } | null>(null);
  const [reason, setReason] = useState("");

  if (actions.length === 0) return null;

  const handleClick = (to: DocumentStatus) => {
    const key = `${status}->${to}`;
    const action = TRANSITION_ACTIONS[key];
    if (action?.confirmMessage) {
      setConfirm({ to, message: action.confirmMessage, isDestructive: action.variant === "destructive" });
    } else {
      onTransition(to);
    }
  };

  const handleConfirm = () => {
    if (confirm) {
      onTransition(confirm.to, confirm.isDestructive ? reason || undefined : undefined);
      setConfirm(null);
      setReason("");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((action) => (
          <Button
            key={action.to}
            variant={action.variant}
            size="sm"
            onClick={() => handleClick(action.to)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!confirm} onOpenChange={() => { setConfirm(null); setReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{confirm?.message}</p>
          {confirm?.isDestructive && (
            <div className="mt-2">
              <label className="text-xs font-medium text-foreground">Motif (obligatoire pour annulation)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Indiquez le motif de cette action..."
                className="mt-1"
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setConfirm(null); setReason(""); }}>
              Annuler
            </Button>
            <Button
              variant={confirm?.isDestructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={confirm?.isDestructive && !reason.trim()}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
