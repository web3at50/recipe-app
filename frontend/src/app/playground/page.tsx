'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Loader2, AlertTriangle, Info, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Recipe } from '@/types/recipe';
import {
  savePlaygroundRecipe,
  getPlaygroundRecipes,
  getPlaygroundPreferences,
  savePlaygroundPreferences,
  incrementPlaygroundGenerationCount,
  getPlaygroundGenerationCount,
  initializePlaygroundSession,
} from '@/lib/session-storage';

export default function PlaygroundPage() {
  const [ingredientsText, setIngredientsText] = useState('');
  const [servings, setServings] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [allergenWarnings, setAllergenWarnings] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [showPreferencesSetup, setShowPreferencesSetup] = useState(false);

  // Preferences state
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // Initialize session on mount
  useEffect(() => {
    initializePlaygroundSession();

    // Load existing preferences if any
    const prefs = getPlaygroundPreferences();
    if (prefs.allergies) setAllergies(prefs.allergies);
    if (prefs.dietary_restrictions) setDietaryRestrictions(prefs.dietary_restrictions);
    if (prefs.household_size) setServings(prefs.household_size);

    // Load generation count
    setGenerationCount(getPlaygroundGenerationCount());

    // Check if user has existing recipes (returning user)
    const existingRecipes = getPlaygroundRecipes();
    if (existingRecipes.length === 0 && Object.keys(prefs).length === 0) {
      setShowPreferencesSetup(true);
    }
  }, []);

  const handleSavePreferences = () => {
    savePlaygroundPreferences({
      allergies,
      dietary_restrictions: dietaryRestrictions,
      household_size: servings,
    });
    setShowPreferencesSetup(false);
  };

  const handleGenerate = async () => {
    if (!ingredientsText.trim()) {
      alert('Please enter at least one ingredient');
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);
    setAllergenWarnings([]);

    try {
      const ingredients = ingredientsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          servings: servings || 4,
          // Pass playground preferences (no user account)
          preferences: {
            allergies,
            dietary_restrictions: dietaryRestrictions,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Safety Warning' && error.conflicts) {
          alert(`⚠️ ALLERGEN WARNING:\n\n${error.message}\n\nPlease remove these ingredients and try again.`);
          setIsGenerating(false);
          return;
        }
        throw new Error(error.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);

      // Increment generation count
      const newCount = incrementPlaygroundGenerationCount();
      setGenerationCount(newCount);

      // Display post-generation allergen warnings if any
      if (data.allergen_warnings && data.allergen_warnings.length > 0) {
        setAllergenWarnings(data.allergen_warnings);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate recipe');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToPlayground = () => {
    if (!generatedRecipe) return;

    try {
      const saved = savePlaygroundRecipe({
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        prep_time: generatedRecipe.prep_time,
        cook_time: generatedRecipe.cook_time,
        servings: generatedRecipe.servings,
        difficulty: generatedRecipe.difficulty,
        cuisine: generatedRecipe.cuisine,
        ingredients: generatedRecipe.ingredients.map((ing) => ({
          item: ing.item,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        })),
        instructions: generatedRecipe.instructions.map((inst, index) => ({
          step: index + 1,
          instruction: inst.instruction,
        })),
        allergens: generatedRecipe.allergens,
        tags: generatedRecipe.tags,
        source: 'ai_generated',
      });

      // Show success message
      alert(`✓ Recipe "${saved.name}" saved to playground!\n\nRemember: This is temporary storage. Sign up to save permanently.`);

      // Clear the generated recipe
      setGeneratedRecipe(null);
      setIngredientsText('');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe to playground');
    }
  };

  // Quick setup for first-time users
  if (showPreferencesSetup) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to the Playground!</h1>
          <p className="text-muted-foreground">
            Let&apos;s personalize your experience (optional, but recommended)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>
              Set your preferences to get better recipe recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Household Size (Number of Servings)</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Any Allergies? (Optional)</Label>
              <Textarea
                placeholder="e.g., peanuts, dairy, shellfish (one per line)"
                value={allergies.join('\n')}
                onChange={(e) => setAllergies(e.target.value.split('\n').filter(a => a.trim()))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Dietary Restrictions? (Optional)</Label>
              <Textarea
                placeholder="e.g., vegetarian, vegan, gluten-free (one per line)"
                value={dietaryRestrictions.join('\n')}
                onChange={(e) => setDietaryRestrictions(e.target.value.split('\n').filter(d => d.trim()))}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSavePreferences} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save & Start Generating
              </Button>
              <Button variant="outline" onClick={() => setShowPreferencesSetup(false)}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            AI Recipe Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter ingredients and let AI create a personalized recipe for you
          </p>
        </div>

        {generationCount > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Recipes generated</p>
            <p className="text-2xl font-bold text-primary">{generationCount}</p>
          </div>
        )}
      </div>

      {/* User Preferences Summary */}
      {(allergies.length > 0 || dietaryRestrictions.length > 0) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Your Preferences</CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowPreferencesSetup(true)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {allergies.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-500">Allergen Protection</p>
                      <p className="text-muted-foreground mt-1">
                        Avoiding: {allergies.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {dietaryRestrictions.length > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div>
                    <p className="font-medium">Dietary Restrictions</p>
                    <p className="text-muted-foreground mt-1 capitalize">
                      {dietaryRestrictions.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Enter ingredients you have available, one per line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingredients">Available Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Chicken breast&#10;Onions&#10;Garlic&#10;Rice&#10;Tomatoes..."
                  className="min-h-[200px] font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Number of Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  max="20"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || !ingredientsText.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Recipe with AI
                  </>
                )}
              </Button>

              {!allergies.length && !dietaryRestrictions.length && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowPreferencesSetup(true)}
                >
                  Set Allergies & Dietary Preferences
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Saved Recipes in Session */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Playground Recipes</CardTitle>
              <CardDescription>
                Recipes you&apos;ve generated in this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const recipes = getPlaygroundRecipes();
                if (recipes.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recipes yet. Generate your first one!
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {recipes.map((recipe) => (
                      <Link
                        key={recipe.id}
                        href={`/playground/recipes/${recipe.id}`}
                        className="block text-sm p-2 border rounded hover:bg-accent hover:border-primary/50 transition-colors"
                      >
                        <p className="font-medium">{recipe.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {recipe.servings} servings • {recipe.prep_time}m prep
                        </p>
                      </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t">
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link href="/signup">
                          <Save className="mr-2 h-4 w-4" />
                          Sign Up to Save These Permanently
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div>
          {generatedRecipe ? (
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

                {/* Allergen Warnings */}
                {allergenWarnings.length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-500 mb-2">⚠️ ALLERGEN WARNING</p>
                        <ul className="space-y-1 text-sm">
                          {allergenWarnings.map((warning, index) => (
                            <li key={index} className="text-red-500">
                              {warning}
                            </li>
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
                {/* Ingredients */}
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

                {/* Instructions */}
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

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSaveToPlayground}
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Save to Playground (Temporary)
                  </Button>
                  <Button
                    className="w-full"
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <Link href="/signup">
                      Save Permanently - Create Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isGenerating
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
