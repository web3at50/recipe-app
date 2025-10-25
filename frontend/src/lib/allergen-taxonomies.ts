/**
 * Allergen Taxonomies - Explicit Safe/Unsafe Ingredient Lists
 *
 * Based on UK Food Standards Agency (FSA) guidance and Natasha's Law compliance.
 * These lists provide comprehensive coverage of known safe and unsafe ingredients
 * for each allergen category.
 *
 * USAGE:
 * These taxonomies are checked BEFORE keyword matching in allergen-detector.ts
 * to prevent false positives (e.g., buckwheat for gluten) and false negatives.
 *
 * CHECK ORDER:
 * 1. SAFE list checked first → if match found, ingredient is ALLOWED
 * 2. UNSAFE list checked second → if match found, ingredient is BLOCKED
 * 3. Keyword matching as fallback → for items not in either list
 *
 * MAINTENANCE:
 * Add new items to safe/unsafe arrays as edge cases are discovered.
 * Based on taxonomy documents in: /Markdown Docs/Prompt & Knowledge MD Docs to implement/
 *
 * @see 03-gluten-allergen-taxonomy.md
 */

export interface AllergenTaxonomy {
  /** Ingredients that DEFINITELY contain this allergen (will be blocked) */
  unsafe: string[];

  /** Ingredients that DEFINITELY DO NOT contain this allergen (will be allowed) */
  safe: string[];
}

/**
 * GLUTEN TAXONOMY
 * Based on UK FSA guidance and Coeliac UK resources
 */
export const GLUTEN_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Gluten
  unsafe: [
    // Primary grains
    'wheat', 'bread wheat', 'common wheat', 'durum wheat', 'wholemeal wheat',
    'wholewheat', 'wheat bran', 'wheat germ', 'spelt', 'kamut', 'farro',
    'einkorn', 'semolina', 'bulgur wheat', 'bulgur', 'couscous', 'freekeh',

    // Barley and malt
    'barley', 'pearl barley', 'pot barley', 'barley malt', 'malt extract',
    'malt vinegar', 'malt flavoring', 'malted barley flour', 'malt',

    // Rye
    'rye', 'rye grain', 'rye flour', 'rye bread', 'pumpernickel',

    // Hybrids
    'triticale',

    // Bread and baked goods
    'bread', 'white bread', 'brown bread', 'wholemeal bread', 'granary bread',
    'baguette', 'roll', 'bap', 'naan bread', 'naan', 'chapati', 'roti',
    'pitta bread', 'pitta', 'tortilla', 'wheat tortilla', 'croissant',
    'pain au chocolat', 'biscuit', 'cookie', 'cake', 'pastry', 'scone',
    'muffin', 'cracker', 'breadcrumb', 'panko',

    // Pasta and noodles
    'pasta', 'spaghetti', 'penne', 'fusilli', 'fettuccine', 'linguine',
    'macaroni', 'ravioli', 'tortellini', 'lasagne', 'cannelloni',
    'fresh pasta', 'dried pasta', 'egg noodle', 'udon noodle', 'udon',
    'ramen noodle', 'ramen', 'gnocchi',

    // Breakfast items
    'weetabix', 'shredded wheat', 'wheat biscuit', 'bran flake',

    // Sauces and condiments
    'soy sauce', 'worcestershire sauce', 'bisto',

    // Processed foods
    'fish finger', 'chicken nugget', 'battered fish', 'scotch egg',
    'pie', 'pasty', 'pizza', 'quiche', 'spring roll', 'samosa',

    // Drinks
    'beer', 'lager', 'ale', 'horlicks', 'ovaltine',

    // Snacks
    'pretzel', 'cereal bar',

    // Other
    'seitan', 'stuffing', 'communion wafer',

    // Generic terms (usually means wheat)
    'flour', 'plain flour', 'self-raising flour', 'strong flour',
  ],

  // ✅ SAFE - Naturally Gluten-Free
  safe: [
    // Rice
    'rice', 'white rice', 'brown rice', 'basmati rice', 'basmati',
    'jasmine rice', 'jasmine', 'arborio rice', 'arborio', 'risotto rice',
    'wild rice', 'rice flour', 'rice noodle', 'rice cake', 'rice cracker',

    // Corn (Maize)
    'cornflour', 'cornstarch', 'polenta', 'cornmeal', 'popcorn',
    'corn tortilla', 'corn chip', 'sweetcorn', 'corn',

    // Potatoes
    'potato', 'white potato', 'red potato', 'sweet potato', 'yam',
    'potato flour', 'potato starch', 'mashed potato',

    // Pseudo-cereals (despite names, these are gluten-free)
    'quinoa', 'red quinoa', 'white quinoa', 'black quinoa',
    'buckwheat', 'buckwheat flour', 'buckwheat groat', 'buckwheat noodle', 'soba',
    'amaranth', 'chia seed', 'chia',

    // Other gluten-free grains
    'millet', 'sorghum', 'teff',

    // Gluten-free flours
    'rice flour', 'corn flour', 'maize flour',
    'chickpea flour', 'gram flour', 'besan',
    'coconut flour', 'almond flour', 'almond meal',
    'tapioca flour', 'tapioca starch', 'tapioca',
    'arrowroot powder', 'arrowroot',
    'sorghum flour', 'gluten-free flour', 'gluten free flour',

    // Gluten-free products
    'gluten-free bread', 'gluten free bread',
    'gluten-free pasta', 'gluten free pasta',
    'rice noodle', 'glass noodle',

    // Sauces (gluten-free alternatives)
    'tamari', 'coconut aminos',

    // Baking ingredients
    'xanthan gum', 'guar gum', 'baking powder', 'bicarbonate of soda',
    'baking soda', 'vanilla extract', 'cocoa powder',

    // Fresh/natural foods (always gluten-free)
    'vegetable', 'fruit', 'meat', 'chicken', 'beef', 'pork', 'lamb',
    'fish', 'salmon', 'tuna', 'cod', 'egg', 'milk', 'butter',
    'oil', 'olive oil', 'vegetable oil', 'sugar', 'honey', 'maple syrup',
  ],
};

