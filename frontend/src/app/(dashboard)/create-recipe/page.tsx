'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChefHat, Loader2, AlertTriangle, Info, Package, CheckCircle, Circle, Leaf, Eye, EyeOff, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Recipe } from '@/types/recipe';
import type { UserPreferences } from '@/types/user-profile';
import type { IngredientMode } from '@/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FeedbackButton } from '@/components/feedback-button';
import { MODEL_STYLES, getStyleName, getStyleIcon, getStyleDisplay } from '@/lib/model-styles';
import { UK_ALLERGENS } from '@/lib/allergen-detector';

// Dietary restriction options (from preferences-form.tsx)
const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' }
];

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
  const [selectedModel, setSelectedModel] = useState<'model_1' | 'model_2' | 'model_3' | 'model_4' | 'all'>('all');
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
  const [cookingMode, setCookingMode] = useState<'slow_cooker' | 'air_fryer' | 'batch_cook' | undefined>(undefined);
  const [spiceLevel, setSpiceLevel] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // State for collapsible sections
  const [pantryExpanded, setPantryExpanded] = useState(false);

  // State for mobile drawer
  const [ingredientModeDrawerOpen, setIngredientModeDrawerOpen] = useState(false);

  // Temporary overrides for allergens, dietary, and pantry (session-only, not saved to DB)
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [tempDietaryRestrictions, setTempDietaryRestrictions] = useState<string[]>([]);
  const [excludedPantryStaples, setExcludedPantryStaples] = useState<string[]>([]);

  // Info card dismiss state
  const [showStylesInfo, setShowStylesInfo] = useState(true);

  // Check localStorage for info card dismiss state
  useEffect(() => {
    const dismissed = localStorage.getItem('stylesInfoDismissed');
    if (dismissed === 'true') {
      setShowStylesInfo(false);
    }
  }, []);

  // Handle info card dismiss
  const handleDismissStylesInfo = () => {
    setShowStylesInfo(false);
    localStorage.setItem('stylesInfoDismissed', 'true');
  };

  // Fetch user preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const prefs = data.profile?.preferences;
          setUserPreferences(prefs);
          // Note: Servings will use placeholder from household_size, not pre-fill
        }
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchPreferences();
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
  const generateSingleRecipe = async (
    model: 'model_1' | 'model_2' | 'model_3' | 'model_4',
    cuisineOverride?: string
  ) => {
    const ingredients = ingredientsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const apiModel = getAPIModelKey(model);

    // Apply temporary overrides if set, otherwise use saved preferences
    const effectiveAllergies = tempAllergies.length > 0 ? tempAllergies : (userPreferences?.allergies || []);
    const effectiveDietaryRestrictions = tempDietaryRestrictions.length > 0 ? tempDietaryRestrictions : (userPreferences?.dietary_restrictions || []);

    // Filter out excluded pantry staples
    const activePantryStaples = pantryStaples.filter(item => !excludedPantryStaples.includes(item));

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients,
        description: descriptionText.trim() || undefined,
        ingredient_mode: ingredientMode,
        servings: servings || 4,
        prepTimeMax: maxCookTime || undefined,
        cooking_mode: cookingMode,
        difficulty: skillLevel || undefined,
        spice_level: spiceLevel || undefined,
        favourite_cuisine: cuisineOverride || (favouriteCuisine && favouriteCuisine !== 'any' ? favouriteCuisine : undefined),
        // Override user preferences with temporary session values
        preferences: {
          allergies: effectiveAllergies,
          dietary_restrictions: effectiveDietaryRestrictions,
        },
        // Pass filtered pantry staples (API will use these instead of DB lookup)
        pantry_staples: activePantryStaples,
        model: apiModel,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error === 'Safety Warning' && error.conflicts) {
        throw new Error(`⚠️ ALLERGEN WARNING:\n\n${error.message}`);
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
      setGenerationProgress({ current: 0, total: 4, currentModel: getStyleName('model_1') });

      const models: Array<'model_1' | 'model_2' | 'model_3' | 'model_4'> = ['model_1', 'model_2', 'model_3', 'model_4'];
      const results: typeof generatedRecipes = { model_1: null, model_2: null, model_3: null, model_4: null };

      // Get user's preferred cuisines and shuffle them for variety
      const preferredCuisines = userPreferences?.cuisines_liked || [];
      let shuffledCuisines: string[] = [];

      if (preferredCuisines.length > 0) {
        // Fisher-Yates shuffle algorithm for random distribution
        shuffledCuisines = [...preferredCuisines];
        for (let i = shuffledCuisines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCuisines[i], shuffledCuisines[j]] = [shuffledCuisines[j], shuffledCuisines[i]];
        }
      }

      try {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          const styleName = getStyleName(model);

          setGenerationProgress({
            current: i,
            total: 4,
            currentModel: styleName,
          });

          try {
            const startTime = Date.now();

            // Assign cuisine to this model (cycle if more models than cuisines)
            const cuisineForModel = shuffledCuisines.length > 0
              ? shuffledCuisines[i % shuffledCuisines.length]
              : undefined;

            const { recipe } = await generateSingleRecipe(model, cuisineForModel);
            const duration = ((Date.now() - startTime) / 1000).toFixed(0);

            results[model] = recipe;
            setGeneratedRecipes({ ...results });

            console.log(`${styleName} (${model}) completed in ${duration}s`);
          } catch (error) {
            console.error(`Error generating with ${styleName} (${model}):`, error);
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
      router.push(`/my-recipes/${savedRecipe.id}`);
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
      router.push('/my-recipes');
    } catch (error) {
      console.error('Error saving recipes:', error);
      alert('Failed to save some recipes');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-2xl">
      <Breadcrumb items={[
        { label: 'My Recipes', href: '/my-recipes' },
        { label: 'Create Recipe' }
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Create Recipe
        </h1>
        <p className="text-muted-foreground mt-1">
          Recipes built around your diet, allergies, and ingredients. Generate one or compare four different styles—each with a unique approach.
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Important Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This is a technical demonstration project. AI-generated recipes have not been tested in real kitchens and should not be used for actual cooking or relied upon for allergen safety. Development paused pending implementation of testing protocols.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Allergens & Restrictions - Inline Editable */}
        {!isLoadingPreferences && userPreferences && (
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="py-3">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="allergens" className="border-none">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Allergens & Restrictions:</span>{' '}
                          <span className="text-muted-foreground">
                            {(() => {
                              const active = tempAllergies.length > 0 ? tempAllergies : (userPreferences.allergies || []);
                              return active.length > 0
                                ? `Avoiding ${active.length} item${active.length > 1 ? 's' : ''}`
                                : 'None set';
                            })()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {UK_ALLERGENS.map((allergen) => (
                        <div key={allergen.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`temp-${allergen.id}`}
                            checked={
                              tempAllergies.length > 0
                                ? tempAllergies.includes(allergen.id)
                                : (userPreferences.allergies || []).includes(allergen.id)
                            }
                            onCheckedChange={(checked) => {
                              const currentAllergies = tempAllergies.length > 0
                                ? tempAllergies
                                : (userPreferences.allergies || []);

                              if (checked) {
                                setTempAllergies([...currentAllergies, allergen.id]);
                              } else {
                                setTempAllergies(currentAllergies.filter(a => a !== allergen.id));
                              }
                            }}
                          />
                          <Label htmlFor={`temp-${allergen.id}`} className="cursor-pointer text-sm">
                            {allergen.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {tempAllergies.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                        <span>💡 Changes apply to this recipe only</span>
                        <button
                          onClick={() => setTempAllergies([])}
                          className="text-primary hover:underline"
                        >
                          Reset to saved
                        </button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Dietary Preferences - Inline Editable */}
        {!isLoadingPreferences && userPreferences && (
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="py-3">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dietary" className="border-none">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Dietary Preferences:</span>{' '}
                          <span className="text-muted-foreground">
                            {(() => {
                              const active = tempDietaryRestrictions.length > 0 ? tempDietaryRestrictions : (userPreferences.dietary_restrictions || []);
                              return active.length > 0
                                ? active.map(d => DIETARY_OPTIONS.find(opt => opt.id === d)?.label).join(', ')
                                : 'None set';
                            })()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {DIETARY_OPTIONS.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`temp-diet-${option.id}`}
                            checked={
                              tempDietaryRestrictions.length > 0
                                ? tempDietaryRestrictions.includes(option.id)
                                : (userPreferences.dietary_restrictions || []).includes(option.id)
                            }
                            onCheckedChange={(checked) => {
                              const currentDietary = tempDietaryRestrictions.length > 0
                                ? tempDietaryRestrictions
                                : (userPreferences.dietary_restrictions || []);

                              if (checked) {
                                setTempDietaryRestrictions([...currentDietary, option.id]);
                              } else {
                                setTempDietaryRestrictions(currentDietary.filter(d => d !== option.id));
                              }
                            }}
                          />
                          <Label htmlFor={`temp-diet-${option.id}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {tempDietaryRestrictions.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                        <span>💡 Changes apply to this recipe only</span>
                        <button
                          onClick={() => setTempDietaryRestrictions([])}
                          className="text-primary hover:underline"
                        >
                          Reset to saved
                        </button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Input Section - Restructured */}
        <div className="space-y-6">
          {/* Pantry Staples Display - With Toggle Exclusion */}
          {pantryStaples.length > 0 && (
            <div className="mb-6">
              {/* Collapsed View (Mobile Default) */}
              {!pantryExpanded ? (
                <button
                  onClick={() => setPantryExpanded(true)}
                  className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors w-full text-left md:hidden"
                >
                  <Package className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    ✓ {pantryStaples.filter(item => !excludedPantryStaples.includes(item)).length}/{pantryStaples.length} Pantry Staples Active
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">Tap to edit</span>
                </button>
              ) : null}

              {/* Expanded View (Desktop Always, Mobile on Tap) */}
              {(pantryExpanded || true) && (
                <Card className={`bg-green-500/5 border-green-500/20 ${!pantryExpanded ? 'hidden md:block' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base">Your Pantry Staples</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPantryExpanded(false)}
                        className="h-8 text-xs md:hidden"
                      >
                        Collapse
                      </Button>
                    </div>
                    <CardDescription>
                      Items you have at home. Click eye icon to exclude from this recipe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {pantryStaples.map((item, index) => {
                        const isExcluded = excludedPantryStaples.includes(item);
                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`capitalize flex items-center gap-1.5 pr-1.5 transition-opacity ${
                              isExcluded ? 'opacity-50' : 'opacity-100'
                            }`}
                          >
                            {item}
                            <button
                              onClick={() => {
                                if (isExcluded) {
                                  setExcludedPantryStaples(excludedPantryStaples.filter(i => i !== item));
                                } else {
                                  setExcludedPantryStaples([...excludedPantryStaples, item]);
                                }
                              }}
                              className="hover:bg-secondary-foreground/20 rounded p-0.5"
                              aria-label={isExcluded ? `Include ${item}` : `Exclude ${item}`}
                            >
                              {isExcluded ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                    {excludedPantryStaples.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                        <span>💡 {excludedPantryStaples.length} item{excludedPantryStaples.length > 1 ? 's' : ''} excluded for this recipe</span>
                        <button
                          onClick={() => setExcludedPantryStaples([])}
                          className="text-primary hover:underline"
                        >
                          Include all
                        </button>
                      </div>
                    )}
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
                        <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Ingredient Mode:</span>{' '}
                          <span className="text-muted-foreground">
                            {ingredientMode === 'strict' && 'Use Only What I Have'}
                            {ingredientMode === 'flexible' && 'Flexible'}
                            {ingredientMode === 'creative' && 'Creative'}
                          </span>
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
              <div className="hidden md:block">
                <Drawer open={ingredientModeDrawerOpen} onOpenChange={setIngredientModeDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button className="flex items-center justify-between w-full text-left">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Ingredient Mode:</span>{' '}
                          <span className="text-muted-foreground">
                            {ingredientMode === 'strict' && 'Use Only What I Have'}
                            {ingredientMode === 'flexible' && 'Flexible'}
                            {ingredientMode === 'creative' && 'Creative'}
                          </span>
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                        <ChefHat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">Recipe Preferences:</span>{' '}
                          <span className="text-muted-foreground">Saved</span>
                        </span>
                      </div>
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
                          placeholder={(userPreferences?.household_size || 4).toString()}
                          value={servings ?? ''}
                          onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cookingMode" className="text-sm">Cooking Mode (Optional)</Label>
                        <Select
                          value={cookingMode || 'none'}
                          onValueChange={(value) => setCookingMode(value === 'none' ? undefined : value as 'slow_cooker' | 'air_fryer' | 'batch_cook')}
                        >
                          <SelectTrigger id="cookingMode">
                            <SelectValue placeholder="Traditional Cooking" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Traditional Cooking</SelectItem>
                            <SelectItem value="slow_cooker">Slow Cooker</SelectItem>
                            <SelectItem value="air_fryer">Air Fryer</SelectItem>
                            <SelectItem value="batch_cook">Batch Cooking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {cookingMode !== 'slow_cooker' && (
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
                      )}

                      {cookingMode === 'slow_cooker' && (
                        <div className="space-y-2 col-span-2">
                          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="font-medium text-blue-900 dark:text-blue-100">Slow Cooker Mode</p>
                            <p className="text-xs mt-1">Recipes will be designed for 3-10 hours of slow cooking. Time constraints are automatically adjusted.</p>
                          </div>
                        </div>
                      )}

                      {cookingMode === 'air_fryer' && (
                        <div className="space-y-2 col-span-2">
                          <div className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                            <p className="font-medium text-orange-900 dark:text-orange-100">Air Fryer Mode</p>
                            <p className="text-xs mt-1">Recipes will include temperature settings (160-200°C), preheating instructions, and reminders to shake/flip halfway through. Cooking times are typically 8-25 minutes.</p>
                          </div>
                        </div>
                      )}

                      {cookingMode === 'batch_cook' && (
                        <div className="space-y-2 col-span-2">
                          <div className="text-sm text-muted-foreground bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                            <p className="font-medium text-purple-900 dark:text-purple-100">Batch Cooking Mode</p>
                            <p className="text-xs mt-1">Recipes will be scaled to 6-12 portions with freezing, storage, and reheating instructions. Perfect for meal prep and saving time during the week.</p>
                          </div>
                        </div>
                      )}

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

          {/* Info Card - Why Four Styles? */}
          {showStylesInfo && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Why four styles?
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Different recipe styles have different strengths—one might give detailed steps, another quick simplicity. Generate all four to compare and find your favourite, or stick with one you know works for you.
                    </p>
                  </div>
                  <button
                    onClick={handleDismissStylesInfo}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. AI Model & Generate - Prominent CTA */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generate Your Recipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="aiModel" className="text-sm">Choose Your Recipe Style</Label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as 'model_1' | 'model_2' | 'model_3' | 'model_4' | 'all')}
                >
                  <SelectTrigger id="aiModel" className="h-11">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🎨 All 4 Styles (Compare)</SelectItem>
                    <SelectItem value="model_1">
                      <div className="flex flex-col gap-0.5">
                        <span>{MODEL_STYLES.model_1.icon} {MODEL_STYLES.model_1.name}</span>
                        <span className="text-xs text-muted-foreground">{MODEL_STYLES.model_1.tagline}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="model_2">
                      <div className="flex flex-col gap-0.5">
                        <span>{MODEL_STYLES.model_2.icon} {MODEL_STYLES.model_2.name}</span>
                        <span className="text-xs text-muted-foreground">{MODEL_STYLES.model_2.tagline}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="model_3">
                      <div className="flex flex-col gap-0.5">
                        <span>{MODEL_STYLES.model_3.icon} {MODEL_STYLES.model_3.name}</span>
                        <span className="text-xs text-muted-foreground">{MODEL_STYLES.model_3.tagline}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="model_4">
                      <div className="flex flex-col gap-0.5">
                        <span>{MODEL_STYLES.model_4.icon} {MODEL_STYLES.model_4.name}</span>
                        <span className="text-xs text-muted-foreground">{MODEL_STYLES.model_4.tagline}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Not sure which to pick? <span className="font-medium">Balanced</span> is a great starting point, or try <span className="font-medium">All 4 Styles</span> to compare.
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
                    {isGeneratingAll ? 'Generating All Styles...' : `Generating with ${getStyleName(selectedModel)}...`}
                  </>
                ) : (
                  <>
                    {selectedModel === 'all' ? 'Generate All 4 Styles' : 'Generate Recipe'}
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
                    {['model_1', 'model_2', 'model_3', 'model_4'].map((modelId, index) => {
                      const isComplete = generationProgress.current > index;
                      const isCurrent = generationProgress.current === index;
                      const isWaiting = generationProgress.current < index;
                      const styleName = getStyleName(modelId);
                      const styleIcon = getStyleIcon(modelId);

                      return (
                        <div key={modelId} className="flex items-center gap-2">
                          {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {isCurrent && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          {isWaiting && <Circle className="h-4 w-4 text-muted-foreground" />}
                          <span className={isComplete ? 'text-green-500' : isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}>
                            {styleIcon} {styleName} {isComplete ? 'complete' : isCurrent ? 'generating...' : 'waiting'}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{generatedRecipe.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {generatedRecipe.description}
                    </CardDescription>
                  </div>
                  {generatedRecipe.ai_model && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {getStyleDisplay(generatedRecipe.ai_model)}
                    </Badge>
                  )}
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
                <CardTitle>Generated Recipes (4 Styles)</CardTitle>
                <CardDescription>
                  Compare recipes from different recipe styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="model_1" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="model_1">{getStyleIcon('model_1')} {getStyleName('model_1')}</TabsTrigger>
                    <TabsTrigger value="model_2">{getStyleIcon('model_2')} {getStyleName('model_2')}</TabsTrigger>
                    <TabsTrigger value="model_3">{getStyleIcon('model_3')} {getStyleName('model_3')}</TabsTrigger>
                    <TabsTrigger value="model_4">{getStyleIcon('model_4')} {getStyleName('model_4')}</TabsTrigger>
                  </TabsList>

                  {(['model_1', 'model_2', 'model_3', 'model_4'] as const).map((modelKey) => {
                    const recipe = generatedRecipes[modelKey];
                    return (
                      <TabsContent key={modelKey} value={modelKey} className="space-y-4 mt-4">
                        {recipe ? (
                          <>
                            <div>
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-lg font-semibold flex-1">{recipe.name}</h3>
                                <Badge variant="secondary" className="flex-shrink-0">
                                  {getStyleDisplay(modelKey)}
                                </Badge>
                              </div>
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
