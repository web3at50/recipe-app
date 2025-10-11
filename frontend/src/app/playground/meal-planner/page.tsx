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
import { ChevronLeft, ChevronRight, Calendar, Save, Plus, X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import {
  getPlaygroundRecipes,
  getPlaygroundMealPlan,
  savePlaygroundMealPlan,
  updatePlaygroundMealPlan,
  addRecipeToPlaygroundMealPlan,
  removeRecipeFromPlaygroundMealPlan,
  type PlaygroundRecipe,
} from '@/lib/session-storage';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner'];

interface MealPlanItem {
  id: string;
  recipe_id: string;
  recipe_name: string;
  day_of_week: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
}

export default function PlaygroundMealPlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [items, setItems] = useState<MealPlanItem[]>([]);
  const [recipes, setRecipes] = useState<PlaygroundRecipe[]>([]);

  // Recipe selector dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(0);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServings, setSelectedServings] = useState(4);

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const loadData = () => {
    // Load recipes from session storage
    const playgroundRecipes = getPlaygroundRecipes();
    setRecipes(playgroundRecipes);

    // Load meal plan from session storage
    const mealPlan = getPlaygroundMealPlan();
    if (mealPlan) {
      setItems(mealPlan.items);
    } else {
      setItems([]);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleAddRecipe = (dayOfWeek: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedDayOfWeek(dayOfWeek);
    setSelectedMealType(mealType);
    setIsDialogOpen(true);
  };

  const handleSelectRecipe = (recipe: PlaygroundRecipe) => {
    try {
      addRecipeToPlaygroundMealPlan(
        recipe.id,
        recipe.name,
        selectedDayOfWeek,
        selectedMealType,
        selectedServings
      );

      loadData();
      setIsDialogOpen(false);
      setSearchQuery('');
      toast.success(`Added "${recipe.name}" to your meal plan`);
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Failed to add recipe');
    }
  };

  const handleRemoveRecipe = (itemId: string) => {
    try {
      removeRecipeFromPlaygroundMealPlan(itemId);
      loadData();
      toast.success('Recipe removed from meal plan');
    } catch (error) {
      console.error('Error removing recipe:', error);
      toast.error('Failed to remove recipe');
    }
  };

  const getItemForSlot = (dayOfWeek: number, mealType: string) => {
    return items.find((item) => item.day_of_week === dayOfWeek && item.meal_type === mealType);
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate week dates for display
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    weekDates.push(date);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Weekly Meal Planner
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your meals for the week
          </p>
        </div>

        <Button asChild variant="default" size="lg">
          <Link href="/signup">
            <Save className="mr-2 h-5 w-5" />
            Sign Up to Save Permanently
          </Link>
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Week
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {currentWeekStart.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                {' - '}
                {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} meal{items.length !== 1 ? 's' : ''} planned
              </p>
            </div>

            <Button variant="outline" onClick={handleNextWeek}>
              Next Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Recipes Warning */}
      {recipes.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-amber-900 dark:text-amber-100 font-medium mb-2">
              You haven&apos;t generated any recipes yet!
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
              Generate some recipes first before planning your meals.
            </p>
            <Button asChild>
              <Link href="/playground">
                Generate Recipes
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meal Plan Grid */}
      {recipes.length > 0 && (
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

              {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                const item = getItemForSlot(dayOfWeek, mealType);

                return (
                  <Card key={dayOfWeek} className="min-h-[120px]">
                    <CardContent className="p-3">
                      {item ? (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div className="text-sm font-medium line-clamp-2 flex-1">
                              {item.recipe_name}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => handleRemoveRecipe(item.id)}
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
                          onClick={() => handleAddRecipe(dayOfWeek, mealType)}
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
      )}

      {/* Generate Shopping List Button */}
      {items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            asChild
            className="gap-2"
          >
            <Link href="/playground/shopping-list">
              <ShoppingCart className="h-5 w-5" />
              Generate Shopping List ({items.length} {items.length === 1 ? 'recipe' : 'recipes'})
            </Link>
          </Button>
        </div>
      )}

      {/* Recipe Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Recipe to {DAYS_OF_WEEK[selectedDayOfWeek]}</DialogTitle>
            <DialogDescription>
              Select a recipe for {selectedMealType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={selectedServings}
                onChange={(e) => setSelectedServings(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              {filteredRecipes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recipes found. Try generating some first!
                </p>
              ) : (
                filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recipe.prep_time}m prep • {recipe.cook_time}m cook • {recipe.servings} servings
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
