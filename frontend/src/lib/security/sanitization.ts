/**
 * Security-focused sanitization utilities to prevent XSS attacks
 *
 * Uses regex-based sanitization that works in serverless environments
 * Combined with React's built-in JSX escaping and CSP headers for defense-in-depth
 */

/**
 * Sanitize a single string input
 * Removes potentially malicious HTML, scripts, and event handlers
 *
 * Note: This is a lightweight approach suitable for serverless environments.
 * React automatically escapes all JSX values, providing additional XSS protection.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';

  let sanitized = input;

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Encode special HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
}

/**
 * Sanitize an array of strings
 */
export function sanitizeStringArray(input: string[] | null | undefined): string[] {
  if (!input || !Array.isArray(input)) return [];
  return input.map(item => sanitizeString(item)).filter(item => item.length > 0);
}

/**
 * Sanitize recipe ingredients
 */
export function sanitizeIngredients(
  ingredients: Array<{
    item: string;
    quantity?: string;
    unit?: string;
    notes?: string;
  }>
): Array<{
  item: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}> {
  return ingredients.map(ing => ({
    item: sanitizeString(ing.item),
    quantity: ing.quantity ? sanitizeString(ing.quantity) : undefined,
    unit: ing.unit ? sanitizeString(ing.unit) : undefined,
    notes: ing.notes ? sanitizeString(ing.notes) : undefined,
  }));
}

/**
 * Sanitize recipe instructions
 */
export function sanitizeInstructions(
  instructions: Array<{
    step?: number;
    instruction: string;
  }>
): Array<{
  step?: number;
  instruction: string;
}> {
  return instructions.map(inst => ({
    step: inst.step,
    instruction: sanitizeString(inst.instruction),
  }));
}

/**
 * Check for common XSS patterns (additional layer of defense)
 * Returns true if suspicious patterns detected
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input sanitization for recipe creation
 */
export function sanitizeRecipeInput<T extends {
  name: string;
  description?: string;
  cuisine?: string;
  ingredients: Array<{ item: string; quantity?: string; unit?: string; notes?: string }>;
  instructions: Array<{ step?: number; instruction: string }>;
  tags?: string[];
  allergens?: string[];
  [key: string]: unknown;
}>(input: T): T {
  return {
    ...input,
    name: sanitizeString(input.name),
    description: input.description ? sanitizeString(input.description) : undefined,
    cuisine: input.cuisine ? sanitizeString(input.cuisine) : undefined,
    ingredients: sanitizeIngredients(input.ingredients),
    instructions: sanitizeInstructions(input.instructions),
    tags: input.tags ? sanitizeStringArray(input.tags) : undefined,
    allergens: input.allergens ? sanitizeStringArray(input.allergens) : undefined,
  } as T;
}
