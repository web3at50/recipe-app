export interface Profile {
  id: string
  email: string
  display_name?: string
  preferred_ai_model?: 'anthropic' | 'openai' | 'gemini' | 'grok'
  dietary_preferences?: string[]
  created_at: string
  updated_at: string
}

// Ingredient mode for AI recipe generation
export type IngredientMode = 'strict' | 'flexible' | 'creative';

// Re-export all recipe app types
export * from './recipe';
export * from './user-profile';
export * from './meal-plan';
export * from './shopping-list';
export * from './pantry';
