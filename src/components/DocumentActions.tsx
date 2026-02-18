import { getAvailableActions, type DocumentStatus } from "@/lib/document-lifecycle";
import { Button } from "@/components/ui/button";

interface DocumentActionsProps {
  status: DocumentStatus;
  onTransition: (to: DocumentStatus) => void;
}

export function DocumentActions({ status, onTransition }: DocumentActionsProps) {
  const actions = getAvailableActions(status);

  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action) => (
        <Button
          key={action.to}
          variant={action.variant}
          size="sm"
          onClick={() => onTransition(action.to)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
