import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RecipeReviewClient } from './components/recipe-review-client';

// Admin user IDs from environment variable
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
const AUTOMATION_USER_IDS = process.env.AUTOMATION_USER_IDS?.split(',') || [];

export const metadata = {
  title: 'Recipe Review Dashboard | PlateWise Admin',
  description: 'Review and publish SEO-optimized recipes',
};

export default async function RecipeReviewPage() {
  // 1. Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Check admin authorization
  if (!ADMIN_USER_IDS.includes(userId)) {
    redirect('/');
  }

  // 3. Fetch recipes from automation users (RLS allows because JWT has is_admin: true)
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .in('user_id', AUTOMATION_USER_IDS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
  }

  // 4. Pass to client component for interactivity
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recipe Review Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review and publish recipes to the public SEO pages
        </p>
      </div>

      <RecipeReviewClient initialRecipes={recipes || []} />
    </div>
  );
}
