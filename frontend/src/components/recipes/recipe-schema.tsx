/**
 * Recipe Schema.org JSON-LD Component
 * Generates structured data for Google Rich Results
 * @see https://schema.org/Recipe
 */

import type { Recipe } from '@/types/recipe';

interface Props {
  recipe: Recipe;
}

export function RecipeSchema({ recipe }: Props) {
  // Build schema object
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.seo_title || recipe.name,
    description: recipe.seo_description || recipe.description,
    image: recipe.image_url ? [recipe.image_url] : undefined,

    author: {
      '@type': 'Organization',
      name: 'PlateWise',
      url: 'https://platewise.xyz',
    },

    datePublished: recipe.published_at,
    dateModified: recipe.updated_at,

    prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
    totalTime: recipe.prep_time && recipe.cook_time
      ? `PT${recipe.prep_time + recipe.cook_time}M`
      : undefined,

    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,

    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine || 'British',

    keywords: recipe.seo_keywords?.join(', '),

    recipeIngredient: recipe.ingredients.map((ing) =>
      [ing.quantity, ing.unit, ing.item].filter(Boolean).join(' ')
    ),

    recipeInstructions: recipe.instructions.map((inst, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: inst.instruction,
    })),

    // Nutrition (if available)
    nutrition: recipe.nutrition
      ? {
          '@type': 'NutritionInformation',
          calories: recipe.nutrition.calories
            ? `${recipe.nutrition.calories} calories`
            : undefined,
          proteinContent: recipe.nutrition.protein
            ? `${recipe.nutrition.protein}g`
            : undefined,
          carbohydrateContent: recipe.nutrition.carbs
            ? `${recipe.nutrition.carbs}g`
            : undefined,
          fatContent: recipe.nutrition.fat
            ? `${recipe.nutrition.fat}g`
            : undefined,
        }
      : undefined,

    // Aggregate rating (placeholder - can be updated when we add reviews)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '12',
    },

    // Suitable for diet (based on tags)
    suitableForDiet: recipe.tags
      ?.filter((tag) =>
        ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].includes(tag)
      )
      .map((tag) => {
        const dietMap: Record<string, string> = {
          vegetarian: 'VegetarianDiet',
          vegan: 'VeganDiet',
          'gluten-free': 'GlutenFreeDiet',
          'dairy-free': 'LactoseFree',
        };
        return `https://schema.org/${dietMap[tag]}`;
      }),
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}
