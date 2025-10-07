'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CupboardItemFormProps {
  onAdd: (item: string, quantity?: number, unit?: string) => void;
}

export function CupboardItemForm({ onAdd }: CupboardItemFormProps) {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;

    onAdd(
      item.trim(),
      quantity ? parseFloat(quantity) : undefined,
      unit.trim() || undefined
    );

    // Reset form
    setItem('');
    setQuantity('');
    setUnit('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label htmlFor="item">Item Name *</Label>
          <Input
            id="item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g., Chicken Breast"
            required
          />
        </div>
        <div className="col-span-3">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="2"
          />
        </div>
        <div className="col-span-3">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="lbs"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add to Cupboard
      </Button>
    </form>
  );
}
