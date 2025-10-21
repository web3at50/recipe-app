import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/recipes/breadcrumb-schema';

interface Props {
  params: Promise<{
    category: string;
  }>;
}

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  breakfast: {
    title: 'Breakfast Recipes',
    description: 'Start your day right with these delicious breakfast recipes',
  },
  lunch: {
    title: 'Lunch Recipes',
    description: 'Quick and satisfying lunch ideas for any day of the week',
  },
  dinner: {
    title: 'Dinner Recipes',
    description: 'Hearty and delicious dinner recipes for the whole family',
  },
  desserts: {
    title: 'Dessert Recipes',
    description: 'Sweet treats and indulgent desserts to satisfy your cravings',
  },
  snacks: {
    title: 'Snack Recipes',
    description: 'Healthy and tasty snacks for any time of day',
  },
  sides: {
    title: 'Side Dish Recipes',
    description: 'Perfect accompaniments to complete your meal',
  },
  'quick-easy': {
    title: 'Quick & Easy Recipes',
    description: 'Fast recipes for busy weeknights',
  },
  healthy: {
    title: 'Healthy Recipes',
    description: 'Nutritious recipes that don\'t compromise on flavor',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = CATEGORY_INFO[category];

  if (!categoryInfo) {
    return {
      title: 'Category Not Found',
    };
  }

  const supabase = await createClient();

  // Fetch category metadata (for custom image)
  const { data: categoryMeta } = await supabase
    .from('category_metadata')
    .select('custom_image_url, custom_description')
    .eq('category', category)
    .single();

  // Fetch first recipe image as fallback
  const { data: firstRecipe } = await supabase
    .from('recipes')
    .select('image_url')
    .eq('category', category)
    .eq('is_public', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Hybrid image selection: custom > first recipe > default
  const ogImage = categoryMeta?.custom_image_url
    || firstRecipe?.image_url
    || 'https://platewise.xyz/og-default.jpg';

  // Use custom description if available
  const description = categoryMeta?.custom_description || categoryInfo.description;

  return {
    title: `${categoryInfo.title} | PlateWise`,
    description: description,
    openGraph: {
      title: `${categoryInfo.title} | PlateWise`,
      description: description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryInfo.title} | PlateWise`,
      description: description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryInfo = CATEGORY_INFO[category];

  if (!categoryInfo) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch recipes in this category
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('category', category)
    .eq('is_public', true)
    .order('published_at', { ascending: false });

  // Generate ItemList schema for recipe listing
  const itemListSchema = recipes && recipes.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryInfo.title} - PlateWise`,
    description: categoryInfo.description,
    numberOfItems: recipes.length,
    itemListElement: recipes.map((recipe, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://platewise.xyz/recipes/${recipe.category}/${recipe.seo_slug}`,
      name: recipe.name,
    })),
  } : null;

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://platewise.xyz' },
          { name: 'Recipes', url: 'https://platewise.xyz/recipes' },
          { name: categoryInfo.title, url: `https://platewise.xyz/recipes/${category}` },
        ]}
      />

      {/* ItemList Schema (if recipes exist) */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {' / '}
        <Link href="/recipes" className="hover:text-foreground">
          Recipes
        </Link>
        {' / '}
        <span className="text-foreground">{categoryInfo.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">{categoryInfo.title}</h1>
        <p className="text-xl text-muted-foreground">
          {categoryInfo.description}
        </p>
      </div>

      {/* Recipe Grid */}
      {!recipes || recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No recipes in this category yet. Check back soon!
            </p>
            <Link
              href="/recipes"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Browse all recipes
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.category}/${recipe.seo_slug}`}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                {/* Image */}
                {recipe.image_url && (
                  <div className="relative w-full aspect-[1.91/1]">
                    <Image
                      src={recipe.image_url}
                      alt={recipe.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {recipe.name}
                  </CardTitle>
                  {recipe.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {recipe.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {recipe.prep_time && recipe.cook_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prep_time + recipe.cook_time}m</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                {recipe.tags && recipe.tags.length > 0 && (
                  <CardFooter className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
