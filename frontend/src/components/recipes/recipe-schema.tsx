/**
 * Recipe Schema.org JSON-LD Component
 * Generates structured data for Google Rich Results
 * @see https://schema.org/Recipe
 */

import type { Recipe, Ingredient, Instruction } from '@/types/recipe';

interface Props {
  recipe: Recipe;
}

/**
 * Generate keywords from recipe data
 * Uses seo_keywords if available, otherwise falls back to category, tags, and cuisine
 */
function generateKeywords(recipe: Recipe): string | undefined {
  // Use seo_keywords if available
  if (recipe.seo_keywords && recipe.seo_keywords.length > 0) {
    return recipe.seo_keywords.join(', ');
  }

  // Fallback: generate from category and tags
  const fallbackKeywords: string[] = [];
  if (recipe.category) fallbackKeywords.push(recipe.category);
  if (recipe.tags && recipe.tags.length > 0) fallbackKeywords.push(...recipe.tags);
  if (recipe.cuisine) fallbackKeywords.push(recipe.cuisine);

  return fallbackKeywords.length > 0 ? fallbackKeywords.join(', ') : undefined;
}

/**
 * Infer cooking method from recipe instructions
 * Only returns a value if we can confidently detect the method
 */
function inferCookingMethod(instructions: Instruction[]): string | undefined {
  const text = instructions
    .map((inst) => inst.instruction)
    .join(' ')
    .toLowerCase();

  // Only return if we're confident (clear keywords found)
  if (text.includes('bake') || text.includes(' oven')) return 'Baking';
  if (text.includes('fry') || text.includes('frying')) return 'Frying';
  if (text.includes('boil') || text.includes('simmer')) return 'Boiling';
  if (text.includes('grill')) return 'Grilling';
  if (text.includes('roast')) return 'Roasting';
  if (text.includes('sauté') || text.includes('saute')) return 'Sautéing';
  if (text.includes('steam')) return 'Steaming';

  // Return undefined if can't confidently infer (won't add field)
  return undefined;
}

export function RecipeSchema({ recipe }: Props) {
  // Build schema object
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.seo_title || recipe.name,
    description: recipe.seo_description || recipe.description,
    image: recipe.image_url
      ? {
          '@type': 'ImageObject',
          url: recipe.image_url,
          width: 1200,
          height: 800,
        }
      : undefined,

    author: {
      '@type': 'Organization',
      name: 'PlateWise',
      url: 'https://platewise.xyz',
      logo: {
        '@type': 'ImageObject',
        url: 'https://platewise.xyz/platewise-logo-1024.png',
        width: 1024,
        height: 1024,
      },
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
    cookingMethod: inferCookingMethod(recipe.instructions),

    keywords: generateKeywords(recipe),

    recipeIngredient: recipe.ingredients.map((ing: Ingredient) =>
      [ing.quantity, ing.unit, ing.item].filter(Boolean).join(' ')
    ),

    recipeInstructions: recipe.instructions.map((inst: Instruction, index: number) => ({
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

    // Aggregate rating - REMOVED: Fake ratings violate Google guidelines
    // TODO: Add conditional aggregateRating when real user reviews are implemented
    // aggregateRating: recipe.rating_count > 0 ? {
    //   '@type': 'AggregateRating',
    //   ratingValue: recipe.rating_value,
    //   reviewCount: recipe.rating_count,
    // } : undefined,

    // Suitable for diet (based on tags)
    suitableForDiet: recipe.tags
      ?.filter((tag: string) =>
        ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].includes(tag)
      )
      .map((tag: string) => {
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
