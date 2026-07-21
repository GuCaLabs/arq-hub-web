import React from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigateBreadcrumb: (id: string | null) => void;
  action?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, onNavigateBreadcrumb, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
      <Breadcrumbs items={breadcrumbs} onNavigate={onNavigateBreadcrumb} />
      {action && <div>{action}</div>}
    </div>
  );
}
