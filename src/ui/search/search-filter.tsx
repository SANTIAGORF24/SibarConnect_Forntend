"use client";
import { useState } from "react";
import { TextInput } from "../form/input";
import { Select } from "../form/select";
import { Button } from "../button/button";

export type FilterConfig = {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type SearchAndFilterProps = {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onSearch?: (searchTerm: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  onClear?: () => void;
  className?: string;
};

export function SearchAndFilter({
  searchPlaceholder = "Buscar...",
  filters = [],
  onSearch,
  onFilter,
  onClear,
  className,
}: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilterValues({});
    onSearch?.("");
    onFilter?.({});
    onClear?.();
  };

  const hasActiveFilters = searchTerm || Object.values(filterValues).some(value => value);

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <TextInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[200px]">
            {filter.type === "select" ? (
              <Select
                placeholder={filter.placeholder || `Filtrar por ${filter.label}`}
                value={filterValues[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                options={[
                  { value: "", label: `Todos los ${filter.label}` },
                  ...(filter.options || []),
                ]}
              />
            ) : (
              <TextInput
                type={filter.type}
                placeholder={filter.placeholder || `Filtrar por ${filter.label}`}
                value={filterValues[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
