'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import type { MealPlanItemWithRecipe } from '@/types/meal-plan';

interface WeekViewProps {
  startDate: Date;
  items: MealPlanItemWithRecipe[];
  onAddRecipe: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onRemoveRecipe: (itemId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export function WeekView({ startDate, items, onAddRecipe, onRemoveRecipe }: WeekViewProps) {
  // Generate dates for the week
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    weekDates.push(date);
  }

  const getItemForSlot = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return items.find((item) => item.date === dateStr && item.meal_type === mealType);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2 text-sm font-medium">
        <div className="p-2"></div>
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={day} className="p-2 text-center">
            <div>{day.substring(0, 3)}</div>
            <div className="text-xs text-muted-foreground">
              {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
            </div>
          </div>
        ))}
      </div>

      {MEAL_TYPES.map((mealType) => (
        <div key={mealType} className="grid grid-cols-8 gap-2">
          <div className="p-2 flex items-center font-medium capitalize">
            {mealType}
          </div>

          {weekDates.map((date, index) => {
            const item = getItemForSlot(date, mealType);

            return (
              <Card key={index} className="min-h-[120px]">
                <CardContent className="p-3">
                  {item ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.recipes?.name || 'Unknown Recipe'}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => onRemoveRecipe(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.servings} servings
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => onAddRecipe(formatDate(date), mealType)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Add</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
