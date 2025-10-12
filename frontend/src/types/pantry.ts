// Pantry Staples Types

/**
 * User preference for pantry item behavior
 * - 'auto': Let system auto-detect based on quantity/context (default)
 * - 'hide': Always hide this item from shopping lists (force hide)
 * - 'show': Always show this item on shopping lists (force show)
 */
export type PantryPreferenceState = 'auto' | 'hide' | 'show';

/**
 * User's custom pantry staple configuration
 */
export interface PantryStaple {
  id: string;
  user_id: string;
  item_pattern: string;
  preference_state: PantryPreferenceState;
  created_at: string;
}

/**
 * Standard UK pantry item for onboarding
 */
export interface StandardPantryItem {
  id: string;
  name: string;
  category: PantryCategory;
}

/**
 * Categories for organizing pantry items
 */
export type PantryCategory =
  | 'oils-fats'
  | 'seasonings'
  | 'herbs-spices'
  | 'baking'
  | 'vinegars-acids'
  | 'condiments'
  | 'tinned-dried'
  | 'fresh-staples';

/**
 * Display labels for pantry categories
 */
export const PANTRY_CATEGORY_LABELS: Record<PantryCategory, string> = {
  'oils-fats': 'Oils & Fats',
  'seasonings': 'Seasonings',
  'herbs-spices': 'Herbs & Spices',
  'baking': 'Baking Essentials',
  'vinegars-acids': 'Vinegars & Acids',
  'condiments': 'Condiments',
  'tinned-dried': 'Tinned & Dried Goods',
  'fresh-staples': 'Fresh Staples',
};

/**
 * Standard UK pantry items list (45 items)
 * Based on research from Jamie Oliver, Sainsbury's, and Good Housekeeping UK
 */
export const STANDARD_UK_PANTRY_ITEMS: StandardPantryItem[] = [
  // Oils & Fats
  { id: 'olive-oil', name: 'Olive oil', category: 'oils-fats' },
  { id: 'vegetable-oil', name: 'Vegetable oil', category: 'oils-fats' },
  { id: 'sunflower-oil', name: 'Sunflower oil', category: 'oils-fats' },
  { id: 'butter', name: 'Butter', category: 'oils-fats' },

  // Seasonings
  { id: 'salt', name: 'Salt', category: 'seasonings' },
  { id: 'black-pepper', name: 'Black pepper', category: 'seasonings' },
  { id: 'garlic-granules', name: 'Garlic granules', category: 'seasonings' },
  { id: 'onion-powder', name: 'Onion powder', category: 'seasonings' },

  // Herbs & Spices
  { id: 'mixed-herbs', name: 'Mixed herbs', category: 'herbs-spices' },
  { id: 'dried-basil', name: 'Dried basil', category: 'herbs-spices' },
  { id: 'dried-oregano', name: 'Dried oregano', category: 'herbs-spices' },
  { id: 'paprika', name: 'Paprika', category: 'herbs-spices' },
  { id: 'cumin', name: 'Cumin', category: 'herbs-spices' },
  { id: 'ground-coriander', name: 'Ground coriander', category: 'herbs-spices' },
  { id: 'chilli-flakes', name: 'Chilli flakes', category: 'herbs-spices' },
  { id: 'cinnamon', name: 'Cinnamon', category: 'herbs-spices' },
  { id: 'ground-ginger', name: 'Ground ginger', category: 'herbs-spices' },
  { id: 'turmeric', name: 'Turmeric', category: 'herbs-spices' },

  // Baking Essentials
  { id: 'plain-flour', name: 'Plain flour', category: 'baking' },
  { id: 'self-raising-flour', name: 'Self-raising flour', category: 'baking' },
  { id: 'caster-sugar', name: 'Caster sugar', category: 'baking' },
  { id: 'granulated-sugar', name: 'Granulated sugar', category: 'baking' },
  { id: 'brown-sugar', name: 'Brown sugar', category: 'baking' },
  { id: 'baking-powder', name: 'Baking powder', category: 'baking' },
  { id: 'bicarbonate-soda', name: 'Bicarbonate of soda', category: 'baking' },
  { id: 'vanilla-extract', name: 'Vanilla extract', category: 'baking' },

  // Vinegars & Acids
  { id: 'white-wine-vinegar', name: 'White wine vinegar', category: 'vinegars-acids' },
  { id: 'balsamic-vinegar', name: 'Balsamic vinegar', category: 'vinegars-acids' },
  { id: 'lemon-juice', name: 'Lemon juice', category: 'vinegars-acids' },

  // Condiments
  { id: 'soy-sauce', name: 'Soy sauce', category: 'condiments' },
  { id: 'worcestershire-sauce', name: 'Worcestershire sauce', category: 'condiments' },
  { id: 'tomato-ketchup', name: 'Tomato ketchup', category: 'condiments' },
  { id: 'mustard', name: 'Mustard', category: 'condiments' },
  { id: 'mayonnaise', name: 'Mayonnaise', category: 'condiments' },
  { id: 'honey', name: 'Honey', category: 'condiments' },

  // Tinned & Dried Goods
  { id: 'tinned-tomatoes', name: 'Tinned tomatoes', category: 'tinned-dried' },
  { id: 'tomato-puree', name: 'Tomato purée', category: 'tinned-dried' },
  { id: 'vegetable-stock', name: 'Vegetable stock cubes', category: 'tinned-dried' },
  { id: 'chicken-stock', name: 'Chicken stock cubes', category: 'tinned-dried' },
  { id: 'pasta', name: 'Pasta', category: 'tinned-dried' },
  { id: 'rice', name: 'Rice', category: 'tinned-dried' },

  // Fresh Staples
  { id: 'garlic', name: 'Garlic', category: 'fresh-staples' },
  { id: 'onions', name: 'Onions', category: 'fresh-staples' },
  { id: 'eggs', name: 'Eggs', category: 'fresh-staples' },
];

/**
 * Get pantry items grouped by category
 */
export function getPantryItemsByCategory(): Record<PantryCategory, StandardPantryItem[]> {
  return STANDARD_UK_PANTRY_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<PantryCategory, StandardPantryItem[]>);
}
