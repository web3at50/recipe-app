'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChefHat, Loader2, AlertTriangle, Info, Package, CheckCircle, Circle, Leaf, Settings2, Sparkles } from 'lucide-react';
import type { Recipe } from '@/types/recipe';
import type { UserPreferences } from '@/types/user-profile';
import type { IngredientMode } from '@/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FeedbackButton } from '@/components/feedback-button';

// Helper function to map model numbers to API model keys
const getAPIModelKey = (model: 'model_1' | 'model_2' | 'model_3' | 'model_4'): 'openai' | 'claude' | 'gemini' | 'grok' => {
  const mapping = {
    model_1: 'openai',
    model_2: 'claude',
    model_3: 'gemini',
    model_4: 'grok',
  } as const;
  return mapping[model];
};

export default function GeneratePage() {
  const router = useRouter();
  const [ingredientsText, setIngredientsText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [selectedModel, setSelectedModel] = useState<'model_1' | 'model_2' | 'model_3' | 'model_4' | 'all'>('model_1');
  const [servings, setServings] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [allergenWarnings, setAllergenWarnings] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // New state for enhanced features
  const [ingredientMode, setIngredientMode] = useState<IngredientMode>('flexible');
  const [pantryStaples, setPantryStaples] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [maxCookTime, setMaxCookTime] = useState<number | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<string | null>(null);
  const [favouriteCuisine, setFavouriteCuisine] = useState<string | null>(null);

  // State for "All 4" feature
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<{
    model_1: Recipe | null;
    model_2: Recipe | null;
    model_3: Recipe | null;
    model_4: Recipe | null;
  }>({ model_1: null, model_2: null, model_3: null, model_4: null });
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    currentModel: string;
  } | null>(null);

  // State for collapsible profile and pantry
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [pantryExpanded, setPantryExpanded] = useState(false);

  // State for mobile drawer
  const [ingredientModeDrawerOpen, setIngredientModeDrawerOpen] = useState(false);

  // Fetch user preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const prefs = data.profile?.preferences;
          setUserPreferences(prefs);
          // Set default servings from user preferences
          if (prefs?.household_size && servings === null) {
            setServings(prefs.household_size);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch pantry staples on mount
  useEffect(() => {
    const fetchPantryStaples = async () => {
      try {
        const response = await fetch('/api/user/pantry-staples');
        if (response.ok) {
          const data = await response.json();
          const items = data.staples?.map((s: { item_pattern: string }) => s.item_pattern) || [];
          setPantryStaples(items);
        }
      } catch (error) {
        console.error('Failed to fetch pantry staples:', error);
      }
    };

    fetchPantryStaples();
  }, []);

  // Generate recipe with a single model
  const generateSingleRecipe = async (model: 'model_1' | 'model_2' | 'model_3' | 'model_4') => {
    const ingredients = ingredientsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const apiModel = getAPIModelKey(model);

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients,
        description: descriptionText.trim() || undefined,
        ingredient_mode: ingredientMode,
        servings: servings || 4,
        prepTimeMax: maxCookTime || undefined,
        difficulty: skillLevel || undefined,
        spice_level: spiceLevel || undefined,
        favourite_cuisine: favouriteCuisine && favouriteCuisine !== 'any' ? favouriteCuisine : undefined,
        model: apiModel,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error === 'Safety Warning' && error.conflicts) {
        throw new Error(`⚠️ ALLERGEN WARNING:\n\n${error.message}\n\nPlease remove these ingredients and try again.`);
      }
      throw new Error(error.error || 'Failed to generate recipe');
    }

    const data = await response.json();
    return {
      recipe: { ...data.recipe, ai_model: model },
      allergen_warnings: data.allergen_warnings || [],
    };
  };

  const handleGenerate = async () => {
    if (!ingredientsText.trim()) {
      alert('Please enter at least one ingredient');
      return;
    }

    // Check if generating all 4 models
    if (selectedModel === 'all') {
      setIsGeneratingAll(true);
      setGeneratedRecipes({ model_1: null, model_2: null, model_3: null, model_4: null });
      setGenerationProgress({ current: 0, total: 4, currentModel: 'ChatGPT' });

      const models: Array<'model_1' | 'model_2' | 'model_3' | 'model_4'> = ['model_1', 'model_2', 'model_3', 'model_4'];
      const modelNames = ['ChatGPT', 'Claude', 'Gemini', 'Grok'];
      const results: typeof generatedRecipes = { model_1: null, model_2: null, model_3: null, model_4: null };

      try {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          const modelName = modelNames[i];

          setGenerationProgress({
            current: i,
            total: 4,
            currentModel: modelName,
          });

          try {
            const startTime = Date.now();
            const { recipe } = await generateSingleRecipe(model);
            const duration = ((Date.now() - startTime) / 1000).toFixed(0);

            results[model] = recipe;
            setGeneratedRecipes({ ...results });

            console.log(`${modelName} completed in ${duration}s`);
          } catch (error) {
            console.error(`Error generating with ${modelName}:`, error);
            // Continue with other models even if one fails
          }
        }

        setGenerationProgress({ current: 4, total: 4, currentModel: 'Complete!' });
      } catch (error) {
        console.error('Error in multi-model generation:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate recipes');
      } finally {
        setIsGeneratingAll(false);
        setTimeout(() => setGenerationProgress(null), 2000);
      }
    } else {
      // Single model generation
      setIsGenerating(true);
      setGeneratedRecipe(null);
      setAllergenWarnings([]);

      try {
        const { recipe, allergen_warnings } = await generateSingleRecipe(selectedModel as 'model_1' | 'model_2' | 'model_3' | 'model_4');
        setGeneratedRecipe(recipe);
        setAllergenWarnings(allergen_warnings);
      } catch (error) {
        console.error('Error generating recipe:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate recipe');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveRecipe = async (recipe: Recipe, modelOverride?: 'model_1' | 'model_2' | 'model_3' | 'model_4') => {
    if (!recipe) return;

    const aiModel = modelOverride || recipe.ai_model;

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipe.name,
          description: recipe.description,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          ai_model: aiModel,
          source: 'ai_generated',
          ingredients: recipe.ingredients.map((ing) => ({
            item: ing.item,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
          })),
          instructions: recipe.instructions.map((inst) => ({
            instruction: inst.instruction,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      const { recipe: savedRecipe } = await response.json();
      return savedRecipe;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  const handleSaveSingleRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      const savedRecipe = await handleSaveRecipe(generatedRecipe);
      router.push(`/recipes/${savedRecipe.id}`);
    } catch {
      alert('Failed to save recipe');
    }
  };

  const handleSaveAllRecipes = async () => {
    const recipesToSave = Object.entries(generatedRecipes).filter(([, recipe]) => recipe !== null);

    if (recipesToSave.length === 0) {
      alert('No recipes to save');
      return;
    }

    try {
      const savePromises = recipesToSave.map(([model, recipe]) =>
        handleSaveRecipe(recipe as Recipe, model as 'model_1' | 'model_2' | 'model_3' | 'model_4')
      );

      await Promise.all(savePromises);
      alert(`Successfully saved ${recipesToSave.length} recipes to your collection!`);
      router.push('/recipes');
    } catch (error) {
      console.error('Error saving recipes:', error);
      alert('Failed to save some recipes');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-2xl">
      <Breadcrumb items={[
        { label: 'My Recipes', href: '/recipes' },
        { label: 'AI Generate' }
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Recipe Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate custom recipe(s) in minutes
        </p>
      </div>

      <div className="space-y-6">
        {/* User Preferences Summary - Collapsible */}
        {!isLoadingPreferences && userPreferences && (
          <div className="mb-6">
            {!profileExpanded ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg border">
                <button
                  onClick={() => setProfileExpanded(true)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Allergens in amber */}
                    {userPreferences.allergies && userPreferences.allergies.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100 rounded font-medium">
                        ⚠️ Avoiding: {userPreferences.allergies.join(', ')}
                      </span>
                    )}
                    {/* Dietary restrictions in blue */}
                    {userPreferences.dietary_restrictions && userPreferences.dietary_restrictions.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 rounded font-medium">
                        🥗 {userPreferences.dietary_restrictions.join(', ')}
                      </span>
                    )}
                    {/* If neither exists */}
                    {(!userPreferences.allergies || userPreferences.allergies.length === 0) &&
                      (!userPreferences.dietary_restrictions || userPreferences.dietary_restrictions.length === 0) && (
                      <span className="text-sm text-muted-foreground">No dietary restrictions set</span>
                    )}
                  </div>
                </button>
                <Button variant="link" size="sm" asChild className="h-auto p-0 flex-shrink-0">
                  <Link href="/settings">Edit →</Link>
                </Button>
              </div>
            ) : (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Your Profile</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProfileExpanded(false)}
                      className="h-8 text-xs"
                    >
                      Collapse
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Servings</p>
                      <p className="font-medium">{userPreferences.household_size || 2}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skill Level</p>
                      <p className="font-medium capitalize">{userPreferences.cooking_skill || 'intermediate'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Typical Time</p>
                      <p className="font-medium">{userPreferences.typical_cook_time || 30} mins</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spice Level</p>
                      <p className="font-medium capitalize">{userPreferences.spice_level || 'medium'}</p>
                    </div>
                  </div>
                  {userPreferences.cuisines_liked && userPreferences.cuisines_liked.length > 0 && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm">Favourite Cuisines</p>
                      <p className="font-medium">{userPreferences.cuisines_liked.join(', ')}</p>
                    </div>
                  )}
                  {userPreferences.dietary_restrictions && userPreferences.dietary_restrictions.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Leaf className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-500">Dietary Preferences</p>
                          <p className="text-muted-foreground capitalize">
                            {userPreferences.dietary_restrictions.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {userPreferences.allergies && userPreferences.allergies.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-500">Active Allergen Protection</p>
                          <p className="text-muted-foreground">
                            Avoiding: {userPreferences.allergies.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {/* Input Section - Restructured */}
        <div className="space-y-6">
          {/* Pantry Staples Display - Collapsible on Mobile */}
          {pantryStaples.length > 0 && (
            <div className="mb-6">
              {/* Collapsed View (Mobile Default) */}
              {!pantryExpanded ? (
                <button
                  onClick={() => setPantryExpanded(true)}
                  className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-colors w-full text-left md:hidden"
                >
                  <Package className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">
                    ✓ {pantryStaples.length} Pantry Staples Available
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">Tap to view</span>
                </button>
              ) : null}

              {/* Expanded View (Desktop Always, Mobile on Tap) */}
              {(pantryExpanded || true) && (
                <Card className={`bg-secondary/10 border-secondary/20 ${!pantryExpanded ? 'hidden md:block' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-secondary-foreground" />
                        <CardTitle className="text-base">Your Pantry Staples</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPantryExpanded(false)}
                          className="h-8 text-xs md:hidden"
                        >
                          Collapse
                        </Button>
                        <Button variant="link" size="sm" asChild className="h-auto p-0">
                          <Link href="/settings/pantry-staples">Edit →</Link>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Items you have at home (used in recipe generation)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pantryStaples.map((item, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 1. Your Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Your Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="ingredients"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder={"Chicken breast\nOnions\nGarlic\nRice\n..."}
                className="min-h-[150px] font-mono"
              />
            </CardContent>
          </Card>

          {/* 2. What Kind of Dish? */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What kind of dish? (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="description"
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="E.g., Something creamy and comforting, Italian-style, not too spicy..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* 3. Ingredient Mode - Compact Single Line */}
          <Card>
            <CardContent className="py-3">
              {/* Mobile: Drawer */}
              <div className="md:hidden">
                <Drawer open={ingredientModeDrawerOpen} onOpenChange={setIngredientModeDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button className="flex items-center justify-between w-full text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍳</span>
                        <span className="text-sm">
                          <span className="font-medium">Ingredient Mode:</span>{' '}
                          <span className="text-muted-foreground">
                            {ingredientMode === 'strict' && 'Use Only What I Have'}
                            {ingredientMode === 'flexible' && 'Flexible'}
                            {ingredientMode === 'creative' && 'Creative'}
                          </span>
                        </span>
                      </div>
                      <span className="text-xs text-primary font-medium flex-shrink-0 ml-2">Edit →</span>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Choose Ingredient Mode</DrawerTitle>
                      <DrawerDescription>
                        How should AI use your ingredients?
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4 space-y-3">
                      <button
                        onClick={() => {
                          setIngredientMode('strict');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'strict'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          🏠 Use Only What I Have
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Use only listed ingredients
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIngredientMode('flexible');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'flexible'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          ⚖️ Flexible (Default)
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Listed ingredients + common pantry basics
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIngredientMode('creative');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'creative'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          ✨ Creative - Inspire Me!
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Listed ingredients + exciting new ingredients
                        </div>
                      </button>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Desktop: Inline Display with Popover/Dropdown */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍳</span>
                  <span className="text-sm">
                    <span className="font-medium">Ingredient Mode:</span>{' '}
                    <span className="text-muted-foreground">
                      {ingredientMode === 'strict' && 'Use Only What I Have'}
                      {ingredientMode === 'flexible' && 'Flexible'}
                      {ingredientMode === 'creative' && 'Creative'}
                    </span>
                  </span>
                </div>
                <Drawer open={ingredientModeDrawerOpen} onOpenChange={setIngredientModeDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button className="text-xs text-primary font-medium flex-shrink-0 ml-2">
                      Edit →
                    </button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Choose Ingredient Mode</DrawerTitle>
                      <DrawerDescription>
                        How should AI use your ingredients?
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4 space-y-3">
                      <button
                        onClick={() => {
                          setIngredientMode('strict');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'strict'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          🏠 Use Only What I Have
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Use only listed ingredients
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIngredientMode('flexible');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'flexible'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          ⚖️ Flexible (Default)
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Listed ingredients + common pantry basics
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIngredientMode('creative');
                          setIngredientModeDrawerOpen(false);
                        }}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ingredientMode === 'creative'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-2">
                          ✨ Creative - Inspire Me!
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Listed ingredients + exciting new ingredients
                        </div>
                      </button>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Recipe Preferences - Compact Single Line */}
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="preferences" className="border-none">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Recipe Preferences:</span>{' '}
                          <span className="text-muted-foreground">Saved</span>
                        </span>
                      </div>
                      <span className="text-xs text-primary font-medium flex-shrink-0 ml-2">Edit →</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="servings" className="text-sm">Servings</Label>
                        <Input
                          id="servings"
                          type="number"
                          min="1"
                          max="20"
                          value={servings || userPreferences?.household_size || 4}
                          onChange={(e) => setServings(parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxTime" className="text-sm">Max Time (mins)</Label>
                        <Input
                          id="maxTime"
                          type="number"
                          min="10"
                          max="180"
                          step="5"
                          placeholder={(userPreferences?.typical_cook_time || 30).toString()}
                          value={maxCookTime ?? ''}
                          onChange={(e) => setMaxCookTime(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skillLevel" className="text-sm">Skill Level</Label>
                        <Select
                          value={skillLevel || userPreferences?.cooking_skill || 'intermediate'}
                          onValueChange={setSkillLevel}
                        >
                          <SelectTrigger id="skillLevel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spiceLevel" className="text-sm">Spice Level</Label>
                        <Select
                          value={spiceLevel || userPreferences?.spice_level || 'medium'}
                          onValueChange={setSpiceLevel}
                        >
                          <SelectTrigger id="spiceLevel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hot">Hot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* 3. AI Model & Generate - Prominent CTA */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Generate Your Recipe</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="aiModel" className="text-sm">Choose AI Model</Label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as 'model_1' | 'model_2' | 'model_3' | 'model_4' | 'all')}
                >
                  <SelectTrigger id="aiModel" className="h-11">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🎨 All 4 Models (Compare)</SelectItem>
                    <SelectItem value="model_1">ChatGPT (OpenAI)</SelectItem>
                    <SelectItem value="model_2">Claude (Anthropic)</SelectItem>
                    <SelectItem value="model_3">Gemini (Google)</SelectItem>
                    <SelectItem value="model_4">Grok (xAI)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a single AI or compare all 4 to see different variations
                </p>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || isGeneratingAll || !ingredientsText.trim()}
              >
                {(isGenerating || isGeneratingAll) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isGeneratingAll ? 'Generating All Models...' : `Generating with ${
                      selectedModel === 'model_1' ? 'ChatGPT' :
                      selectedModel === 'model_2' ? 'Claude' :
                      selectedModel === 'model_3' ? 'Gemini' :
                      'Grok'
                    }...`}
                  </>
                ) : (
                  <>
                    <ChefHat className="h-5 w-5 mr-2" />
                    {selectedModel === 'all' ? 'Generate All 4 Recipes' : 'Generate Recipe'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div>
          {/* Progress Indicator for "All 4" */}
          {generationProgress && (
            <Card className="mb-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Generating recipes...</span>
                    <span className="text-muted-foreground">{generationProgress.current}/{generationProgress.total}</span>
                  </div>
                  <Progress value={(generationProgress.current / generationProgress.total) * 100} className="h-2" />
                  <div className="space-y-2 text-sm">
                    {['ChatGPT', 'Claude', 'Gemini', 'Grok'].map((modelName, index) => {
                      const isComplete = generationProgress.current > index;
                      const isCurrent = generationProgress.current === index;
                      const isWaiting = generationProgress.current < index;

                      return (
                        <div key={modelName} className="flex items-center gap-2">
                          {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {isCurrent && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          {isWaiting && <Circle className="h-4 w-4 text-muted-foreground" />}
                          <span className={isComplete ? 'text-green-500' : isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}>
                            {modelName} {isComplete ? 'complete' : isCurrent ? 'generating...' : 'waiting'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Single Recipe View */}
          {generatedRecipe && !isGeneratingAll && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{generatedRecipe.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {generatedRecipe.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                  <span>Prep: {generatedRecipe.prep_time}m</span>
                  <span>Cook: {generatedRecipe.cook_time}m</span>
                  <span>Servings: {generatedRecipe.servings}</span>
                </div>

                {allergenWarnings.length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-500 mb-2">⚠️ ALLERGEN WARNING</p>
                        <ul className="space-y-1 text-sm">
                          {allergenWarnings.map((warning, index) => (
                            <li key={index} className="text-red-500">{warning}</li>
                          ))}
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          Please review ingredients carefully before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ing, index) => (
                      <li key={index} className="text-sm p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span className="flex-1">
                          {ing.quantity} {ing.unit} {ing.item}
                          {ing.notes && ` (${ing.notes})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {generatedRecipe.instructions.map((inst, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {inst.step || index + 1}
                        </span>
                        <p className="text-sm flex-1">{inst.instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <Button className="w-full" size="lg" onClick={handleSaveSingleRecipe}>
                  Save Recipe to Collection
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Multiple Recipes View (Tabs) */}
          {Object.values(generatedRecipes).some(r => r !== null) && !generatedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Recipes (4 Models)</CardTitle>
                <CardDescription>
                  Compare recipes from different AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="model_1" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="model_1">ChatGPT</TabsTrigger>
                    <TabsTrigger value="model_2">Claude</TabsTrigger>
                    <TabsTrigger value="model_3">Gemini</TabsTrigger>
                    <TabsTrigger value="model_4">Grok</TabsTrigger>
                  </TabsList>

                  {(['model_1', 'model_2', 'model_3', 'model_4'] as const).map((modelKey) => {
                    const recipe = generatedRecipes[modelKey];
                    return (
                      <TabsContent key={modelKey} value={modelKey} className="space-y-4 mt-4">
                        {recipe ? (
                          <>
                            <div>
                              <h3 className="text-lg font-semibold">{recipe.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                <span>Prep: {recipe.prep_time}m</span>
                                <span>Cook: {recipe.cook_time}m</span>
                                <span>Servings: {recipe.servings}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Ingredients</h4>
                              <ul className="space-y-2">
                                {recipe.ingredients.map((ing, index) => (
                                  <li key={index} className="text-sm p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors flex items-start gap-2">
                                    <span className="text-muted-foreground mt-0.5">•</span>
                                    <span className="flex-1">
                                      {ing.quantity} {ing.unit} {ing.item}
                                      {ing.notes && ` (${ing.notes})`}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Instructions</h4>
                              <ol className="space-y-2">
                                {recipe.instructions.map((inst, index) => (
                                  <li key={index} className="flex gap-2 text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                      {inst.step || index + 1}
                                    </span>
                                    <p className="flex-1">{inst.instruction}</p>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => handleSaveRecipe(recipe, modelKey)}
                            >
                              Save This Recipe
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Temporary error with this model - please try again</p>
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>

                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" size="lg" onClick={handleSaveAllRecipes}>
                    Save All {Object.values(generatedRecipes).filter(r => r !== null).length} Recipes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!generatedRecipe && !Object.values(generatedRecipes).some(r => r !== null) && !generationProgress && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                {(isGenerating || isGeneratingAll) ? (
                  <>
                    <ChefHat className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
                    <p className="text-muted-foreground">
                      AI is cooking up something delicious...
                    </p>
                  </>
                ) : (
                  <>
                    <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Generate Your Recipe?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your AI-generated recipe will appear here
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <FeedbackButton page="generate" />
    </div>
  );
}
