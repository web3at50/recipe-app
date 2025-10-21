'use client';

import { useState, useEffect } from 'react';
import { CategoryCard, CategoryCardData } from './category-card';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, UtensilsCrossed, ChefHat, Cake, Zap, Leaf, Heart, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORY_DEFINITIONS = [
  {
    slug: 'breakfast',
    title: 'Breakfast',
    icon: Coffee,
    color: 'text-orange-600',
  },
  {
    slug: 'lunch',
    title: 'Lunch',
    icon: UtensilsCrossed,
    color: 'text-blue-600',
  },
  {
    slug: 'dinner',
    title: 'Dinner',
    icon: ChefHat,
    color: 'text-purple-600',
  },
  {
    slug: 'desserts',
    title: 'Desserts',
    icon: Cake,
    color: 'text-pink-600',
  },
  {
    slug: 'quick-easy',
    title: 'Quick & Easy',
    icon: Zap,
    color: 'text-yellow-600',
  },
  {
    slug: 'healthy',
    title: 'Healthy',
    icon: Leaf,
    color: 'text-green-600',
  },
  {
    slug: 'snacks',
    title: 'Snacks',
    icon: Heart,
    color: 'text-red-600',
  },
  {
    slug: 'sides',
    title: 'Side Dishes',
    icon: Clock,
    color: 'text-gray-600',
  },
];

export function CategorySettings() {
  const [categories, setCategories] = useState<CategoryCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch all category metadata
      const { data: categoryMeta } = await supabase
        .from('category_metadata')
        .select('*')
        .order('category');

      // Fetch recipe counts per category
      const recipeCounts: Record<string, number> = {};
      for (const def of CATEGORY_DEFINITIONS) {
        const { count } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true })
          .eq('category', def.slug)
          .eq('is_public', true);
        recipeCounts[def.slug] = count || 0;
      }

      // Fetch first recipe images for fallback
      const fallbackImages: Record<string, string | null> = {};
      for (const def of CATEGORY_DEFINITIONS) {
        const { data: firstRecipe } = await supabase
          .from('recipes')
          .select('image_url')
          .eq('category', def.slug)
          .eq('is_public', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        fallbackImages[def.slug] = firstRecipe?.image_url || null;
      }

      // Combine data
      const combinedData: CategoryCardData[] = CATEGORY_DEFINITIONS.map((def) => {
        const meta = categoryMeta?.find((m) => m.category === def.slug);
        const customImageUrl = meta?.custom_image_url || null;
        const fallbackImageUrl = fallbackImages[def.slug];

        return {
          slug: def.slug,
          title: def.title,
          icon: def.icon,
          color: def.color,
          recipeCount: recipeCounts[def.slug] || 0,
          currentImageUrl: customImageUrl || fallbackImageUrl,
          fallbackImageUrl: fallbackImageUrl,
          isCustomImage: !!customImageUrl,
        };
      });

      setCategories(combinedData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (categorySlug: string, newImageUrl: string | null) => {
    // Update local state
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.slug === categorySlug) {
          return {
            ...cat,
            currentImageUrl: newImageUrl || cat.fallbackImageUrl,
            isCustomImage: !!newImageUrl,
          };
        }
        return cat;
      })
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading category settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Category Settings</h2>
        <p className="text-muted-foreground">
          Manage custom OpenGraph images for each recipe category. Images are used when sharing category pages on social media.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            onImageUpdate={handleImageUpdate}
          />
        ))}
      </div>
    </div>
  );
}
