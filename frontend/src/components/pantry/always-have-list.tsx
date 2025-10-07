'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { COMMON_STAPLES, type AlwaysHaveItem } from '@/types/pantry';

interface AlwaysHaveListProps {
  items: AlwaysHaveItem[];
  onAdd: (item: string, category?: string) => void;
  onDelete: (id: string) => void;
}

export function AlwaysHaveList({ items, onAdd, onDelete }: AlwaysHaveListProps) {
  const [customItem, setCustomItem] = useState('');
  const [showCommonStaples, setShowCommonStaples] = useState(true);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    onAdd(customItem.trim());
    setCustomItem('');
  };

  const handleAddStaple = (item: string, category: string) => {
    onAdd(item, category);
  };

  const existingItemNames = new Set(items.map((item) => item.item.toLowerCase()));

  // Filter common staples that haven't been added yet
  const availableStaples = COMMON_STAPLES.filter(
    (staple) => !existingItemNames.has(staple.item.toLowerCase())
  );

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AlwaysHaveItem[]>);

  return (
    <div className="space-y-6">
      {/* Add Custom Item Form */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="custom-item" className="sr-only">
            Add Custom Item
          </Label>
          <Input
            id="custom-item"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Add custom item..."
          />
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>

      {/* Common Staples Section */}
      {availableStaples.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Common Staples</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommonStaples(!showCommonStaples)}
            >
              {showCommonStaples ? 'Hide' : 'Show'} ({availableStaples.length})
            </Button>
          </div>

          {showCommonStaples && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableStaples.map((staple, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStaple(staple.item, staple.category)}
                  className="justify-start"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  {staple.item}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User's Always-Have Items */}
      {items.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Your Items ({items.length})</h3>

          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">
                  {category}
                </h4>
                <div className="space-y-1">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded border bg-card"
                    >
                      <span>{item.item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded border bg-card"
                >
                  <span>{item.item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No always-have items yet</p>
          <p className="text-sm mt-1">Add items above or select from common staples</p>
        </div>
      )}
    </div>
  );
}
