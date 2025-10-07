import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Clock, Users, Edit } from 'lucide-react';
import { RecipeDetailClient } from './recipe-detail-client';
import type { RecipeWithDetails } from '@/types/recipe';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch recipe with details
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (recipeError || !recipe) {
    notFound();
  }

  // Fetch ingredients
  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', id)
    .order('order_index', { ascending: true });

  // Fetch instructions
  const { data: instructions } = await supabase
    .from('recipe_instructions')
    .select('*')
    .eq('recipe_id', id)
    .order('step_number', { ascending: true });

  // Fetch categories
  const { data: recipeCategories } = await supabase
    .from('recipe_categories')
    .select('category_id, categories(*)')
    .eq('recipe_id', id);

  interface CategoryRecord {
    categories: {
      id: string;
      name: string;
      description?: string;
    };
  }

  const categories = recipeCategories?.map((rc) => (rc as unknown as CategoryRecord).categories) || [];

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/recipes">
        <Button variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Recipes
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
              {recipe.description && (
                <p className="text-muted-foreground">{recipe.description}</p>
              )}
            </div>
            <RecipeDetailClient recipeId={id} isFavorite={recipe.is_favorite} />
          </div>

          <div className="flex items-center gap-6 text-muted-foreground">
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
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 mt-4">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ingredients?.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
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
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions?.map((instruction) => (
                <li key={instruction.id} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {instruction.step_number}
                  </span>
                  <p className="flex-1 pt-1">{instruction.instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href={`/recipes/${id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Recipe
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
