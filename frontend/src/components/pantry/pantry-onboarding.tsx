'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PANTRY_CATEGORY_LABELS,
  type PantryCategory,
  getPantryItemsByCategory,
} from '@/types/pantry';
import {
  Droplet,
  Flame,
  Leaf,
  CakeSlice,
  Droplets,
  Beaker,
  Package,
  Apple
} from 'lucide-react';

// Icon mapping for categories
const CATEGORY_ICONS: Record<PantryCategory, typeof Droplet> = {
  'oils-fats': Droplet,
  'seasonings': Flame,
  'herbs-spices': Leaf,
  'baking': CakeSlice,
  'vinegars-acids': Droplets,
  'condiments': Beaker,
  'tinned-dried': Package,
  'fresh-staples': Apple,
};

const CATEGORY_COLORS: Record<PantryCategory, string> = {
  'oils-fats': 'text-yellow-500',
  'seasonings': 'text-red-500',
  'herbs-spices': 'text-green-500',
  'baking': 'text-pink-500',
  'vinegars-acids': 'text-blue-500',
  'condiments': 'text-orange-500',
  'tinned-dried': 'text-amber-600',
  'fresh-staples': 'text-green-600',
};

interface PantryOnboardingProps {
  /**
   * Currently selected pantry item IDs
   */
  selected: string[];

  /**
   * Callback when selection changes
   */
  onChange: (itemIds: string[]) => void;

  /**
   * Optional: For pre-auth users, show item limit
   */
  maxItems?: number;

  /**
   * Optional: Show as dialog or inline
   */
  isDialog?: boolean;
}

export function PantryOnboarding({
  selected,
  onChange,
  maxItems,
}: PantryOnboardingProps) {
  const [activeCategory, setActiveCategory] = useState<PantryCategory>('oils-fats');
  const itemsByCategory = getPantryItemsByCategory();

  const handleToggle = (itemId: string) => {
    if (selected.includes(itemId)) {
      onChange(selected.filter((id) => id !== itemId));
    } else {
      // Check if we've hit the limit (for pre-auth users)
      if (maxItems && selected.length >= maxItems) {
        // Show a subtle indication that they've hit the limit
        return;
      }
      onChange([...selected, itemId]);
    }
  };

  const handleSelectAll = () => {
    const currentCategoryItems = itemsByCategory[activeCategory] || [];
    const currentIds = currentCategoryItems.map((item) => item.id);

    // If all items in this category are selected, deselect them
    const allSelected = currentIds.every((id) => selected.includes(id));

    if (allSelected) {
      onChange(selected.filter((id) => !currentIds.includes(id)));
    } else {
      // Add all items that aren't already selected
      const newItems = currentIds.filter((id) => !selected.includes(id));

      if (maxItems) {
        const remainingSpace = maxItems - selected.length;
        onChange([...selected, ...newItems.slice(0, remainingSpace)]);
      } else {
        onChange([...selected, ...newItems]);
      }
    }
  };

  const handleSelectNone = () => {
    const currentCategoryItems = itemsByCategory[activeCategory] || [];
    const currentIds = currentCategoryItems.map((item) => item.id);
    onChange(selected.filter((id) => !currentIds.includes(id)));
  };

  const categories = Object.keys(itemsByCategory) as PantryCategory[];
  const currentCategoryItems = itemsByCategory[activeCategory] || [];
  const selectedInCategory = currentCategoryItems.filter((item) =>
    selected.includes(item.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Set Up Your Pantry Staples
        </h3>
        <p className="text-sm text-muted-foreground">
          Select items you typically have at home. These will be hidden from shopping lists by default,
          keeping your lists clean and focused on what you actually need to buy.
        </p>
        {maxItems && (
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
            Preview mode: You can select up to {maxItems} items. Sign up to save unlimited pantry staples permanently.
          </p>
        )}
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selected.length} {maxItems ? `of ${maxItems}` : ''} items selected
        </span>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as PantryCategory)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const itemsInCategory = itemsByCategory[category].length;
            const selectedCount = itemsByCategory[category].filter((item) =>
              selected.includes(item.id)
            ).length;

            return (
              <TabsTrigger
                key={category}
                value={category}
                className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-accent"
              >
                <Icon className={`h-4 w-4 ${CATEGORY_COLORS[category]}`} />
                <span className="text-xs font-medium hidden sm:inline">
                  {PANTRY_CATEGORY_LABELS[category].split(' ')[0]}
                </span>
                {selectedCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {selectedCount}/{itemsInCategory}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Category content */}
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const items = itemsByCategory[category] || [];

          return (
            <TabsContent key={category} value={category} className="space-y-4 mt-4">
              {/* Category header with bulk actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${CATEGORY_COLORS[category]}`} />
                  <h4 className="font-medium">{PANTRY_CATEGORY_LABELS[category]}</h4>
                  <span className="text-sm text-muted-foreground">
                    ({selectedInCategory}/{items.length})
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 text-xs"
                  >
                    Select all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectNone}
                    className="h-8 text-xs"
                    disabled={selectedInCategory === 0}
                  >
                    Select none
                  </Button>
                </div>
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((item) => {
                  const isSelected = selected.includes(item.id);
                  const isDisabled = Boolean(maxItems && selected.length >= maxItems && !isSelected);

                  return (
                    <div
                      key={item.id}
                      className={`
                        flex items-center space-x-3 p-3 border rounded-lg
                        transition-colors cursor-pointer
                        ${isSelected ? 'bg-accent border-primary' : 'hover:bg-accent/50'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => !isDisabled && handleToggle(item.id)}
                    >
                      <Checkbox
                        id={item.id}
                        checked={isSelected}
                        disabled={isDisabled}
                        className="flex-shrink-0 pointer-events-none"
                      />
                      <Label
                        htmlFor={item.id}
                        className={`flex-1 font-normal cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}
                      >
                        {item.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Footer help text */}
      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <p className="font-medium mb-1">💡 Tip</p>
        <p>
          You can always change these later in Settings → My Pantry Staples.
          Items marked as pantry staples will be hidden from shopping lists to keep them tidy,
          but you can still toggle them visible when needed.
        </p>
      </div>
    </div>
  );
}
