'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import type { CupboardItem } from '@/types/pantry';

interface CupboardListProps {
  items: CupboardItem[];
  onUpdate: (id: string, item: string, quantity?: number, unit?: string) => void;
  onDelete: (id: string) => void;
}

export function CupboardList({ items, onUpdate, onDelete }: CupboardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const startEdit = (item: CupboardItem) => {
    setEditingId(item.id);
    setEditItem(item.item);
    setEditQuantity(item.quantity?.toString() || '');
    setEditUnit(item.unit || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem('');
    setEditQuantity('');
    setEditUnit('');
  };

  const saveEdit = (id: string) => {
    if (!editItem.trim()) return;
    onUpdate(
      id,
      editItem.trim(),
      editQuantity ? parseFloat(editQuantity) : undefined,
      editUnit.trim() || undefined
    );
    cancelEdit();
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Your cupboard is empty</p>
        <p className="text-sm mt-1">Add items above to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 p-3 rounded-lg border bg-card"
        >
          {editingId === item.id ? (
            <>
              <div className="flex-1 grid grid-cols-12 gap-2">
                <Input
                  className="col-span-6"
                  value={editItem}
                  onChange={(e) => setEditItem(e.target.value)}
                  placeholder="Item name"
                />
                <Input
                  className="col-span-3"
                  type="number"
                  step="0.1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  placeholder="Qty"
                />
                <Input
                  className="col-span-3"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  placeholder="Unit"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => saveEdit(item.id)}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="font-medium">{item.item}</p>
                {(item.quantity || item.unit) && (
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEdit(item)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