/**
 * DAIRY/MILK TAXONOMY
 * Based on UK FSA guidance
 */
export const DAIRY_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Dairy/Milk
  unsafe: [
    // Primary dairy products
    'milk', 'whole milk', 'semi-skimmed milk', 'skimmed milk',
    'dairy', 'cow milk', 'goat milk', 'sheep milk',

    // Cheese
    'cheese', 'cheddar', 'mozzarella', 'parmesan', 'brie', 'camembert',
    'stilton', 'feta', 'goat cheese', 'cream cheese', 'cottage cheese',
    'ricotta', 'mascarpone', 'halloumi', 'blue cheese',

    // Butter and spreads
    'butter', 'salted butter', 'unsalted butter', 'clarified butter', 'ghee',

    // Cream
    'cream', 'single cream', 'double cream', 'whipping cream', 'clotted cream',
    'sour cream', 'crème fraîche',

    // Yogurt
    'yogurt', 'yoghurt', 'greek yogurt', 'natural yogurt', 'flavoured yogurt',

    // Milk proteins
    'whey', 'whey protein', 'casein', 'lactose',

    // Ice cream and desserts
    'ice cream', 'gelato', 'custard',

    // Milk chocolate
    'milk chocolate',
  ],

  // ✅ SAFE - Does NOT Contain Dairy/Milk (Plant-based alternatives)
  safe: [
    // Plant-based milks
    'coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk',
    'cashew milk', 'rice milk', 'hemp milk', 'hazelnut milk',
    'macadamia milk', 'pea milk', 'oat drink', 'soy drink',

    // Plant-based alternatives
    'vegan butter', 'dairy-free butter', 'coconut oil',
    'vegan cheese', 'dairy-free cheese',
    'coconut cream', 'coconut yogurt', 'soy yogurt', 'almond yogurt',
    'oat yogurt', 'dairy-free yogurt',

    // Other safe items
    'dark chocolate', 'vegan ice cream', 'dairy-free ice cream',
    'sorbet', 'water ice',
  ],
};

/**
 * Export all taxonomies indexed by allergen ID
 * IDs match those in UK_ALLERGENS from allergen-detector.ts
 */
export const ALLERGEN_TAXONOMIES: Record<string, AllergenTaxonomy> = {
  gluten: GLUTEN_TAXONOMY,
  milk: DAIRY_TAXONOMY,

  // Add more allergen taxonomies here as they are developed:
  // tree_nuts: TREE_NUTS_TAXONOMY,
  // eggs: EGGS_TAXONOMY,
  // shellfish: SHELLFISH_TAXONOMY,
  // etc.
};
