// UK 14 Major Allergens - Natasha's Law compliance
export const UK_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts', keywords: ['peanut', 'groundnut'] },
  { id: 'tree_nuts', label: 'Tree Nuts', keywords: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'] },
  { id: 'milk', label: 'Milk/Dairy', keywords: ['milk', 'dairy', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'] },
  { id: 'eggs', label: 'Eggs', keywords: ['egg', 'mayonnaise'] },
  { id: 'fish', label: 'Fish', keywords: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy'] },
  { id: 'shellfish', label: 'Shellfish', keywords: ['shellfish', 'prawn', 'shrimp', 'crab', 'lobster', 'crayfish'] },
  { id: 'molluscs', label: 'Molluscs', keywords: ['mollusc', 'mussel', 'oyster', 'squid', 'snail', 'winkle'] },
  { id: 'soy', label: 'Soya', keywords: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce', 'miso'] },
  { id: 'gluten', label: 'Gluten', keywords: ['gluten', 'wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oat'] },
  { id: 'sesame', label: 'Sesame', keywords: ['sesame', 'tahini'] },
  { id: 'celery', label: 'Celery', keywords: ['celery', 'celeriac'] },
  { id: 'mustard', label: 'Mustard', keywords: ['mustard'] },
  { id: 'lupin', label: 'Lupin', keywords: ['lupin'] },
  { id: 'sulphites', label: 'Sulphites', keywords: ['sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide'] },
];

export interface AllergenMatch {
  allergen: string; // e.g., 'peanuts'
  allergenLabel: string; // e.g., 'Peanuts'
  ingredient: string; // e.g., 'peanut butter'
  matchedKeyword: string; // e.g., 'peanut'
}

/**
 * Detects allergens in ingredient text based on user's allergen profile
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

    // Check if any keyword matches
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
