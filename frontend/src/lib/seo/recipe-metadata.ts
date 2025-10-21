/**
 * SEO metadata generation utilities for recipe pages
 * Helps create optimized titles, descriptions, and keywords
 */

import type { Recipe } from '@/types/recipe';

/**
 * Generate SEO-optimized title for a recipe
 * Format: "[Recipe Name] Recipe | PlateWise"
 * Max 60 characters for Google
 *
 * @param recipeName - Name of the recipe
 * @returns SEO-optimized title
 */
export function generateSEOTitle(recipeName: string): string {
  const baseName = recipeName.trim();
  const suffix = ' | PlateWise';

  // If name + suffix is under 60 chars, use it
  if ((baseName + suffix).length <= 60) {
    return `${baseName}${suffix}`;
  }

  // If name alone is under 50 chars, add "Recipe"
  if ((baseName + ' Recipe' + suffix).length <= 60) {
    return `${baseName} Recipe${suffix}`;
  }

  // Truncate name to fit
  const maxNameLength = 60 - suffix.length - 3; // 3 for "..."
  return `${baseName.substring(0, maxNameLength)}...${suffix}`;
}

/**
 * Generate SEO-optimized description for a recipe
 * Max 155 characters for Google
 *
 * @param recipe - Recipe object
 * @returns SEO-optimized description
 */
export function generateSEODescription(recipe: Recipe): string {
  const {
    name,
    description,
    prep_time,
    cook_time,
    servings,
    ai_model,
  } = recipe;

  // Extract key info
  const totalTime = (prep_time || 0) + (cook_time || 0);
  const timeStr = totalTime > 0 ? `${totalTime} mins` : '';
  const servingsStr = servings ? `Serves ${servings}` : '';

  // Build description
  let desc = '';

  // Start with recipe name if no description
  if (!description || description.length < 20) {
    desc = `Delicious ${name.toLowerCase()} recipe. `;
  } else {
    // Use provided description
    desc = description.trim() + '. ';
  }

  // Add timing and servings
  const details = [timeStr, servingsStr].filter(Boolean).join(' • ');
  if (details) {
    desc += `${details}. `;
  }

  // Add UK-specific mention
  desc += 'British measurements, UK ingredients.';

  // Truncate to 155 characters
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }

  return desc;
}

/**
 * Generate SEO keywords for a recipe
 * @param recipe - Recipe object
 * @returns Array of keywords
 */
export function generateSEOKeywords(recipe: Recipe): string[] {
  const keywords: string[] = [];

  // Add recipe name variants
  keywords.push(recipe.name.toLowerCase());
  keywords.push(`${recipe.name.toLowerCase()} recipe`);

  // Add cuisine
  if (recipe.cuisine) {
    keywords.push(`${recipe.cuisine.toLowerCase()} recipe`);
  }

  // Add dietary tags
  if (recipe.tags) {
    keywords.push(
      ...recipe.tags.map((tag) => `${tag.toLowerCase()} recipe`)
    );
  }

  // Add difficulty
  if (recipe.difficulty) {
    keywords.push(`${recipe.difficulty} recipe`);
  }

  // Add time-based keywords
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  if (totalTime <= 30) {
    keywords.push('quick recipe', 'easy recipe');
  }

  // Add UK-specific keywords
  keywords.push('uk recipe', 'british recipe');

  // Deduplicate and return
  return Array.from(new Set(keywords));
}

/**
 * Suggest category based on recipe attributes
 * @param recipe - Recipe object
 * @returns Suggested category
 */
export function suggestCategory(recipe: Recipe): string {
  const name = recipe.name.toLowerCase();
  const description = recipe.description?.toLowerCase() || '';
  const tags = recipe.tags?.map((t) => t.toLowerCase()) || [];

  // Check tags first
  if (tags.includes('breakfast')) return 'breakfast';
  if (tags.includes('lunch')) return 'lunch';
  if (tags.includes('dinner')) return 'dinner';
  if (tags.includes('dessert') || tags.includes('desserts')) return 'desserts';
  if (tags.includes('snack') || tags.includes('snacks')) return 'snacks';

  // Check name and description for keywords
  const text = `${name} ${description}`;

  if (
    text.includes('breakfast') ||
    text.includes('pancake') ||
    text.includes('porridge') ||
    text.includes('eggs')
  ) {
    return 'breakfast';
  }

  if (
    text.includes('dessert') ||
    text.includes('cake') ||
    text.includes('cookie') ||
    text.includes('brownie') ||
    text.includes('pudding')
  ) {
    return 'desserts';
  }

  if (
    text.includes('salad') ||
    text.includes('sandwich') ||
    text.includes('wrap')
  ) {
    return 'lunch';
  }

  // Default to dinner
  return 'dinner';
}
