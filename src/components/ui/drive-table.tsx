import React from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (item: T) => React.ReactNode;
  width?: string;
}

export interface DriveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DriveTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onRowDoubleClick,
  emptyMessage = "Nenhum item encontrado."
}: DriveTableProps<T>) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border text-muted">
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-medium text-small" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                onDoubleClick={() => onRowDoubleClick?.(item)}
                className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors group ${
                  onRowClick || onRowDoubleClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-body whitespace-nowrap">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
