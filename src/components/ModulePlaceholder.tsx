import { ReactNode } from "react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function ModulePlaceholder({ title, description, icon }: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg shadow-card p-6 border border-border">
            <div className="h-3 w-20 bg-muted rounded mb-3" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
