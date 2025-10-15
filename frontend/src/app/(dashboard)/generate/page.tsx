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
import { ChefHat, Loader2, AlertTriangle, Info, Package, CheckCircle, Circle, Leaf } from 'lucide-react';
import type { Recipe } from '@/types/recipe';
import type { UserPreferences } from '@/types/user-profile';
import type { IngredientMode } from '@/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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
      setGenerationProgress({ current: 0, total: 4, currentModel: 'Model 1' });

      const models: Array<'model_1' | 'model_2' | 'model_3' | 'model_4'> = ['model_1', 'model_2', 'model_3', 'model_4'];
      const results: typeof generatedRecipes = { model_1: null, model_2: null, model_3: null, model_4: null };

      try {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          const modelNum = i + 1;

          setGenerationProgress({
            current: i,
            total: 4,
            currentModel: `Model ${modelNum}`,
          });

          try {
            const startTime = Date.now();
            const { recipe } = await generateSingleRecipe(model);
            const duration = ((Date.now() - startTime) / 1000).toFixed(0);

            results[model] = recipe;
            setGeneratedRecipes({ ...results });

            console.log(`Model ${modelNum} completed in ${duration}s`);
          } catch (error) {
            console.error(`Error generating with ${model}:`, error);
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
    const modelLabel = aiModel ? ` (${aiModel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})` : '';

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${recipe.name}${modelLabel}`,
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ChefHat className="h-8 w-8" />
          AI Recipe Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Enter ingredients and let AI create a personalized recipe for you
        </p>
      </div>

      {/* User Preferences Summary */}
      {!isLoadingPreferences && userPreferences && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Your Profile</CardTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Pantry Staples Display */}
          {pantryStaples.length > 0 && (
            <Card className="bg-secondary/10 border-secondary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-secondary-foreground" />
                    <CardTitle className="text-base">Your Pantry Staples</CardTitle>
                  </div>
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <Link href="/settings/pantry-staples">Edit Pantry →</Link>
                  </Button>
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

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Enter ingredients, one per line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingredients">Available Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Chicken breast&#10;Onions&#10;Garlic&#10;Rice&#10;..."
                  className="min-h-[200px] font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  What kind of dish? (Optional)
                  <span className="text-xs text-muted-foreground ml-2">Describe the style or mood</span>
                </Label>
                <Textarea
                  id="description"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="E.g., Something creamy and comforting, Italian-style, not too spicy..."
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  This helps the AI understand what kind of recipe you&apos;re looking for
                </p>
              </div>

              {/* Ingredient Mode Toggle */}
              <div className="space-y-3 p-4 bg-muted rounded-lg border-2 border-muted">
                <Label className="text-base font-semibold">Ingredient Mode</Label>
                <RadioGroup value={ingredientMode} onValueChange={(v) => setIngredientMode(v as IngredientMode)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="strict" id="strict" className="mt-1" />
                      <Label htmlFor="strict" className="font-normal cursor-pointer flex-1">
                        <div className="font-medium">🔒 No Shop</div>
                        <div className="text-xs text-muted-foreground">Use only what I have</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                      <Label htmlFor="flexible" className="font-normal cursor-pointer flex-1">
                        <div className="font-medium">🧑‍🍳 Flexible (Default)</div>
                        <div className="text-xs text-muted-foreground">Use what I have + pantry basics</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="creative" id="creative" className="mt-1" />
                      <Label htmlFor="creative" className="font-normal cursor-pointer flex-1">
                        <div className="font-medium">✨ Creative</div>
                        <div className="text-xs text-muted-foreground">Inspire me with new ingredients</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Cooking Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
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
                  <Label htmlFor="maxTime">Max Time (mins)</Label>
                  <Input
                    id="maxTime"
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={maxCookTime || userPreferences?.typical_cook_time || 30}
                    onChange={(e) => setMaxCookTime(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level</Label>
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
                  <Label htmlFor="spiceLevel">Spice Level</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="favouriteCuisine">Favourite Cuisine</Label>
                  <Select
                    value={favouriteCuisine || (userPreferences?.cuisines_liked?.[0] || 'any')}
                    onValueChange={setFavouriteCuisine}
                  >
                    <SelectTrigger id="favouriteCuisine">
                      <SelectValue placeholder="Select cuisine..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Cuisine</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Choose AI Model</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Button
                    type="button"
                    variant={selectedModel === 'model_1' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('model_1')}
                    className="w-full"
                  >
                    Model 1
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'model_2' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('model_2')}
                    className="w-full"
                  >
                    Model 2
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'model_3' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('model_3')}
                    className="w-full"
                  >
                    Model 3
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'model_4' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('model_4')}
                    className="w-full"
                  >
                    Model 4
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('all')}
                    className="w-full md:col-span-1 col-span-2"
                  >
                    All 4 Models
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Test different AI models to compare recipe quality. &quot;All 4 Models&quot; generates recipes from all models at once.
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || isGeneratingAll || !ingredientsText.trim()}
              >
                {(isGenerating || isGeneratingAll) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isGeneratingAll ? 'Generating All Models...' : `Generating with ${selectedModel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}...`}
                  </>
                ) : (
                  <>
                    <ChefHat className="h-5 w-5 mr-2" />
                    {selectedModel === 'all' ? 'Generate with All 4 Models' : `Generate Recipe with ${selectedModel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
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
                    {['Model 1', 'Model 2', 'Model 3', 'Model 4'].map((modelName, index) => {
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
                  <ul className="space-y-1">
                    {generatedRecipe.ingredients.map((ing, index) => (
                      <li key={index} className="text-sm">
                        • {ing.quantity} {ing.unit} {ing.item}
                        {ing.notes && ` (${ing.notes})`}
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
                    <TabsTrigger value="model_1">Model 1</TabsTrigger>
                    <TabsTrigger value="model_2">Model 2</TabsTrigger>
                    <TabsTrigger value="model_3">Model 3</TabsTrigger>
                    <TabsTrigger value="model_4">Model 4</TabsTrigger>
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
                              <ul className="space-y-1">
                                {recipe.ingredients.map((ing, index) => (
                                  <li key={index} className="text-sm">
                                    • {ing.quantity} {ing.unit} {ing.item}
                                    {ing.notes && ` (${ing.notes})`}
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
                            <p>No recipe generated for this model</p>
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
                <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {(isGenerating || isGeneratingAll)
                    ? 'AI is cooking up something delicious...'
                    : 'Your generated recipe will appear here'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
