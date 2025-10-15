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
import { ChevronLeft, ChevronRight, Calendar, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WeekView } from '@/components/meal-planner/week-view';
import type { MealPlanItemWithRecipe, MealType } from '@/types/meal-plan';
import type { Recipe } from '@/types/recipe';
import { toast } from 'sonner';

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
  const [householdSize, setHouseholdSize] = useState<number>(4); // Default to 4

  // Recipe selector dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType | ''>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMealPlan();
    fetchRecipes();
    fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        const size = data.profile?.preferences?.household_size || 4;
        setHouseholdSize(size);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentWeekStart(getMonday(today));
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
          servings: householdSize, // Auto-scale to household size
        }),
      });

      if (!response.ok) throw new Error('Failed to add recipe');

      await fetchMealPlan();
      setIsDialogOpen(false);
      setSearchQuery('');
      toast.success('Recipe added to meal plan!');
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Failed to add recipe to meal plan');
    }
  };

  const handleRemoveRecipe = async (itemId: string) => {
    try {
      const response = await fetch(`/api/meal-plans/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove recipe');

      await fetchMealPlan();
      toast.success('Recipe removed from meal plan');
    } catch (error) {
      console.error('Error removing recipe:', error);
      toast.error('Failed to remove recipe');
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!mealPlan) {
      toast.error('No meal plan found');
      return;
    }

    if (items.length === 0) {
      toast.error('Add some recipes to your meal plan first');
      return;
    }

    toast.promise(
      fetch('/api/shopping-lists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_plan_id: mealPlan.id,
        }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('Failed to generate shopping list');
          const data = await response.json();
          router.push('/shopping-list');
          return data;
        }),
      {
        loading: 'Generating shopping list...',
        success: (data) => `Shopping list created with ${data.items_count} items!`,
        error: 'Failed to generate shopping list',
      }
    );
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your meal plan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Meal Planner</h1>
          <p className="text-muted-foreground mt-1">
            Plan your weekly meals
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={handlePreviousWeek} className="sm:w-auto">
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Previous Week</span>
            <span className="xs:hidden">Prev</span>
          </Button>
          <Button variant="default" onClick={handleTodayClick} className="sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <div className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-muted rounded-md min-w-0">
            <span className="truncate">
              {currentWeekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} -{' '}
              {getWeekEnd(currentWeekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <Button variant="outline" onClick={handleNextWeek} className="sm:w-auto">
            <span className="hidden xs:inline">Next Week</span>
            <span className="xs:hidden">Next</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 mb-8">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No meals planned yet</h3>
          <p className="text-muted-foreground mb-4">
            Click the &quot;+&quot; button on any day to add recipes to your meal plan
          </p>
        </div>
      )}

      <WeekView
        startDate={currentWeekStart}
        items={items}
        onAddRecipe={handleAddRecipe}
        onRemoveRecipe={handleRemoveRecipe}
      />

      {items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerateShoppingList}
            className="gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Generate Shopping List ({items.length} {items.length === 1 ? 'recipe' : 'recipes'})
          </Button>
        </div>
      )}

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
