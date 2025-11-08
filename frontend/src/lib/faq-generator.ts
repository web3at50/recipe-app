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
 * Recipe data needed for FAQ generation
 */
export interface RecipeFAQData {
  name: string;
  allergens: string[] | null | undefined;
  tags?: string[];
  prep_time?: number | null;
  cook_time?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
}

/**
 * Generates comprehensive FAQs for a recipe
 * Includes: allergens, cooking time, dietary info, make-ahead capability
 * @param recipeData - Recipe data needed for FAQ generation
 * @returns FAQ array with all relevant questions
 */
export function generateRecipeFAQs(recipeData: RecipeFAQData): FAQ[] {
  const faqs: FAQ[] = [];

  // 1. ALLERGEN FAQ (always included)
  faqs.push(..._generateAllergenFAQInternal(recipeData.allergens, recipeData.name));

  // 2. COOKING TIME FAQ (if time data available)
  faqs.push(...generateCookingTimeFAQ(recipeData.name, recipeData.prep_time, recipeData.cook_time));

  // 3. DIETARY SUITABILITY FAQ (if tags available)
  if (recipeData.tags && recipeData.tags.length > 0) {
    faqs.push(...generateDietaryFAQ(recipeData.name, recipeData.tags));
  }

  // 4. MAKE-AHEAD/STORAGE FAQ (if relevant tags)
  if (recipeData.tags && recipeData.tags.length > 0) {
    faqs.push(...generateMakeAheadFAQ(recipeData.name, recipeData.tags));
  }

  return faqs;
}

/**
 * Internal function to generate allergen FAQ
 * @param allergens - Array of allergen identifiers (e.g., ['dairy', 'gluten'])
 * @param recipeName - Recipe name for contextual FAQ
 * @returns FAQ array with allergen information
 */
function _generateAllergenFAQInternal(
  allergens: string[] | null | undefined,
  recipeName: string
): FAQ[] {
  const faqs: FAQ[] = [];
  const hasAllergens = allergens && allergens.length > 0;

  if (hasAllergens) {
    const allergenList = allergens
      .map(a => formatAllergenName(a))
      .join(', ');

    faqs.push({
      question: `Does ${recipeName} contain any allergens?`,
      answer: `Yes, this recipe contains or may contain the following allergens: ${allergenList}. Please check the ingredients list carefully if you have allergies. Cross-contamination may occur during preparation.`
    });
  } else {
    faqs.push({
      question: `Does ${recipeName} contain any allergens?`,
      answer: 'Based on the ingredients analysis, no common allergens (as per UK Food Standards Agency guidelines) were detected in this recipe. However, always check ingredient labels for potential cross-contamination warnings, and consult with a healthcare professional if you have severe allergies.'
    });
  }

  return faqs;
}

/**
 * Generates FAQ about total cooking time
 * @param recipeName - Recipe name
 * @param prepTime - Prep time in minutes
 * @param cookTime - Cook time in minutes
 * @returns FAQ array with cooking time information
 */
function generateCookingTimeFAQ(
  recipeName: string,
  prepTime?: number | null,
  cookTime?: number | null
): FAQ[] {
  const faqs: FAQ[] = [];

  const prep = prepTime || 0;
  const cook = cookTime || 0;
  const total = prep + cook;

  if (total > 0) {
    let timeBreakdown = '';
    if (prep > 0 && cook > 0) {
      timeBreakdown = `${prep} minutes prep time and ${cook} minutes cooking time, for a total of ${total} minutes`;
    } else if (prep > 0) {
      timeBreakdown = `${prep} minutes prep time`;
    } else {
      timeBreakdown = `${cook} minutes cooking time`;
    }

    faqs.push({
      question: `How long does ${recipeName} take to make?`,
      answer: `This recipe takes ${timeBreakdown}. Make sure to read through all the steps before starting to ensure you have enough time.`
    });
  }

  return faqs;
}

/**
 * Generates FAQ about dietary suitability
 * @param recipeName - Recipe name
 * @param tags - Recipe tags
 * @returns FAQ array with dietary information
 */
function generateDietaryFAQ(recipeName: string, tags: string[]): FAQ[] {
  const faqs: FAQ[] = [];

  const dietaryTags = tags.filter(tag =>
    ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein', 'keto'].includes(tag.toLowerCase())
  );

  if (dietaryTags.length > 0) {
    const isVegetarian = dietaryTags.some(t => t.toLowerCase() === 'vegetarian');
    const isVegan = dietaryTags.some(t => t.toLowerCase() === 'vegan');

    let answer = '';
    if (isVegan) {
      answer = `Yes! ${recipeName} is vegan, which means it contains no animal products including meat, dairy, eggs, or honey.`;
    } else if (isVegetarian) {
      answer = `Yes! ${recipeName} is vegetarian, which means it contains no meat or fish. However, it may contain dairy or eggs.`;
    } else {
      const formattedTags = dietaryTags
        .map(t => t.replace('-', ' '))
        .join(', ');
      answer = `This recipe is ${formattedTags}. Please review the ingredients list to ensure it meets your specific dietary needs.`;
    }

    faqs.push({
      question: `Is ${recipeName} suitable for special diets?`,
      answer: answer
    });
  }

  return faqs;
}

/**
 * Generates FAQ about make-ahead and storage options
 * @param recipeName - Recipe name
 * @param tags - Recipe tags
 * @returns FAQ array with make-ahead information
 */
function generateMakeAheadFAQ(recipeName: string, tags: string[]): FAQ[] {
  const faqs: FAQ[] = [];

  const isBatchCooking = tags.some(t => t.toLowerCase() === 'batch-cooking');
  const isFreezerFriendly = tags.some(t => t.toLowerCase() === 'freezer-friendly');
  const isMealPrep = tags.some(t => t.toLowerCase() === 'meal-prep');

  if (isBatchCooking || isFreezerFriendly || isMealPrep) {
    let answer = '';

    if (isFreezerFriendly && isBatchCooking) {
      answer = `Yes! ${recipeName} is perfect for batch cooking and can be frozen for later. Cook a large batch and freeze individual portions for quick meals throughout the week. Properly stored, it will keep in the freezer for up to 3 months.`;
    } else if (isFreezerFriendly) {
      answer = `Yes! ${recipeName} is freezer-friendly. You can make it ahead and freeze for later use. Properly stored, it will keep in the freezer for up to 3 months. Defrost overnight in the fridge before reheating.`;
    } else if (isBatchCooking || isMealPrep) {
      answer = `Yes! ${recipeName} is great for meal prep and can be made ahead. Store in airtight containers in the fridge for 3-4 days. This is perfect for preparing meals in advance for busy weekdays.`;
    }

    if (answer) {
      faqs.push({
        question: `Can ${recipeName} be made ahead or frozen?`,
        answer: answer
      });
    }
  }

  return faqs;
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use generateRecipeFAQs instead
 */
export function generateAllergenFAQ(
  allergens: string[] | null | undefined,
  recipeName?: string
): FAQ[] {
  return generateRecipeFAQs({
    name: recipeName || 'this recipe',
    allergens: allergens,
  });
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
