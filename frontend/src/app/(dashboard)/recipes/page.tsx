import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeList } from '@/components/recipes/recipe-list';

export default async function RecipesPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch recipes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
  }

  // Fetch user allergens
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('user_id', user.id)
    .single();

  const userAllergens = profile?.preferences?.allergies || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recipe collection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/generate">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </Link>
          <Link href="/recipes/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Manually
            </Button>
          </Link>
        </div>
      </div>

      <RecipeList initialRecipes={recipes || []} userAllergens={userAllergens} />
    </div>
  );
}
