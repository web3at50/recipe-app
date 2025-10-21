import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecipeSchema } from '@/components/recipes/recipe-schema';
import { RecipePrintButton } from '@/components/recipes/recipe-print';
import { RecipeCTA } from '@/components/recipes/recipe-cta';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('seo_slug', slug)
    .eq('category', category)
    .eq('is_public', true)
    .single();

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
    };
  }

  return {
    title: recipe.seo_title || recipe.name,
    description: recipe.seo_description,
    keywords: recipe.seo_keywords,
    openGraph: {
      title: recipe.seo_title || recipe.name,
      description: recipe.seo_description || undefined,
      images: recipe.image_url ? [{ url: recipe.image_url, width: 1200, height: 630 }] : undefined,
      type: 'article',
      publishedTime: recipe.published_at || undefined,
      modifiedTime: recipe.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.seo_title || recipe.name,
      description: recipe.seo_description || undefined,
      images: recipe.image_url ? [recipe.image_url] : undefined,
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { category, slug } = await params;
  const supabase = await createClient();

  // Fetch recipe from database
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('seo_slug', slug)
    .eq('category', category)
    .eq('is_public', true)
    .single();

  if (!recipe) {
    notFound();
  }

  // Increment page views (fire and forget)
  supabase
    .from('recipes')
    .update({ page_views: (recipe.page_views || 0) + 1 })
    .eq('id', recipe.id)
    .then(() => {});

  return (
    <div className="min-h-screen">
      {/* Schema.org JSON-LD */}
      <RecipeSchema recipe={recipe} />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
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
          <Link
            href={`/recipes/${category}`}
            className="hover:text-foreground capitalize"
          >
            {category.replace('-', ' & ')}
          </Link>
          {' / '}
          <span className="text-foreground">{recipe.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-6">
          {/* Title & Description */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-xl text-muted-foreground">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4">
            {recipe.prep_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">Prep:</span> {recipe.prep_time}m
                </span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">Cook:</span> {recipe.cook_time}m
                </span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">Servings:</span> {recipe.servings}
                </span>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center gap-2 text-sm">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize font-medium">{recipe.difficulty}</span>
              </div>
            )}
          </div>

          {/* Print Button */}
          <div>
            <RecipePrintButton recipe={recipe} />
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Image */}
          {recipe.image_url && (
            <div className="relative w-full aspect-[1.91/1] rounded-lg overflow-hidden">
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span className="flex-1">
                    <span className="font-medium">
                      {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
                    </span>{' '}
                    {ing.item}
                    {ing.notes && (
                      <span className="text-muted-foreground text-sm">
                        {' '}({ing.notes})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((inst, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <p className="pt-1 flex-1">{inst.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Allergen Information */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <div className="mt-12 p-6 border-2 border-amber-500/20 bg-amber-500/5 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-amber-600">⚠️</span> Allergen Information
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              This recipe contains or may contain the following allergens:
            </p>
            <div className="flex flex-wrap gap-2">
              {recipe.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="capitalize">
                  {allergen.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <RecipeCTA />
        </div>
      </div>
    </div>
  );
}
