import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeList } from '@/components/recipes/recipe-list';

export default async function RecipesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createClient();

  // Fetch recipes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
  }

  // Fetch user allergens
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('user_id', userId)
    .single();

  const userAllergens = profile?.preferences?.allergies || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recipe collection
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/create-recipe" className="w-full sm:w-auto">
            <Button className="w-full">
              Create Recipe(s) With AI
            </Button>
          </Link>
          <Link href="/recipes/new" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Recipe Manually
            </Button>
          </Link>
        </div>
      </div>

      <RecipeList initialRecipes={recipes || []} userAllergens={userAllergens} />
    </div>
  );
}
