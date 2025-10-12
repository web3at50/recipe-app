'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ShoppingCart, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  getPlaygroundShoppingList,
  savePlaygroundShoppingList,
  getPlaygroundMealPlan,
  getPlaygroundRecipes,
  removeItemFromPlaygroundShoppingList,
  updatePlaygroundShoppingListItem,
  generatePlaygroundId,
} from '@/lib/session-storage';
import { toast } from 'sonner';

interface ShoppingListItem {
  id: string;
  item_name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

interface GroupedShoppingItems {
  [category: string]: ShoppingListItem[];
}

const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Frozen',
  'Bakery',
  'Other',
];

export default function PlaygroundShoppingListPage() {
  const [activeList, setActiveList] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newCategory, setNewCategory] = useState('Other');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = () => {
    setIsLoading(true);
    try {
      const list = getPlaygroundShoppingList();
      if (list) {
        setActiveList(list.items);
      } else {
        setActiveList([]);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      toast.error('Failed to load shopping list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromMealPlan = () => {
    try {
      const mealPlan = getPlaygroundMealPlan();
      const recipes = getPlaygroundRecipes();

      if (!mealPlan || mealPlan.items.length === 0) {
        toast.error('No meal plan found. Plan some meals first!');
        return;
      }

      // Extract all ingredients from recipes in meal plan
      const allIngredients: Array<{ item: string; quantity: string; unit?: string }> = [];

      mealPlan.items.forEach((mealPlanItem) => {
        const recipe = recipes.find((r) => r.id === mealPlanItem.recipe_id);
        if (recipe) {
          recipe.ingredients.forEach((ing) => {
            allIngredients.push({
              item: ing.item,
              quantity: ing.quantity || '',
              unit: ing.unit,
            });
          });
        }
      });

      // Simple consolidation: group by item name
      const consolidated: { [key: string]: { quantity: string; count: number } } = {};

      allIngredients.forEach((ing) => {
        const key = ing.item.toLowerCase();
        if (!consolidated[key]) {
          consolidated[key] = { quantity: ing.quantity, count: 1 };
        } else {
          consolidated[key].count += 1;
          // Simple addition if quantities are numeric
          const num1 = parseFloat(consolidated[key].quantity);
          const num2 = parseFloat(ing.quantity);
          if (!isNaN(num1) && !isNaN(num2)) {
            consolidated[key].quantity = `${num1 + num2}${ing.unit || ''}`;
          }
        }
      });

      // Convert to shopping list items
      const items: ShoppingListItem[] = Object.entries(consolidated).map(([itemName, data]) => ({
        id: generatePlaygroundId(),
        item_name: itemName,
        quantity: data.count > 1 ? data.quantity : allIngredients.find(i => i.item.toLowerCase() === itemName)?.quantity || '',
        category: categorizeItem(itemName),
        checked: false,
      }));

      // Save to session storage
      savePlaygroundShoppingList({
        name: 'Shopping List',
        items,
      });

      loadShoppingList();
      toast.success(`Generated shopping list with ${items.length} items!`);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast.error('Failed to generate shopping list');
    }
  };

  const categorizeItem = (itemName: string): string => {
    const name = itemName.toLowerCase();

    if (
      name.includes('tomato') ||
      name.includes('lettuce') ||
      name.includes('onion') ||
      name.includes('carrot') ||
      name.includes('pepper') ||
      name.includes('cucumber') ||
      name.includes('spinach') ||
      name.includes('broccoli') ||
      name.includes('potato')
    ) {
      return 'Produce';
    }

    if (
      name.includes('chicken') ||
      name.includes('beef') ||
      name.includes('pork') ||
      name.includes('fish') ||
      name.includes('salmon') ||
      name.includes('shrimp')
    ) {
      return 'Meat & Seafood';
    }

    if (
      name.includes('milk') ||
      name.includes('cheese') ||
      name.includes('yogurt') ||
      name.includes('butter') ||
      name.includes('egg') ||
      name.includes('cream')
    ) {
      return 'Dairy & Eggs';
    }

    if (
      name.includes('bread') ||
      name.includes('bun') ||
      name.includes('roll') ||
      name.includes('bagel')
    ) {
      return 'Bakery';
    }

    if (
      name.includes('frozen') ||
      name.includes('ice cream')
    ) {
      return 'Frozen';
    }

    if (
      name.includes('rice') ||
      name.includes('pasta') ||
      name.includes('flour') ||
      name.includes('sugar') ||
      name.includes('oil') ||
      name.includes('sauce') ||
      name.includes('spice') ||
      name.includes('salt') ||
      name.includes('pepper')
    ) {
      return 'Pantry';
    }

    return 'Other';
  };

  const handleAddItem = () => {
    if (!newItem.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    try {
      const currentList = getPlaygroundShoppingList();
      const newShoppingItem: ShoppingListItem = {
        id: generatePlaygroundId(),
        item_name: newItem.trim(),
        quantity: newQuantity.trim(),
        category: newCategory,
        checked: false,
      };

      if (currentList) {
        currentList.items.push(newShoppingItem);
        savePlaygroundShoppingList(currentList);
      } else {
        savePlaygroundShoppingList({
          name: 'Shopping List',
          items: [newShoppingItem],
        });
      }

      loadShoppingList();
      setNewItem('');
      setNewQuantity('');
      toast.success('Item added to shopping list');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleToggleItem = (itemId: string) => {
    try {
      const item = activeList.find((i) => i.id === itemId);
      if (item) {
        updatePlaygroundShoppingListItem(itemId, !item.checked);
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    try {
      removeItemFromPlaygroundShoppingList(itemId);
      loadShoppingList();
      toast.success('Item removed');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleClearChecked = () => {
    try {
      const currentList = getPlaygroundShoppingList();
      if (currentList) {
        currentList.items = currentList.items.filter((item) => !item.checked);
        savePlaygroundShoppingList(currentList);
        loadShoppingList();
        toast.success('Cleared checked items');
      }
    } catch (error) {
      console.error('Error clearing checked items:', error);
      toast.error('Failed to clear items');
    }
  };

  // Group items by category
  const groupedItems: GroupedShoppingItems = activeList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as GroupedShoppingItems);

  const totalItems = activeList.length;
  const checkedItems = activeList.filter((item) => item.checked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Shopping List
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalItems > 0
              ? `${checkedItems} of ${totalItems} items checked`
              : 'Your shopping list is empty'}
          </p>
        </div>

        <Button asChild variant="default" size="lg">
          <Link href="/signup">
            <Save className="mr-2 h-5 w-5" />
            Sign Up to Save Permanently
          </Link>
        </Button>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleGenerateFromMealPlan} className="flex-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate from Meal Plan
            </Button>
            {checkedItems > 0 && (
              <Button variant="outline" onClick={handleClearChecked}>
                Clear Checked ({checkedItems})
              </Button>
            )}
          </div>

          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="item-name">Item</Label>
              <Input
                id="item-name"
                placeholder="e.g., Tomatoes"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                placeholder="e.g., 400g"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleAddItem} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Shopping List Items */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : totalItems === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Your shopping list is empty
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Generate from your meal plan or add items manually
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleGenerateFromMealPlan}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate from Meal Plan
              </Button>
              <Button variant="outline" asChild>
                <Link href="/playground/meal-planner">Plan Meals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const items = groupedItems[category];
            if (!items || items.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {items.filter((i) => i.checked).length} / {items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => handleToggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            item.checked ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.item_name}
                        </p>
                        {item.quantity && (
                          <p className="text-xs text-muted-foreground">{item.quantity}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
