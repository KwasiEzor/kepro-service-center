import React from 'react';
import { XCircle } from 'lucide-react';

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'blue';
}

interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  actions,
  onClear
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6 bg-bg-primary border border-brand-red/30 px-8 py-4 rounded-2xl shadow-2xl shadow-brand-red/20 animate-in slide-in-from-bottom-10 duration-300">
      <span className="text-sm font-black uppercase tracking-widest text-brand-red whitespace-nowrap">
        {selectedCount} SELECTED
      </span>
      <div className="h-4 w-px bg-border-primary" />
      <div className="flex items-center gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors hover:bg-opacity-10 ${
              action.variant === 'danger' ? 'text-red-500 hover:bg-red-500' :
              action.variant === 'success' ? 'text-green-400 hover:bg-green-400' :
              action.variant === 'blue' ? 'text-blue-400 hover:bg-blue-400' :
              'text-text-primary hover:bg-bg-secondary'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
      <button 
        onClick={onClear}
        className="p-2 hover:bg-bg-secondary rounded-lg text-text-tertiary transition-colors"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};
