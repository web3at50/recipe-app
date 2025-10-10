/**
 * Standard UK measurement units for recipe ingredients
 * Ensures consistency across manual entry and AI generation
 */

export const STANDARD_UNITS = {
  // Weight
  weight: ['g', 'kg'],

  // Volume
  volume: ['ml', 'l', 'tsp', 'tbsp'],

  // Count/Quantity
  count: ['whole', 'clove', 'tin', 'can', 'cube', 'slice', 'piece'],

  // Special
  special: ['to taste', 'pinch', 'handful'],

  // None (for items that don't need units)
  none: [''],
} as const;

export const UNIT_OPTIONS = [
  { value: '', label: 'None' },

  // Weight
  { value: 'g', label: 'g (grams)', group: 'Weight' },
  { value: 'kg', label: 'kg (kilograms)', group: 'Weight' },

  // Volume
  { value: 'ml', label: 'ml (millilitres)', group: 'Volume' },
  { value: 'l', label: 'l (litres)', group: 'Volume' },
  { value: 'tsp', label: 'tsp (teaspoon)', group: 'Volume' },
  { value: 'tbsp', label: 'tbsp (tablespoon)', group: 'Volume' },

  // Count
  { value: 'whole', label: 'whole', group: 'Count' },
  { value: 'clove', label: 'clove', group: 'Count' },
  { value: 'tin', label: 'tin', group: 'Count' },
  { value: 'can', label: 'can', group: 'Count' },
  { value: 'cube', label: 'cube', group: 'Count' },
  { value: 'slice', label: 'slice', group: 'Count' },
  { value: 'piece', label: 'piece', group: 'Count' },

  // Special
  { value: 'to taste', label: 'to taste', group: 'Special' },
  { value: 'pinch', label: 'pinch', group: 'Special' },
  { value: 'handful', label: 'handful', group: 'Special' },
] as const;

/**
 * Normalize unit names for comparison and consolidation
 * Handles common spelling variations and plural forms
 */
export function normalizeUnit(unit?: string): string {
  if (!unit) return '';

  const lower = unit.toLowerCase().trim();

  // Map common variations to standard units
  const unitMap: Record<string, string> = {
    // Weight
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kilo': 'kg',
    'kilos': 'kg',

    // Volume
    'millilitre': 'ml',
    'millilitres': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'litre': 'l',
    'litres': 'l',
    'liter': 'l',
    'liters': 'l',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',

    // Count
    'tins': 'tin',
    'can': 'tin', // Normalize can to tin
    'cans': 'tin',
    'cloves': 'clove',
    'cubes': 'cube',
    'slices': 'slice',
    'pieces': 'piece',
  };

  return unitMap[lower] || lower;
}
