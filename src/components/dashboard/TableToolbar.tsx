import React from 'react';
import { Search, Filter, Download, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableToolbarProps {
  title: string;
  icon: LucideIcon;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: Array<{ label: string; value: string }>;
  onExport?: () => void;
  totalItems?: number;
  loading?: boolean;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  icon: Icon,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  onExport,
  totalItems,
  loading
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Icon className="w-6 h-6 text-brand-red" />
        {title}
      </h2>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
          />
        </div>

        <div className="flex items-center gap-2 bg-bg-secondary px-3 py-2 rounded-xl border border-border-primary">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <select 
            value={statusValue} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 cursor-pointer"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            className="p-2 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary rounded-xl border border-border-primary transition-colors"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {!loading && totalItems !== undefined && (
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            {totalItems} {t('dashboard.common.total')}
          </span>
        )}
      </div>
    </div>
  );
};
