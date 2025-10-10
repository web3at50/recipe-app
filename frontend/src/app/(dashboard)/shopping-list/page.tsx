'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Calendar, Filter, Pencil, Check, X, MoreVertical, EyeOff, Eye } from 'lucide-react';
import type { ShoppingListWithItems, ShoppingListItem, GroupedShoppingItems } from '@/types/shopping-list';
import { UNIT_OPTIONS } from '@/lib/units';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserPantryStaple {
  id: string;
  user_id: string;
  item_pattern: string;
  created_at: string;
}

type DisplayMode = 'shopping' | 'complete';

// Helper function to detect pantry staple items
function isPantryStaple(item: ShoppingListItem, userStaples: UserPantryStaple[] = []): boolean {
  const itemName = item.item_name.toLowerCase();
  const quantity = item.quantity?.toLowerCase() || '';

  // 1. Check user's custom pantry staples first (highest priority)
  const isInCustomList = userStaples.some(staple =>
    itemName.includes(staple.item_pattern.toLowerCase())
  );
  if (isInCustomList) return true;

  // Define pantry staples with small quantity thresholds
  const staplePatterns = [
    // Oils & fats
    { pattern: /olive oil|vegetable oil|cooking oil|oil/, threshold: 100, unit: 'ml' },
    { pattern: /butter/, threshold: 50, unit: 'g' },

    // Seasonings & condiments
    { pattern: /salt|pepper/, threshold: 10, unit: 'g' },
    { pattern: /stock cube|bouillon|stock/, threshold: 2, unit: 'whole' },

    // Dried herbs & spices (any quantity)
    { pattern: /dried|herb|spice|cumin|paprika|oregano|basil|thyme|cinnamon|turmeric|coriander|ginger powder/, threshold: Infinity, unit: 'any' },

    // Cooking wine/alcohol in small quantities
    { pattern: /wine|sherry|brandy|cognac/, threshold: 200, unit: 'ml' },

    // Small condiments
    { pattern: /vinegar|soy sauce|worcestershire/, threshold: 50, unit: 'ml' },
  ];

  // Check each pattern
  for (const { pattern, threshold, unit } of staplePatterns) {
    if (pattern.test(itemName)) {
      // Extract numeric quantity
      const numMatch = quantity.match(/^(\d+\.?\d*)/);
      if (!numMatch) {
        // No quantity specified, treat as staple for herbs/spices
        if (unit === 'any') return true;
        continue;
      }

      const numQuantity = parseFloat(numMatch[1]);

      // Check if below threshold
      if (unit === 'any' || numQuantity <= threshold) {
        return true;
      }
    }
  }

  return false;
}

