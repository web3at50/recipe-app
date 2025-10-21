/**
 * Generate URL-friendly slugs for recipe pages
 * Example: "Creamy Garlic Chicken Pasta" → "creamy-garlic-chicken-pasta"
 */

/**
 * Convert a recipe name to a URL-friendly slug
 * @param name - Recipe name
 * @returns URL-safe slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate slug format
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Must be lowercase, alphanumeric, and hyphens only
  // Must not start or end with hyphen
  // Must be between 3 and 100 characters
  const slugRegex = /^[a-z0-9]([a-z0-9\-]{1,98}[a-z0-9])?$/;
  return slugRegex.test(slug);
}
