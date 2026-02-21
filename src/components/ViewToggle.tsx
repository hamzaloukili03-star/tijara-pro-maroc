import { LayoutList, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-3 gap-1.5 rounded-md text-xs font-medium transition-all ${
          view === "list"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("list")}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Liste
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-3 gap-1.5 rounded-md text-xs font-medium transition-all ${
          view === "kanban"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("kanban")}
      >
        <Kanban className="h-3.5 w-3.5" />
        Kanban
      </Button>
    </div>
  );
}
