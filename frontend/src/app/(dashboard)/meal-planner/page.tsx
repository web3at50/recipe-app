'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekView } from '@/components/meal-planner/week-view';
import type { MealPlanItemWithRecipe, MealType } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';

export default function MealPlannerPage() {
  interface MealPlan {
    id: string;
    user_id: string;
    name: string;
    start_date: string;
    end_date: string;
  }

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [items, setItems] = useState<MealPlanItemWithRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recipe selector dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType | ''>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMealPlan();
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getWeekEnd(monday: Date): Date {
    const end = new Date(monday);
    end.setDate(end.getDate() + 6);
    return end;
  }

  const fetchMealPlan = async () => {
    try {
      setIsLoading(true);
      const weekEnd = getWeekEnd(currentWeekStart);
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];

      const response = await fetch(
        `/api/meal-plans?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) throw new Error('Failed to fetch meal plan');

      const data = await response.json();
      setMealPlan(data.meal_plan);
      setItems(data.items);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(getMonday(newDate));
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(getMonday(newDate));
  };

  const handleAddRecipe = (date: string, mealType: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setIsDialogOpen(true);
  };

  const handleSelectRecipe = async (recipeId: string) => {
    if (!mealPlan || !selectedDate || !selectedMealType) return;

    try {
      const response = await fetch('/api/meal-plans/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_plan_id: mealPlan.id,
          recipe_id: recipeId,
          date: selectedDate,
          meal_type: selectedMealType,
          servings: 4,
        }),
      });

      if (!response.ok) throw new Error('Failed to add recipe');

      await fetchMealPlan();
      setIsDialogOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe to meal plan');
    }
  };

  const handleRemoveRecipe = async (itemId: string) => {
    try {
      const response = await fetch(`/api/meal-plans/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove recipe');

      await fetchMealPlan();
    } catch (error) {
      console.error('Error removing recipe:', error);
      alert('Failed to remove recipe');
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Planner</h1>
          <p className="text-muted-foreground mt-1">
            Plan your weekly meals
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Week
          </Button>
          <span className="text-sm font-medium">
            {currentWeekStart.toLocaleDateString()} -{' '}
            {getWeekEnd(currentWeekStart).toLocaleDateString()}
          </span>
          <Button variant="outline" onClick={handleNextWeek}>
            Next Week
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <WeekView
        startDate={currentWeekStart}
        items={items}
        onAddRecipe={handleAddRecipe}
        onRemoveRecipe={handleRemoveRecipe}
      />

      {/* Recipe Selector Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Recipe</DialogTitle>
            <DialogDescription>
              Choose a recipe for {selectedMealType} on {selectedDate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid gap-3">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{recipe.name}</h3>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {recipe.description}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {recipe.prep_time && <span>{recipe.prep_time}m prep</span>}
                        {recipe.cook_time && <span>{recipe.cook_time}m cook</span>}
                        <span>{recipe.servings} servings</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No recipes found. Create some recipes first!
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
