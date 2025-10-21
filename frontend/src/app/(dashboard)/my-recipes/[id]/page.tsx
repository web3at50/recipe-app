import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Clock, Users, Edit } from 'lucide-react';
import { PrintButton } from '@/components/recipes/print-button';
import { DeleteRecipeButton } from '@/components/recipes/delete-recipe-button';
import type { Ingredient, Instruction } from '@/types/recipe';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecipeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const search = await searchParams;

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createClient();

  // Fetch recipe (all data now in JSONB - no joins needed!)
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (recipeError || !recipe) {
    notFound();
  }

  // Data is now in JSONB fields on recipe object
  let ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];
  const tags = recipe.tags || [];

  // Check if servings parameter is provided (from meal planner)
  const requestedServings = search.servings ? parseInt(search.servings as string) : null;
  const originalServings = recipe.servings || 1;
  const displayServings = requestedServings || originalServings;

  // Scale ingredients if servings are different
  if (requestedServings && requestedServings !== originalServings) {
    const scale = requestedServings / originalServings;
    ingredients = ingredients.map((ing: Ingredient) => {
      const quantity = ing.quantity ? parseFloat(ing.quantity) : null;
      return {
        ...ing,
        quantity: quantity ? (quantity * scale).toFixed(1) : ing.quantity
      };
    });
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const fromMealPlanner = search.from === 'meal-planner';

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-2xl">
      <div className="flex gap-2 mb-4 no-print">
        <Link href="/my-recipes">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </Link>
        <Link href="/meal-planner">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Meal Planner
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="recipe-header">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-muted-foreground">{recipe.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 text-muted-foreground recipe-meta">
            {totalTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>
                  {recipe.prep_time && `${recipe.prep_time}m prep`}
                  {recipe.prep_time && recipe.cook_time && ' + '}
                  {recipe.cook_time && `${recipe.cook_time}m cook`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{displayServings} servings</span>
              {fromMealPlanner && requestedServings !== originalServings && (
                <span className="text-xs text-muted-foreground">
                  (scaled from {originalServings})
                </span>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex gap-2 mt-4 recipe-tags">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <Card className="print-keep-together">
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {ingredients?.map((ingredient: Ingredient, index: number) => (
                <li key={index} className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors print-keep-together">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span className="flex-1">
                    {ingredient.quantity && `${ingredient.quantity} `}
                    {ingredient.unit && `${ingredient.unit} `}
                    {ingredient.item}
                    {ingredient.notes && ` (${ingredient.notes})`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="print-keep-together">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions?.map((instruction: Instruction, index: number) => (
                <li key={index} className="flex gap-4 print-keep-together">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {instruction.step || index + 1}
                  </span>
                  <p className="flex-1 pt-1">{instruction.instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <Link href={`/my-recipes/${id}/edit`}>
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Recipe
            </Button>
          </Link>
          <PrintButton className="w-full" />
          <DeleteRecipeButton recipeId={id} recipeName={recipe.name} className="w-full" />
        </div>
      </div>
    </div>
  );
}
