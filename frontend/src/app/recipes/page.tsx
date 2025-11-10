import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, Clock, Leaf, Zap, Heart, UtensilsCrossed, Coffee, Cake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recipes | PlateWise',
  description:
    'Browse our collection of delicious recipes created with AI. British measurements, UK ingredients, and allergen information.',
};

const CATEGORIES = [
  {
    slug: 'breakfast',
    title: 'Breakfast',
    description: 'Start your day right',
    icon: Coffee,
    color: 'text-orange-600',
  },
  {
    slug: 'lunch',
    title: 'Lunch',
    description: 'Quick midday meals',
    icon: UtensilsCrossed,
    color: 'text-blue-600',
  },
  {
    slug: 'dinner',
    title: 'Dinner',
    description: 'Hearty evening meals',
    icon: ChefHat,
    color: 'text-purple-600',
  },
  {
    slug: 'desserts',
    title: 'Desserts',
    description: 'Sweet treats',
    icon: Cake,
    color: 'text-pink-600',
  },
  {
    slug: 'quick-easy',
    title: 'Quick & Easy',
    description: 'Fast weeknight recipes',
    icon: Zap,
    color: 'text-yellow-600',
  },
  {
    slug: 'healthy',
    title: 'Healthy',
    description: 'Nutritious options',
    icon: Leaf,
    color: 'text-green-600',
  },
  {
    slug: 'snacks',
    title: 'Snacks',
    description: 'Tasty bites',
    icon: Heart,
    color: 'text-red-600',
  },
  {
    slug: 'sides',
    title: 'Side Dishes',
    description: 'Perfect accompaniments',
    icon: Clock,
    color: 'text-gray-600',
  },
];

export default async function RecipesPage() {
  const supabase = await createClient();

  // Get counts for each category
  const categoryCounts: Record<string, number> = {};

  for (const category of CATEGORIES) {
    const { count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.slug)
      .eq('is_public', true);

    categoryCounts[category.slug] = count || 0;
  }

  // Get total recipe count
  const { count: totalCount } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true);

  // Get latest recipes
  const { data: latestRecipes } = await supabase
    .from('recipes')
    .select('id, name, description, category, seo_slug, image_url, prep_time, cook_time, servings')
    .eq('is_public', true)
    .order('published_at', { ascending: false })
    .limit(6);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Recipe Collection</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Browse our growing collection of {totalCount || 0} AI-generated
          recipes. British measurements, UK ingredients, and complete allergen
          information.
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-700 rounded-lg p-4 mb-12 max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Important Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This is a technical demonstration project. AI-generated recipes have not been tested in real kitchens and should not be used for actual cooking or relied upon for allergen safety. Development paused pending implementation of testing protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = categoryCounts[category.slug] || 0;

            return (
              <Link
                key={category.slug}
                href={`/recipes/${category.slug}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-6 w-6 ${category.color}`} />
                      <CardTitle className="text-lg">
                        {category.title}
                      </CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{count} recipes</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Latest Recipes */}
      {latestRecipes && latestRecipes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Recipes</h2>
            <Link
              href="/recipes/dinner"
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.category}/${recipe.seo_slug}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {recipe.image_url && (
                    <div className="relative w-full aspect-[1.91/1] bg-muted">
                      <Image
                        src={recipe.image_url}
                        alt={recipe.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {recipe.name}
                    </CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {recipe.prep_time && recipe.cook_time && (
                        <span>{recipe.prep_time + recipe.cook_time}m</span>
                      )}
                      {recipe.servings && <span>{recipe.servings} servings</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
