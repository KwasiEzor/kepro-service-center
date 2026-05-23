import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Column {
  label: string;
  field?: string;
  sortable?: boolean;
  className?: string;
}

interface TableHeaderProps {
  columns: Column[];
  currentSort?: { field: string; order: 'asc' | 'desc' };
  onSort?: (field: string) => void;
  showCheckbox?: boolean;
  checkboxChecked?: boolean;
  onCheckboxChange?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  currentSort,
  onSort,
  showCheckbox,
  checkboxChecked,
  onCheckboxChange
}) => {
  return (
    <thead>
      <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
        {showCheckbox && (
          <th className="px-6 py-2 w-10">
            <input 
              type="checkbox" 
              checked={checkboxChecked}
              onChange={onCheckboxChange}
              className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
            />
          </th>
        )}
        {columns.map((col, idx) => (
          <th 
            key={idx} 
            className={`${col.className} px-6 py-2 ${col.sortable && onSort ? 'cursor-pointer hover:text-text-primary transition-colors' : ''}`}
            onClick={() => col.sortable && col.field && onSort?.(col.field)}
          >
            <div className={`flex items-center gap-1 ${col.className?.includes('text-right') ? 'justify-end' : ''}`}>
              {col.label}
              {col.sortable && col.field && (
                currentSort?.field === col.field ? (
                  currentSort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                ) : <ArrowUpDown className="w-3 h-3 opacity-30" />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
