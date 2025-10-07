'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { ShoppingListWithItems, ShoppingListItem, GroupedShoppingItems } from '@/types/shopping-list';

export default function ShoppingListPage() {
  const [activeList, setActiveList] = useState<ShoppingListWithItems | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveList();
  }, []);

  const fetchActiveList = async () => {
    try {
      setIsLoading(true);
      // Get all lists
      const response = await fetch('/api/shopping-lists');
      if (!response.ok) throw new Error('Failed to fetch lists');

      const { lists } = await response.json();

      if (lists.length > 0) {
        // Get items for the first list
        const listResponse = await fetch(`/api/shopping-lists/${lists[0].id}`);
        if (listResponse.ok) {
          const data = await listResponse.json();
          setActiveList({ ...data.list, items: data.items });
        }
      } else {
        // Create a new list if none exist
        const createResponse = await fetch('/api/shopping-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Shopping List' }),
        });

        if (createResponse.ok) {
          const { list } = await createResponse.json();
          setActiveList({ ...list, items: [] });
        }
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || !newItem.trim()) return;

    try {
      const response = await fetch(`/api/shopping-lists/${activeList.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: newItem.trim(),
          quantity: newQuantity ? parseFloat(newQuantity) : null,
          unit: newUnit.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      await fetchActiveList();
      setNewItem('');
      setNewQuantity('');
      setNewUnit('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const handleToggleChecked = async (itemId: string, currentChecked: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_checked: !currentChecked }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      await fetchActiveList();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      await fetchActiveList();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  // Group items by category
  const groupedItems: GroupedShoppingItems[] = [];
  if (activeList?.items) {
    const groups = activeList.items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    Object.entries(groups).forEach(([category, items]) => {
      groupedItems.push({ category, items });
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shopping List</h1>
        <p className="text-muted-foreground mt-1">
          {activeList?.name || 'My Shopping List'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Add Item Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <Label htmlFor="item">Item *</Label>
                  <Input
                    id="item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., Milk"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="liters"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Shopping List Items */}
        <Card>
          <CardHeader>
            <CardTitle>
              Items ({activeList?.items.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedItems.length > 0 ? (
              <div className="space-y-6">
                {groupedItems.map((group) => (
                  <div key={group.category}>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">
                      {group.category}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        >
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.is_checked}
                            onCheckedChange={() => handleToggleChecked(item.id, item.is_checked)}
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className={`flex-1 cursor-pointer ${
                              item.is_checked ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            <span className="font-medium">{item.item}</span>
                            {(item.quantity || item.unit) && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({item.quantity} {item.unit})
                              </span>
                            )}
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your shopping list is empty</p>
                <p className="text-sm mt-1">Add items above to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
