// User Profile and Preferences Types

// User preferences stored as JSONB
export interface UserPreferences {
  dietary_restrictions: string[]; // ['vegetarian', 'vegan', 'pescatarian']
  allergies: string[]; // UK allergens from recipe.ts
  cuisines_liked: string[];
  cuisines_disliked: string[];
  disliked_ingredients: string[];
  cooking_skill: 'beginner' | 'intermediate' | 'advanced';
  household_size: number;
  budget_per_meal: number | null; // GBP
  typical_cook_time: number; // minutes
  cooking_mode?: 'standard' | 'slow_cooker' | 'air_fryer' | 'batch_cook'; // Cooking method preference
  spice_level: 'mild' | 'medium' | 'hot';
  preferred_ai_model: 'anthropic' | 'openai' | 'gemini' | 'grok';
}

// User profile interface (matches database)
export interface UserProfile {
  user_id: string;
  preferences: UserPreferences;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// User consent for GDPR compliance
export interface UserConsent {
  id: string;
  user_id: string;
  consent_type: 'essential' | 'personalization' | 'analytics';
  granted: boolean;
  consent_version: string;
  granted_at: string;
  withdrawn_at: string | null;
}

// User recipe interactions for behavioral tracking
export interface UserRecipeInteraction {
  id: string;
  user_id: string;
  recipe_id: string;
  interaction_type: 'viewed' | 'saved' | 'unsaved' | 'cooked' | 'planned' | 'added_to_shopping_list';
  session_duration: number | null; // seconds
  created_at: string;
}

// Onboarding form data
export interface OnboardingFormData {
  // Step 1: Allergies
  allergies: string[];

  // Step 2: Diet type
  dietary_restrictions: string[];

  // Step 3: Cooking profile
  cooking_skill: 'beginner' | 'intermediate' | 'advanced';
  typical_cook_time: number; // minutes
  household_size: number;

  // Step 4: Pantry staples (optional)
  pantry_staples?: string[]; // Array of standard pantry item IDs

  // Step 5: Optional preferences
  cuisines_liked?: string[];
  budget_per_meal?: number;
  spice_level?: 'mild' | 'medium' | 'hot';

  // Step 6: GDPR consents
  consents: {
    essential: boolean; // Always true (required)
    personalization: boolean; // Optional
    analytics: boolean; // Optional
  };
}

// Default preferences for new users
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dietary_restrictions: [],
  allergies: [],
  cuisines_liked: [],
  cuisines_disliked: [],
  disliked_ingredients: [],
  cooking_skill: 'intermediate',
  household_size: 2,
  budget_per_meal: null,
  typical_cook_time: 30,
  cooking_mode: 'standard',
  spice_level: 'medium',
  preferred_ai_model: 'anthropic'
};
