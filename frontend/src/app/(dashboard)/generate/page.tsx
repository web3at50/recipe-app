'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Loader2, AlertTriangle, Info } from 'lucide-react';
import type { Recipe } from '@/types/recipe';
import type { UserPreferences } from '@/types/user-profile';

export default function GeneratePage() {
  const router = useRouter();
  const [ingredientsText, setIngredientsText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [selectedModel, setSelectedModel] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [servings, setServings] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [allergenWarnings, setAllergenWarnings] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

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
          description: descriptionText.trim() || undefined,
          servings: servings || 4,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Display allergen conflicts prominently
        if (error.error === 'Safety Warning' && error.conflicts) {
          alert(`⚠️ ALLERGEN WARNING:\n\n${error.message}\n\nPlease remove these ingredients and try again.`);
          setIsGenerating(false);
          return;
        }
        throw new Error(error.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);

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

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedRecipe.name,
          description: generatedRecipe.description,
          prep_time: generatedRecipe.prep_time,
          cook_time: generatedRecipe.cook_time,
          servings: generatedRecipe.servings,
          ingredients: generatedRecipe.ingredients.map((ing) => ({
            item: ing.item,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
          })),
          instructions: generatedRecipe.instructions.map((inst) => ({
            instruction: inst.instruction,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      const { recipe } = await response.json();
      router.push(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
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

              <div className="space-y-2">
                <Label htmlFor="servings">Number of Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  max="20"
                  value={servings || 4}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Choose AI Model</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedModel === 'openai' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('openai')}
                    className="w-full"
                  >
                    OpenAI
                    <span className="text-xs ml-1">(GPT-4.1)</span>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'claude' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('claude')}
                    className="w-full"
                  >
                    Claude
                    <span className="text-xs ml-1">(Sonnet 4.5)</span>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedModel === 'gemini' ? 'default' : 'outline'}
                    onClick={() => setSelectedModel('gemini')}
                    className="w-full"
                  >
                    Gemini
                    <span className="text-xs ml-1">(2.5 Flash)</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Test different AI models to see which generates the best recipes for you
                </p>
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
                    Generating with {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-5 w-5 mr-2" />
                    Generate Recipe with {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
                  </>
                )}
              </Button>
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSaveRecipe}
                >
                  Save Recipe to Collection
                </Button>
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
