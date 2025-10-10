export interface Profile {
  id: string
  email: string
  display_name?: string
  preferred_ai_model?: 'anthropic' | 'openai'
  dietary_preferences?: string[]
  created_at: string
  updated_at: string
}

// Re-export all recipe app types
export * from './recipe';
export * from './user-profile';
export * from './meal-plan';
export * from './shopping-list';
