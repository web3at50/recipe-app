'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Loader2, Sparkles } from 'lucide-react';
import type { CupboardItem } from '@/types/pantry';

export default function GeneratePage() {
  const router = useRouter();
  const [ingredientsText, setIngredientsText] = useState('');
  const [servings, setServings] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  interface GeneratedRecipe {
    name: string;
    description: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    ingredients: Array<{
      item: string;
      quantity: string;
      unit: string;
      notes?: string;
    }>;
    instructions: Array<{
      step_number?: number;
      instruction: string;
    }>;
  }

  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [cupboardItems, setCupboardItems] = useState<CupboardItem[]>([]);

  useEffect(() => {
    fetchCupboardItems();
  }, []);

  const fetchCupboardItems = async () => {
    try {
      const response = await fetch('/api/pantry/cupboard');
      if (response.ok) {
        const data = await response.json();
        setCupboardItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching cupboard items:', error);
    }
  };

  const handleGenerateFromCupboard = () => {
    if (cupboardItems.length === 0) {
      alert('Your cupboard is empty. Add items to your cupboard first!');
      return;
    }
    const ingredients = cupboardItems.map((item) => item.item).join('\n');
    setIngredientsText(ingredients);
  };

  const handleGenerate = async () => {
    if (!ingredientsText.trim()) {
      alert('Please enter at least one ingredient');
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);

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
          servings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);
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
          Enter ingredients and let AI create a delicious recipe for you
        </p>
      </div>

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

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateFromCupboard}
                disabled={cupboardItems.length === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Use My Cupboard Items ({cupboardItems.length})
              </Button>

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
                    <ChefHat className="h-5 w-5 mr-2" />
                    Generate Recipe
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
                          {inst.step_number || index + 1}
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
