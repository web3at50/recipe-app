import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all published recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('seo_slug, category, updated_at, published_at')
    .eq('is_public', true)
    .order('published_at', { ascending: false });

  // Build recipe URLs
  const recipeUrls: MetadataRoute.Sitemap =
    recipes?.map((recipe) => ({
      url: `https://platewise.xyz/recipes/${recipe.category}/${recipe.seo_slug}`,
      lastModified: new Date(recipe.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) || [];

  // Static pages
  return [
    {
      url: 'https://platewise.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://platewise.xyz/recipes',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...recipeUrls,
  ];
}
