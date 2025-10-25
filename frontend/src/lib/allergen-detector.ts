/**
 * UK 14 Major Allergens - Natasha's Law Compliance
 *
 * SINGLE SOURCE OF TRUTH for all allergen definitions across the application.
 *
 * DUAL PURPOSE:
 * 1. User Safety Protection: Detect allergens in user's personal allergy list
 *    to block recipe generation that conflicts with their allergies
 *
 * 2. Recipe Discovery Tagging: Detect ALL allergens present in recipes for
 *    public filtering and search (e.g., "gluten-free", "dairy-free")
 *
 * STRUCTURE:
 * - id: Unique identifier (stored in database as TEXT[])
 * - label: Display name for UI components
 * - description: User-friendly explanation (shown in onboarding/settings)
 * - keywords: Detection terms for ingredient matching (case-insensitive)
 *
 * USAGE:
 * Import this constant in any component or API that needs allergen data:
 * ```typescript
 * import { UK_ALLERGENS } from '@/lib/allergen-detector';
 * ```
 *
 * MAINTENANCE:
 * - Add new allergen: Update this array only, changes propagate everywhere
 * - Add keyword: Update relevant allergen's keywords array
 * - Update description: Change here, reflects in all UI
 * - All components import this constant - no duplication needed
 *
 * LEGAL COMPLIANCE:
 * Based on UK Food Standards Agency (FSA) guidance for food allergen labeling.
 * Complies with Natasha's Law requirements for allergen information.
 *
 * @see https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses
 * @see https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance
 */
