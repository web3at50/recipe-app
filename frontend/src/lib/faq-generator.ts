/**
 * FAQ Generator for Recipe LLM Optimization
 *
 * Generates frequently asked questions for recipes to improve:
 * - SEO (Search Engine Optimization)
 * - LLM crawlers and AI understanding
 * - User accessibility
 */

import { FAQ } from '@/types/recipe';

/**
 * Generates an FAQ about allergens in the recipe
 * @param allergens - Array of allergen identifiers (e.g., ['dairy', 'gluten'])
 * @param recipeName - Optional recipe name for contextual FAQ
 * @returns FAQ array with allergen information
 */
export function generateAllergenFAQ(
  allergens: string[] | null | undefined,
  recipeName?: string
): FAQ[] {
  const faqs: FAQ[] = [];

  // Generate allergen FAQ
  const hasAllergens = allergens && allergens.length > 0;

  if (hasAllergens) {
    // Format allergens for display
    const allergenList = allergens
      .map(a => formatAllergenName(a))
      .join(', ');

    // Create FAQ entry
    faqs.push({
      question: recipeName
        ? `Does ${recipeName} contain any allergens?`
        : 'Does this recipe contain any allergens?',
      answer: `Yes, this recipe contains or may contain the following allergens: ${allergenList}. Please check the ingredients list carefully if you have allergies. Cross-contamination may occur during preparation.`
    });
  } else {
    // No allergens detected
    faqs.push({
      question: recipeName
        ? `Does ${recipeName} contain any allergens?`
        : 'Does this recipe contain any allergens?',
      answer: 'Based on the ingredients analysis, no common allergens (as per UK Food Standards Agency guidelines) were detected in this recipe. However, always check ingredient labels for potential cross-contamination warnings, and consult with a healthcare professional if you have severe allergies.'
    });
  }

  return faqs;
}

/**
 * Formats allergen identifier to human-readable name
 * @param allergen - Allergen identifier (e.g., 'tree_nuts')
 * @returns Formatted allergen name (e.g., 'Tree Nuts')
 */
function formatAllergenName(allergen: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'tree_nuts': 'Tree Nuts',
    'soy': 'Soya',
    'shellfish': 'Crustaceans',
    'molluscs': 'Molluscs',
  };

  if (specialCases[allergen.toLowerCase()]) {
    return specialCases[allergen.toLowerCase()];
  }

  // Capitalize first letter of each word
  return allergen
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Merges new FAQ entries with existing FAQs, avoiding duplicates
 * @param existingFAQs - Current FAQ array
 * @param newFAQs - New FAQ entries to add
 * @returns Merged FAQ array
 */
export function mergeFAQs(
  existingFAQs: FAQ[] | null | undefined,
  newFAQs: FAQ[]
): FAQ[] {
  const existing = existingFAQs || [];

  // Create a Set of existing questions for quick lookup
  const existingQuestions = new Set(
    existing.map(faq => faq.question.toLowerCase().trim())
  );

  // Add new FAQs that don't duplicate existing ones
  const merged = [...existing];

  for (const newFaq of newFAQs) {
    const questionKey = newFaq.question.toLowerCase().trim();
    if (!existingQuestions.has(questionKey)) {
      merged.push(newFaq);
      existingQuestions.add(questionKey);
    }
  }

  return merged;
}
