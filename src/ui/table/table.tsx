"use client";
import { PropsWithChildren } from "react";

export type TableColumn<T = any> = {
  key: string;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
};

export type TableProps<T = any> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function Table<T = any>({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No hay datos disponibles",
  className 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white ${className || ""}`}>
        <div className="p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground/60">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className || ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.width || ""} ${column.className || ""}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-foreground/60">
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render 
                      ? column.render(value, row, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-foreground ${column.className || ""}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type TableHeaderProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}>;

export function TableHeader({ title, subtitle, actions, children }: TableHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-foreground/60 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
