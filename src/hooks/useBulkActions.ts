import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface BulkActionsOptions {
  onSuccess?: () => void;
  confirmMessage?: (count: number) => string;
}

export function useBulkActions<T extends { id: string }>(
  baseUrl: string,
  data: T[],
  options: BulkActionsOptions = {}
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === data.length ? [] : data.map(item => item.id)
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkAction = async (
    action: 'patch' | 'delete',
    payload?: any,
    successMessage?: string,
    customUrlSuffix: string = ''
  ) => {
    if (selectedIds.length === 0) return;
    
    const confirmMsg = options.confirmMessage 
      ? options.confirmMessage(selectedIds.length)
      : `Are you sure you want to perform this action on ${selectedIds.length} items?`;

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      if (action === 'delete') {
        await Promise.all(selectedIds.map(id => api.delete(`${baseUrl}/${id}${customUrlSuffix}`)));
      } else {
        await Promise.all(selectedIds.map(id => api.patch(`${baseUrl}/${id}${customUrlSuffix}`, payload)));
      }
      
      toast.success(successMessage || `Successfully processed ${selectedIds.length} items`);
      clearSelection();
      options.onSuccess?.();
    } catch (error) {
      toast.error('Failed to complete some actions');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedIds,
    setSelectedIds,
    isProcessing,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkAction
  };
}
