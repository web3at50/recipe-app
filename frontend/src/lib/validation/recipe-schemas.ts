import { z } from 'zod';

/**
 * Security-focused validation schemas for recipe generation and creation
 *
 * These schemas enforce:
 * - Max length limits to prevent abuse
 * - Type safety
 * - Input sanitization
 * - Prevention of malicious inputs
 */

// Individual ingredient validation
export const ingredientSchema = z.object({
  item: z.string()
    .min(1, 'Ingredient name is required')
    .max(100, 'Ingredient name too long (max 100 characters)')
    .trim(),
  quantity: z.string()
    .max(20, 'Quantity too long (max 20 characters)')
    .trim()
    .optional(),
  unit: z.string()
    .max(20, 'Unit too long (max 20 characters)')
    .trim()
    .optional(),
  notes: z.string()
    .max(200, 'Notes too long (max 200 characters)')
    .trim()
    .optional(),
});

// Individual instruction validation
export const instructionSchema = z.object({
  step: z.number().int().min(1).optional(),
  instruction: z.string()
    .min(1, 'Instruction is required')
    .max(1000, 'Instruction too long (max 1000 characters)')
    .trim(),
});

// Recipe generation request validation (from /create-recipe page)
export const recipeGenerationSchema = z.object({
  // Core inputs
  ingredients: z.array(z.string().trim().min(1).max(200))
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients (max 50)'),

  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .trim()
    .optional(),

  // Configuration
  ingredient_mode: z.enum(['strict', 'flexible', 'creative']).optional(),
  servings: z.number().int().min(1).max(20).optional(),
  prepTimeMax: z.number().int().min(5).max(300).optional(),
  cooking_mode: z.enum(['standard', 'slow_cooker', 'air_fryer', 'batch_cook']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  spice_level: z.enum(['mild', 'medium', 'hot']).optional(),
  favourite_cuisine: z.string().max(50).trim().optional(),

  // User preferences (temporary overrides)
  preferences: z.object({
    allergies: z.array(z.string().max(50)).max(20).optional(),
    dietary_restrictions: z.array(z.string().max(50)).max(10).optional(),
  }).optional(),

  // Pantry staples
  pantry_staples: z.array(z.string().trim().max(100)).max(100).optional(),

  // Model selection
  model: z.enum(['openai', 'claude', 'gemini', 'grok']).optional(),
});

// Recipe creation validation (saving to database)
export const recipeCreationSchema = z.object({
  name: z.string()
    .min(1, 'Recipe name is required')
    .max(200, 'Recipe name too long (max 200 characters)')
    .trim(),

  description: z.string()
    .max(1000, 'Description too long (max 1000 characters)')
    .trim()
    .optional(),

  cuisine: z.string()
    .max(50, 'Cuisine name too long')
    .trim()
    .optional(),

  prep_time: z.number().int().min(0).max(1440).optional(), // max 24 hours
  cook_time: z.number().int().min(0).max(1440).optional(), // max 24 hours
  servings: z.number().int().min(1).max(100),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

  ingredients: z.array(ingredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(100, 'Too many ingredients (max 100)'),

  instructions: z.array(instructionSchema)
    .min(1, 'At least one instruction is required')
    .max(50, 'Too many instructions (max 50)'),

  tags: z.array(z.string().max(50).trim()).max(20).optional(),
  allergens: z.array(z.string().max(50).trim()).max(20).optional(),

  nutrition: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
  }).optional(),

  cost_per_serving: z.number().min(0).max(1000).optional(),

  image_url: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL too long')
    .optional(),

  source: z.enum(['user_created', 'ai_generated', 'imported']).optional(),
  ai_model: z.string().max(100).optional(),
});

// Type exports for TypeScript
export type RecipeGenerationInput = z.infer<typeof recipeGenerationSchema>;
export type RecipeCreationInput = z.infer<typeof recipeCreationSchema>;
export type IngredientInput = z.infer<typeof ingredientSchema>;
export type InstructionInput = z.infer<typeof instructionSchema>;