export default function ShoppingListPage() {
  const [activeList, setActiveList] = useState<ShoppingListWithItems | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('shopping');

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQuantityNumber, setEditingQuantityNumber] = useState('');
  const [editingUnit, setEditingUnit] = useState<string>('');

  // User pantry staples state
  const [userPantryStaples, setUserPantryStaples] = useState<UserPantryStaple[]>([]);

  useEffect(() => {
    fetchActiveList();
    fetchUserPantryStaples();
  }, []);

  const fetchUserPantryStaples = async () => {
    try {
      const response = await fetch('/api/user/pantry-staples');
      if (response.ok) {
        const data = await response.json();
        setUserPantryStaples(data.staples || []);
      }
    } catch (error) {
      console.error('Error fetching pantry staples:', error);
    }
  };

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
          item_name: newItem.trim(),
          quantity: newQuantity.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      await fetchActiveList();
      setNewItem('');
      setNewQuantity('');
      toast.success('Item added to shopping list');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleToggleChecked = async (itemId: string, currentChecked: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !currentChecked }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      await fetchActiveList();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      await fetchActiveList();
      toast.success('Item removed');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleClearChecked = async () => {
    if (!activeList) return;

    const checkedItems = activeList.items.filter(item => item.checked);
    if (checkedItems.length === 0) {
      toast.info('No checked items to clear');
      return;
    }

    try {
      // Delete all checked items
      await Promise.all(
        checkedItems.map(item =>
          fetch(`/api/shopping-lists/items/${item.id}`, { method: 'DELETE' })
        )
      );

      await fetchActiveList();
      toast.success(`Cleared ${checkedItems.length} checked items`);
    } catch (error) {
      console.error('Error clearing checked items:', error);
      toast.error('Failed to clear checked items');
    }
  };

  // Inline editing handlers
  const handleStartEdit = (item: ShoppingListItem) => {
    setEditingItemId(item.id);

    // Parse quantity string into number and unit
    // Examples: "400g" → {number: "400", unit: "g"}, "2 litres" → {number: "2", unit: "l"}
    const quantityStr = item.quantity || '';

    // Try to extract number from start of string
    const numberMatch = quantityStr.match(/^(\d+\.?\d*)/);
    const extractedNumber = numberMatch ? numberMatch[1] : '';

    // Extract unit by removing the number part
    const remainingStr = quantityStr.replace(/^(\d+\.?\d*)\s*/, '').trim();

    // Try to match against known units
    let matchedUnit = '';
    if (remainingStr) {
      const unitOption = UNIT_OPTIONS.find(opt =>
        opt.value !== '' && remainingStr.toLowerCase().includes(opt.value.toLowerCase())
      );
      matchedUnit = unitOption ? unitOption.value : '';
    }

    setEditingQuantityNumber(extractedNumber);
    setEditingUnit(matchedUnit);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingQuantityNumber('');
    setEditingUnit('');
  };

  const handleSaveEdit = async (itemId: string) => {
    // Recombine quantity number and unit
    let combinedQuantity = '';
    if (editingQuantityNumber.trim()) {
      combinedQuantity = editingUnit
        ? `${editingQuantityNumber.trim()}${editingUnit}`
        : editingQuantityNumber.trim();
    }

    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: combinedQuantity || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      await fetchActiveList();
      setEditingItemId(null);
      toast.success('Item updated');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(itemId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Pantry staples handlers
  const handleTogglePantryStaple = async (item: ShoppingListItem) => {
    const itemName = item.item_name.toLowerCase();

    // Check if item is already in user's pantry staples
    const existingStaple = userPantryStaples.find(staple =>
      itemName.includes(staple.item_pattern.toLowerCase())
    );

    if (existingStaple) {
      // Remove from pantry staples
      try {
        const response = await fetch(`/api/user/pantry-staples/${existingStaple.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to remove pantry staple');

        await fetchUserPantryStaples();
        toast.success(`"${item.item_name}" will always be shown`);
      } catch (error) {
        console.error('Error removing pantry staple:', error);
        toast.error('Failed to update pantry staples');
      }
    } else {
      // Add to pantry staples
      try {
        const response = await fetch('/api/user/pantry-staples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_pattern: itemName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add pantry staple');
        }

        await fetchUserPantryStaples();
        toast.success(`"${item.item_name}" will always be hidden in Shopping Mode`);
      } catch (error) {
        console.error('Error adding pantry staple:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update pantry staples';
        toast.error(errorMessage);
      }
    }
  };

  // Filter items based on display mode
  const filteredItems = activeList?.items.filter(item => {
    if (displayMode === 'complete') return true;
    return !isPantryStaple(item, userPantryStaples);
  }) || [];

  const hiddenStaplesCount = (activeList?.items.length || 0) - filteredItems.length;

  // Group items by category
  const groupedItems: GroupedShoppingItems[] = [];
  if (filteredItems.length > 0) {
    const groups = filteredItems.reduce((acc, item) => {
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

  const checkedCount = activeList?.items.filter(item => item.checked).length || 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shopping List</h1>
            <p className="text-muted-foreground mt-1">
              {activeList?.name || 'My Shopping List'}
            </p>
            {activeList?.meal_plan_id && (
              <Link
                href="/meal-planner"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
              >
                <Calendar className="h-3 w-3" />
                Generated from meal plan
              </Link>
            )}
          </div>
          <div className="flex gap-2">
            {checkedCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearChecked}
              >
                Clear Checked ({checkedCount})
              </Button>
            )}
          </div>
        </div>

        {/* Display Mode Toggle */}
        {activeList && activeList.items.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={displayMode === 'shopping' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('shopping')}
              >
                Shopping Mode
                {displayMode === 'shopping' && hiddenStaplesCount > 0 && (
                  <span className="ml-1.5 text-xs opacity-80">
                    ({hiddenStaplesCount} hidden)
                  </span>
                )}
              </Button>
              <Button
                variant={displayMode === 'complete' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('complete')}
              >
                Complete List
              </Button>
            </div>
            {displayMode === 'shopping' && hiddenStaplesCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {hiddenStaplesCount} pantry staple{hiddenStaplesCount !== 1 ? 's' : ''} hidden
              </p>
            )}
          </div>
        )}
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
                <div className="col-span-8">
                  <Label htmlFor="item">Item *</Label>
                  <Input
                    id="item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., Milk"
                    required
                  />
                </div>
                <div className="col-span-4">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="2 liters"
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
              Items ({filteredItems.length})
              {displayMode === 'shopping' && hiddenStaplesCount > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({activeList?.items.length || 0} total)
                </span>
              )}
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
                      {group.items.map((item) => {
                        const isEditing = editingItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                          >
                            {!isEditing && (
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={item.checked}
                                onCheckedChange={() => handleToggleChecked(item.id, item.checked)}
                              />
                            )}

                            {isEditing ? (
                              // Edit mode: Show quantity editor only (name stays fixed)
                              <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                {/* Static name (not editable) */}
                                <div className="col-span-7">
                                  <span className="font-medium text-muted-foreground">
                                    {item.item_name}
                                  </span>
                                </div>

                                {/* Quantity number input */}
                                <Input
                                  className="col-span-3"
                                  type="number"
                                  value={editingQuantityNumber}
                                  onChange={(e) => setEditingQuantityNumber(e.target.value)}
                                  onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                                  placeholder="400"
                                  autoFocus
                                />

                                {/* Unit selector */}
                                <Select
                                  value={editingUnit}
                                  onValueChange={setEditingUnit}
                                >
                                  <SelectTrigger className="col-span-2 h-10">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.filter(opt => opt.value !== '').map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              // View mode: Show static text
                              <label
                                htmlFor={`item-${item.id}`}
                                className={`flex-1 cursor-pointer ${
                                  item.checked ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                <span className="font-medium">{item.item_name}</span>
                                {item.quantity && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({item.quantity})
                                  </span>
                                )}
                              </label>
                            )}

                            {/* Action buttons */}
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancelEdit}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStartEdit(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                                {/* Dropdown menu for pantry staples */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {userPantryStaples.some(staple =>
                                      item.item_name.toLowerCase().includes(staple.item_pattern.toLowerCase())
                                    ) ? (
                                      <DropdownMenuItem onClick={() => handleTogglePantryStaple(item)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Always show this item
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleTogglePantryStaple(item)}>
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Always hide this item
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        );
                      })}
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
