/**
 * Session Storage Utilities for Pre-Auth Playground
 *
 * This module provides a unified interface for storing and retrieving
 * recipe data in the browser's session storage (data lost on tab close/refresh).
 *
 * Used for the pre-auth playground experience where users can try features
 * without signing up, but data is not persisted to the database.
 */

// Storage keys
const STORAGE_KEYS = {
  RECIPES: 'playground_recipes',
  MEAL_PLANS: 'playground_meal_plans',
  SHOPPING_LISTS: 'playground_shopping_lists',
  USER_PREFERENCES: 'playground_preferences',
  GENERATION_COUNT: 'playground_generation_count',
  SESSION_START: 'playground_session_start',
} as const;

// Types matching our database schema
export interface PlaygroundRecipe {
  id: string;
  name: string;
  description?: string | null;
  cuisine?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings: number;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  ingredients: Array<{
    item: string;
    quantity?: string;
    unit?: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
  }>;
  allergens?: string[];
  tags?: string[];
  source: 'ai_generated' | 'user_created';
  created_at: string;
}

export interface PlaygroundMealPlan {
  id: string;
  week_start_date: string;
  items: Array<{
    id: string;
    recipe_id: string;
    recipe_name: string;
    day_of_week: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
  }>;
  created_at: string;
}

export interface PlaygroundShoppingList {
  id: string;
  name: string;
  items: Array<{
    id: string;
    item_name: string;
    quantity: string;
    category: string;
    checked: boolean;
  }>;
  created_at: string;
}

export interface PlaygroundPreferences {
  dietary_restrictions?: string[];
  allergies?: string[];
  household_size?: number;
  cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Check if session storage is available
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from session storage with type safety
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isSessionStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    console.error(`Error reading from session storage (${key})`);
    return defaultValue;
  }
}

/**
 * Set item in session storage
 */