export const UK_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts', description: 'Peanuts and peanut products', keywords: ['peanut', 'groundnut'] },
  { id: 'tree_nuts', label: 'Tree Nuts', description: 'Almonds, hazelnuts, walnuts, cashews, pecans, pistachios, macadamia', keywords: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'] },
  { id: 'milk', label: 'Milk/Dairy', description: 'Milk, cheese, butter, cream, yogurt', keywords: ['milk', 'dairy', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'] },
  { id: 'eggs', label: 'Eggs', description: 'Eggs and egg products', keywords: ['egg', 'mayonnaise'] },
  { id: 'fish', label: 'Fish', description: 'All fish and fish products', keywords: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy'] },
  { id: 'shellfish', label: 'Shellfish', description: 'Crustaceans (prawns, crab, lobster)', keywords: ['shellfish', 'prawn', 'shrimp', 'crab', 'lobster', 'crayfish'] },
  { id: 'molluscs', label: 'Molluscs', description: 'Squid, snails, mussels, oysters', keywords: ['mollusc', 'mussel', 'oyster', 'squid', 'snail', 'winkle'] },
  { id: 'soy', label: 'Soya', description: 'Soya beans and soya products', keywords: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce', 'miso'] },
  { id: 'gluten', label: 'Gluten', description: 'Wheat, rye, barley, oats', keywords: ['gluten', 'wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oat'] },
  { id: 'sesame', label: 'Sesame', description: 'Sesame seeds and sesame products', keywords: ['sesame', 'tahini'] },
  { id: 'celery', label: 'Celery', description: 'Celery and celeriac', keywords: ['celery', 'celeriac'] },
  { id: 'mustard', label: 'Mustard', description: 'Mustard seeds, powder, and products', keywords: ['mustard'] },
  { id: 'lupin', label: 'Lupin', description: 'Lupin beans and flour', keywords: ['lupin'] },
  { id: 'sulphites', label: 'Sulphites', description: 'Sulphur dioxide (often in wine, dried fruit)', keywords: ['sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide'] },
];

export interface AllergenMatch {
  allergen: string; // e.g., 'peanuts'
  allergenLabel: string; // e.g., 'Peanuts'
  ingredient: string; // e.g., 'peanut butter'
  matchedKeyword: string; // e.g., 'peanut'
}

// Import allergen taxonomies for smart detection
import { ALLERGEN_TAXONOMIES } from './allergen-taxonomies';

/**
 * Detects allergens in ingredient text based on user's allergen profile
 *
 * DETECTION STRATEGY (3-step process):
 * 1. Check SAFE taxonomy list first → if found, allow ingredient (skip allergen entirely)
 * 2. Check UNSAFE taxonomy list → if found, block ingredient
 * 3. Fallback to keyword matching → for items not in taxonomy
 *
 * This prevents false positives (e.g., buckwheat for gluten, coconut milk for dairy)
 * while maintaining safety through explicit blocklists and keyword fallback.
 *
 * @param ingredientText - The ingredient text to check (e.g., "peanut butter", "2 cups milk")
 * @param userAllergens - Array of allergen IDs the user is allergic to (e.g., ['peanuts', 'milk'])
 * @returns Array of allergen matches found
 */
export function detectAllergensInText(
  ingredientText: string,
  userAllergens: string[]
): AllergenMatch[] {
  const matches: AllergenMatch[] = [];
  const textLower = ingredientText.toLowerCase();

  // Check each user allergen
  userAllergens.forEach((userAllergen) => {
    const allergenDef = UK_ALLERGENS.find((a) => a.id === userAllergen);
    if (!allergenDef) return;

    // Get taxonomy for this allergen (if available)
    const taxonomy = ALLERGEN_TAXONOMIES[userAllergen];

    // STEP 1: Check SAFE list first (explicit allowlist)
    // If ingredient is explicitly safe, skip this allergen entirely
    if (taxonomy?.safe) {
      const isSafe = taxonomy.safe.some((safeItem) =>
        textLower.includes(safeItem.toLowerCase())
      );

      if (isSafe) {
        // Ingredient is explicitly safe for this allergen - don't check further
        return;
      }
    }

    // STEP 2: Check UNSAFE list (explicit blocklist)
    // If ingredient is explicitly unsafe, add matches
    if (taxonomy?.unsafe) {
      const unsafeMatches: string[] = [];

      taxonomy.unsafe.forEach((unsafeItem) => {
        if (textLower.includes(unsafeItem.toLowerCase())) {
          unsafeMatches.push(unsafeItem);
        }
      });

      // If we found matches in taxonomy, add them and skip keyword matching
      if (unsafeMatches.length > 0) {
        unsafeMatches.forEach((matchedItem) => {
          matches.push({
            allergen: allergenDef.id,
            allergenLabel: allergenDef.label,
            ingredient: ingredientText,
            matchedKeyword: matchedItem,
          });
        });
        return; // Don't check keywords - we have taxonomy matches
      }
    }

    // STEP 3: Fallback to keyword matching
    // For allergens without taxonomy or items not found in taxonomy
    allergenDef.keywords.forEach((keyword) => {
      if (textLower.includes(keyword)) {
        matches.push({
          allergen: allergenDef.id,
          allergenLabel: allergenDef.label,
          ingredient: ingredientText,
          matchedKeyword: keyword,
        });
      }
    });
  });

  return matches;
}

/**
 * Detects allergens across multiple ingredients
 * @param ingredients - Array of ingredient objects with 'item' property
 * @param userAllergens - Array of allergen IDs the user is allergic to
 * @returns Array of unique allergen matches
 */
export function detectAllergensInIngredients(
  ingredients: Array<{ item: string; notes?: string }>,
  userAllergens: string[]
): AllergenMatch[] {
  const allMatches: AllergenMatch[] = [];

  ingredients.forEach((ingredient) => {
    const text = `${ingredient.item} ${ingredient.notes || ''}`;
    const matches = detectAllergensInText(text, userAllergens);
    allMatches.push(...matches);
  });

  // Remove duplicates (same allergen + ingredient combo)
  const uniqueMatches = allMatches.filter(
    (match, index, self) =>
      index ===
      self.findIndex(
        (m) =>
          m.allergen === match.allergen && m.ingredient === match.ingredient
      )
  );

  return uniqueMatches;
}

/**
 * Groups allergen matches by allergen type
 * @param matches - Array of allergen matches
 * @returns Object mapping allergen ID to array of ingredients containing it
 */
export function groupMatchesByAllergen(
  matches: AllergenMatch[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  matches.forEach((match) => {
    if (!grouped[match.allergenLabel]) {
      grouped[match.allergenLabel] = [];
    }
    if (!grouped[match.allergenLabel].includes(match.ingredient)) {
      grouped[match.allergenLabel].push(match.ingredient);
    }
  });

  return grouped;
}
