'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Calendar,
  Save,
  AlertTriangle
} from 'lucide-react';
import { getPlaygroundRecipe, type PlaygroundRecipe } from '@/lib/session-storage';

export default function PlaygroundRecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<PlaygroundRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      const foundRecipe = getPlaygroundRecipe(id);
      setRecipe(foundRecipe);
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <ChefHat className="h-12 w-12 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-16">
        <div className="rounded-full bg-destructive/10 p-6 inline-block">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Recipe Not Found</h1>
          <p className="text-muted-foreground">
            This recipe might have been deleted or doesn&apos;t exist in your playground session.
          </p>
        </div>
        <Button asChild>
          <Link href="/playground/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Recipes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" asChild>
        <Link href="/playground/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Recipes
        </Link>
      </Button>

      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{recipe.name}</CardTitle>
              {recipe.description && (
                <CardDescription className="text-base">
                  {recipe.description}
                </CardDescription>
              )}
            </div>
            <ChefHat className="h-8 w-8 text-primary flex-shrink-0" />
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 pt-4">
            {recipe.prep_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Prep:</span>
                <span className="font-medium">{recipe.prep_time}m</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cook:</span>
                <span className="font-medium">{recipe.cook_time}m</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Servings:</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
            {recipe.difficulty && (
              <Badge variant="secondary" className="capitalize">
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.cuisine && (
              <Badge variant="outline">{recipe.cuisine}</Badge>
            )}
          </div>

          {/* Allergen Warnings */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Contains Allergens</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {recipe.allergens.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/playground/meal-planner">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Meal Plan
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/signup">
                <Save className="mr-2 h-4 w-4" />
                Save Permanently
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  {ingredient.quantity && ingredient.unit && (
                    <span className="font-medium">{ingredient.quantity} {ingredient.unit} </span>
                  )}
                  {ingredient.quantity && !ingredient.unit && (
                    <span className="font-medium">{ingredient.quantity} </span>
                  )}
                  {ingredient.item}
                  {ingredient.notes && (
                    <span className="text-muted-foreground"> ({ingredient.notes})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                  {instruction.step}
                </div>
                <p className="flex-1 pt-1">{instruction.instruction}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-semibold">Want to keep this recipe?</h3>
          <p className="text-muted-foreground">
            Create a free account to save this recipe permanently and access it from any device.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              <Save className="mr-2 h-5 w-5" />
              Create Free Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