function setStorageItem<T>(key: string, value: T): void {
  if (!isSessionStorageAvailable()) {
    console.warn('Session storage not available');
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to session storage (${key}):`, error);
  }
}

/**
 * Generate unique ID for playground items
 */
export function generatePlaygroundId(): string {
  return `playground_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// RECIPES
// ============================================

/**
 * Get all recipes from session storage
 */
export function getPlaygroundRecipes(): PlaygroundRecipe[] {
  return getStorageItem<PlaygroundRecipe[]>(STORAGE_KEYS.RECIPES, []);
}

/**
 * Get single recipe by ID
 */
export function getPlaygroundRecipe(id: string): PlaygroundRecipe | null {
  const recipes = getPlaygroundRecipes();
  return recipes.find(r => r.id === id) || null;
}

/**
 * Save recipe to session storage
 */
export function savePlaygroundRecipe(recipe: Omit<PlaygroundRecipe, 'id' | 'created_at'>): PlaygroundRecipe {
  const recipes = getPlaygroundRecipes();

  const newRecipe: PlaygroundRecipe = {
    ...recipe,
    id: generatePlaygroundId(),
    created_at: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  setStorageItem(STORAGE_KEYS.RECIPES, recipes);

  return newRecipe;
}

/**
 * Update recipe in session storage
 */
export function updatePlaygroundRecipe(id: string, updates: Partial<PlaygroundRecipe>): PlaygroundRecipe | null {
  const recipes = getPlaygroundRecipes();
  const index = recipes.findIndex(r => r.id === id);

  if (index === -1) {
    return null;
  }

  recipes[index] = { ...recipes[index], ...updates };
  setStorageItem(STORAGE_KEYS.RECIPES, recipes);

  return recipes[index];
}

/**
 * Delete recipe from session storage
 */
export function deletePlaygroundRecipe(id: string): boolean {
  const recipes = getPlaygroundRecipes();
  const filtered = recipes.filter(r => r.id !== id);

  if (filtered.length === recipes.length) {
    return false; // Recipe not found
  }

  setStorageItem(STORAGE_KEYS.RECIPES, filtered);
  return true;
}

// ============================================
// MEAL PLANS
// ============================================

/**
 * Get current meal plan from session storage
 */
export function getPlaygroundMealPlan(): PlaygroundMealPlan | null {
  const mealPlans = getStorageItem<PlaygroundMealPlan[]>(STORAGE_KEYS.MEAL_PLANS, []);
  return mealPlans[0] || null; // Return most recent
}

/**
 * Save meal plan to session storage
 */
export function savePlaygroundMealPlan(mealPlan: Omit<PlaygroundMealPlan, 'id' | 'created_at'>): PlaygroundMealPlan {
  const newMealPlan: PlaygroundMealPlan = {
    ...mealPlan,
    id: generatePlaygroundId(),
    created_at: new Date().toISOString(),
  };

  // Only keep one meal plan in session (most recent)
  setStorageItem(STORAGE_KEYS.MEAL_PLANS, [newMealPlan]);

  return newMealPlan;
}

/**
 * Update meal plan in session storage
 */
export function updatePlaygroundMealPlan(updates: Partial<PlaygroundMealPlan>): PlaygroundMealPlan | null {
  const currentPlan = getPlaygroundMealPlan();

  if (!currentPlan) {
    return null;
  }

  const updatedPlan = { ...currentPlan, ...updates };
  setStorageItem(STORAGE_KEYS.MEAL_PLANS, [updatedPlan]);

  return updatedPlan;
}

/**
 * Add recipe to meal plan
 */
export function addRecipeToPlaygroundMealPlan(
  recipeId: string,
  recipeName: string,
  dayOfWeek: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  servings: number
): PlaygroundMealPlan {
  let currentPlan = getPlaygroundMealPlan();

  // Create new meal plan if none exists
  if (!currentPlan) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week

    currentPlan = {
      id: generatePlaygroundId(),
      week_start_date: monday.toISOString().split('T')[0],
      items: [],
      created_at: new Date().toISOString(),
    };
  }

  // Add new item
  const newItem = {
    id: generatePlaygroundId(),
    recipe_id: recipeId,
    recipe_name: recipeName,
    day_of_week: dayOfWeek,
    meal_type: mealType,
    servings,
  };

  currentPlan.items.push(newItem);
  setStorageItem(STORAGE_KEYS.MEAL_PLANS, [currentPlan]);

  return currentPlan;
}

/**
 * Remove recipe from meal plan
 */
export function removeRecipeFromPlaygroundMealPlan(itemId: string): boolean {
  const currentPlan = getPlaygroundMealPlan();

  if (!currentPlan) {
    return false;
  }

  const filtered = currentPlan.items.filter(item => item.id !== itemId);

  if (filtered.length === currentPlan.items.length) {
    return false; // Item not found
  }

  currentPlan.items = filtered;
  setStorageItem(STORAGE_KEYS.MEAL_PLANS, [currentPlan]);

  return true;
}

// ============================================
// SHOPPING LISTS
// ============================================

/**
 * Get current shopping list from session storage
 */
export function getPlaygroundShoppingList(): PlaygroundShoppingList | null {
  const lists = getStorageItem<PlaygroundShoppingList[]>(STORAGE_KEYS.SHOPPING_LISTS, []);
  return lists[0] || null; // Return most recent
}

/**
 * Save shopping list to session storage
 */
export function savePlaygroundShoppingList(
  list: Omit<PlaygroundShoppingList, 'id' | 'created_at'>
): PlaygroundShoppingList {
  const newList: PlaygroundShoppingList = {
    ...list,
    id: generatePlaygroundId(),
    created_at: new Date().toISOString(),
  };

  // Only keep one shopping list in session (most recent)
  setStorageItem(STORAGE_KEYS.SHOPPING_LISTS, [newList]);

  return newList;
}

/**
 * Update shopping list item (check/uncheck)
 */
export function updatePlaygroundShoppingListItem(itemId: string, checked: boolean): boolean {
  const currentList = getPlaygroundShoppingList();

  if (!currentList) {
    return false;
  }

  const item = currentList.items.find(i => i.id === itemId);

  if (!item) {
    return false;
  }

  item.checked = checked;
  setStorageItem(STORAGE_KEYS.SHOPPING_LISTS, [currentList]);

  return true;
}

/**
 * Add item to shopping list
 */
export function addItemToPlaygroundShoppingList(
  itemName: string,
  quantity: string,
  category: string
): boolean {
  const currentList = getPlaygroundShoppingList();

  if (!currentList) {
    return false;
  }

  const newItem = {
    id: generatePlaygroundId(),
    item_name: itemName,
    quantity,
    category,
    checked: false,
  };

  currentList.items.push(newItem);
  setStorageItem(STORAGE_KEYS.SHOPPING_LISTS, [currentList]);

  return true;
}

/**
 * Remove item from shopping list
 */
export function removeItemFromPlaygroundShoppingList(itemId: string): boolean {
  const currentList = getPlaygroundShoppingList();

  if (!currentList) {
    return false;
  }

  const filtered = currentList.items.filter(item => item.id !== itemId);

  if (filtered.length === currentList.items.length) {
    return false; // Item not found
  }

  currentList.items = filtered;
  setStorageItem(STORAGE_KEYS.SHOPPING_LISTS, [currentList]);

  return true;
}

// ============================================
// USER PREFERENCES
// ============================================

/**
 * Get user preferences from session storage
 */
export function getPlaygroundPreferences(): PlaygroundPreferences {
  return getStorageItem<PlaygroundPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
}

/**
 * Save user preferences to session storage
 */
export function savePlaygroundPreferences(preferences: PlaygroundPreferences): void {
  setStorageItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
}

// ============================================
// SESSION TRACKING
// ============================================

/**
 * Get recipe generation count for current session
 */
export function getPlaygroundGenerationCount(): number {
  return getStorageItem<number>(STORAGE_KEYS.GENERATION_COUNT, 0);
}

/**
 * Increment recipe generation count
 */
export function incrementPlaygroundGenerationCount(): number {
  const count = getPlaygroundGenerationCount();
  const newCount = count + 1;
  setStorageItem(STORAGE_KEYS.GENERATION_COUNT, newCount);
  return newCount;
}

/**
 * Get session start time
 */
export function getPlaygroundSessionStart(): Date | null {
  const timestamp = getStorageItem<string | null>(STORAGE_KEYS.SESSION_START, null);
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Initialize session (call on first playground visit)
 */
export function initializePlaygroundSession(): void {
  const existingStart = getPlaygroundSessionStart();

  if (!existingStart) {
    setStorageItem(STORAGE_KEYS.SESSION_START, new Date().toISOString());
  }
}

/**
 * Clear all playground data (useful for testing or "start fresh")
 */
export function clearPlaygroundData(): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  Object.values(STORAGE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Get all playground data (for migration to database after signup)
 */
export function getAllPlaygroundData() {
  return {
    recipes: getPlaygroundRecipes(),
    mealPlan: getPlaygroundMealPlan(),
    shoppingList: getPlaygroundShoppingList(),
    preferences: getPlaygroundPreferences(),
  };
}

/**
 * Get playground data summary (for analytics)
 */
export function getPlaygroundDataSummary() {
  return {
    recipesCount: getPlaygroundRecipes().length,
    hasMealPlan: getPlaygroundMealPlan() !== null,
    hasShoppingList: getPlaygroundShoppingList() !== null,
    generationCount: getPlaygroundGenerationCount(),
    sessionStart: getPlaygroundSessionStart(),
  };
}
