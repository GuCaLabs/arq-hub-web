import React from "react";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  id: string | null;
  label: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-h2" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id ?? "root"} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-5 h-5 mx-1 text-muted-foreground flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-foreground font-semibold px-2 py-1 flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.id)}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-2 py-1 rounded-md transition-colors flex items-center gap-2"
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
