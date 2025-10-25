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
 * PEANUTS TAXONOMY
 * Based on UK FSA guidance and Anaphylaxis UK resources
 * @see 03-peanuts-allergen-taxonomy.md
 */
export const PEANUTS_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Peanuts
  unsafe: [
    // Direct peanut products
    'peanut', 'peanuts', 'peanut butter', 'peanut oil', 'groundnut', 'groundnut oil',
    'peanut flour', 'peanut protein', 'monkey nut',

    // Asian cuisine (high risk)
    'satay', 'satay sauce', 'pad thai', 'kung pao', 'gado-gado',
    'peanut sauce', 'thai peanut', 'vietnamese peanut',

    // African cuisine
    'maafe', 'groundnut stew', 'domoda', 'tigadegena',

    // UK confectionery
    'snickers', 'reese', 'reeses', 'topic bar', 'starbar', 'lion bar',
    'picnic bar', 'peanut m&m',

    // Snacks
    'trail mix', 'bombay mix', 'mixed nuts', 'nut bar', 'granola bar',

    // Processed foods
    'some veggie burgers', 'some energy bars', 'protein bar',
    'peanut cookie', 'peanut brittle', 'praline',

    // Oils and derivatives
    'arachis oil', 'groundnut oil',

    // Hidden sources
    'mole sauce', 'some chili', 'some soups',
  ],

  // ✅ SAFE - Does NOT Contain Peanuts
  safe: [
    // Tree nut butters (if no tree nut allergy)
    'almond butter', 'cashew butter', 'walnut butter', 'hazelnut spread',

    // Seed butters
    'sunflower seed butter', 'sunbutter', 'tahini', 'sesame seed butter',
    'pumpkin seed butter', 'soy nut butter',

    // Other legumes (safe for peanut allergy)
    'chickpea', 'lentil', 'bean', 'black bean', 'kidney bean',
    'peas', 'soy', 'soya', 'edamame',

    // Tree nuts (different allergen, but warn about cross-allergy)
    'almond', 'walnut', 'cashew', 'pecan', 'pistachio',
  ],
};

/**
 * TREE NUTS TAXONOMY
 * Based on UK FSA guidance and Anaphylaxis UK resources
 * @see 04-tree-nuts-allergen-taxonomy.md
 */
export const TREE_NUTS_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Tree Nuts
  unsafe: [
    // All tree nut species
    'almond', 'almonds', 'brazil nut', 'brazil nuts', 'cashew', 'cashews',
    'hazelnut', 'hazelnuts', 'filbert', 'macadamia', 'macadamia nut',
    'pecan', 'pecans', 'pistachio', 'pistachios', 'walnut', 'walnuts',
    'shea nut',

    // Nut butters and spreads
    'almond butter', 'cashew butter', 'hazelnut spread', 'nutella',
    'marzipan', 'almond paste', 'frangipane',

    // Nut flours and milks
    'almond flour', 'almond meal', 'hazelnut flour', 'cashew flour',
    'almond milk', 'cashew milk', 'hazelnut milk', 'walnut milk', 'macadamia milk',

    // UK confectionery
    'ferrero rocher', 'toblerone', 'after eight streusel',

    // Bakery items
    'bakewell tart', 'macaron', 'macaroon', 'amaretti', 'florentine',
    'baklava', 'almond croissant', 'pain aux amandes',

    // Savory dishes
    'pesto', 'pesto rosso', 'dukkah', 'nut roast', 'romesco sauce',

    // Desserts
    'nougat', 'praline', 'gianduja', 'turron',

    // Other
    'mortadella', 'nut-topped', 'nut-crusted',
  ],

  // ✅ SAFE - Does NOT Contain Tree Nuts
  safe: [
    // Not tree nuts despite confusing names
    'coconut', 'coconut milk', 'coconut oil', 'coconut flour', 'desiccated coconut',
    'nutmeg', 'ground nutmeg',
    'water chestnut', 'water chestnuts',
    'butternut squash', 'butternut',
    'chestnut', 'chestnuts', 'sweet chestnut', 'marron',

    // Pine nuts (seeds, usually safe but check)
    'pine nut', 'pine nuts',

    // Peanuts (different allergen)
    'peanut', 'peanuts', 'peanut butter', 'groundnut',

    // Seed alternatives
    'sunflower seed', 'pumpkin seed', 'sesame seed', 'chia seed', 'flax seed',
    'sunflower seed butter', 'tahini', 'pumpkin seed butter',
  ],
};

/**
 * EGGS TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 05-eggs-allergen-taxonomy.md
 */
export const EGGS_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Eggs
  unsafe: [
    // Direct egg products
    'egg', 'eggs', 'scrambled egg', 'fried egg', 'boiled egg', 'poached egg',
    'omelette', 'frittata', 'quiche', 'scotch egg',

    // Egg whites
    'egg white', 'meringue', 'pavlova', 'marshmallow', 'royal icing', 'macaron',

    // Egg yolks
    'egg yolk', 'hollandaise', 'bearnaise', 'creme brulee',

    // Egg derivatives
    'albumin', 'albumen', 'ovalbumin', 'ovomucoid', 'lysozyme', 'e1105',

    // Baked goods
    'yorkshire pudding', 'brioche', 'challah', 'french toast',

    // Pasta
    'fresh pasta', 'egg noodle', 'egg noodles',

    // Sauces
    'mayonnaise', 'mayo', 'hollandaise sauce', 'bearnaise sauce', 'caesar dressing',
    'aioli', 'tartar sauce',

    // Desserts
    'custard', 'creme caramel', 'mousse', 'souffle', 'lemon curd',
    'tiramisu', 'profiterole', 'eclair',

    // Processed foods
    'battered', 'fish finger', 'chicken nugget', 'fish cake',

    // UK products
    'jaffa cake', 'cadbury creme egg',
  ],

  // ✅ SAFE - Does NOT Contain Eggs
  safe: [
    // UK egg replacers
    'oggs aquafaba', 'orgran no-egg', 'crackd', 'vegan egg',

    // Vegan mayo
    'vegan mayonnaise', 'vegan mayo', 'hellmanns vegan', 'tesco plant chef mayo',

    // Natural egg alternatives
    'aquafaba', 'chickpea water', 'flax egg', 'chia egg',

    // Egg-free pasta
    'dried pasta', 'rice noodle', 'glass noodle',

    // Egg-free bread
    'most bread', 'ciabatta', 'sourdough', 'baguette', 'pitta bread',

    // Egg-free products
    'oreo', 'bourbon biscuit', 'hobnob original', 'digestive biscuit',

    // Lecithin (usually soy-based)
    'lecithin', 'soy lecithin', 'e322',
  ],
};

/**
 * FISH TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 06-fish-allergen-taxonomy.md
 */
export const FISH_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Fish
  unsafe: [
    // Common UK fish
    'fish', 'cod', 'haddock', 'plaice', 'sole', 'pollock', 'whiting',
    'salmon', 'tuna', 'mackerel', 'sardine', 'anchovy', 'anchovies',
    'herring', 'trout', 'kipper', 'whitebait',

    // Other fish
    'eel', 'swordfish', 'marlin', 'catfish', 'sea bass', 'sea bream',
    'halibut', 'turbot', 'basa', 'tilapia', 'monkfish',

    // Fish derivatives
    'fish sauce', 'fish oil', 'cod liver oil', 'fish stock', 'fish broth',
    'fish paste', 'fish cake', 'fish finger', 'fish pie',

    // Hidden fish sources (CRITICAL!)
    'worcestershire', 'worcestershire sauce', 'worcester sauce',
    'caesar dressing', 'anchovy paste', 'anchovy essence',
    'gentleman\'s relish', 'patum peperium',

    // Asian fish products
    'nam pla', 'nuoc mam', 'patis', 'fish tofu', 'fish ball',
    'katsuobushi', 'bonito', 'bonito flakes', 'dashi',

    // Processed products
    'surimi', 'imitation crab', 'taramasalata', 'caviar', 'fish roe',
    'cod roe', 'rollmop', 'kedgeree',

    // Other
    'isinglass',
  ],

  // ✅ SAFE - Does NOT Contain Fish
  safe: [
    // Fish-free sauces
    'soy sauce', 'tamari', 'coconut aminos',
    'henderson\'s relish', 'vegan worcestershire', 'vegan caesar dressing',

    // Shellfish (different allergen but warn about cross-contamination)
    'prawn', 'shrimp', 'crab', 'lobster', 'crayfish', 'langoustine', 'scampi',

    // Molluscs (different allergen)
    'mussel', 'oyster', 'clam', 'scallop', 'squid', 'octopus', 'whelk', 'winkle',

    // Omega-3 alternatives
    'algae oil', 'algal oil', 'flaxseed', 'chia seed', 'walnut',

    // Stock alternatives
    'vegetable stock', 'chicken stock', 'beef stock',
  ],
};

/**
 * SHELLFISH/CRUSTACEANS TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 07-shellfish-allergen-taxonomy.md
 */
export const SHELLFISH_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Crustaceans
  unsafe: [
    // All crustaceans
    'prawn', 'prawns', 'shrimp', 'king prawn', 'tiger prawn',
    'crab', 'brown crab', 'spider crab', 'crabmeat',
    'lobster', 'spiny lobster', 'rock lobster',
    'crayfish', 'crawfish',
    'langoustine', 'scampi', 'dublin bay prawn',
    'krill', 'barnacle',

    // Crustacean products
    'shrimp paste', 'prawn paste', 'belacan', 'terasi', 'kapi',
    'crab paste', 'lobster paste',
    'prawn cracker', 'prawn toast',

    // Stock and sauces
    'prawn stock', 'shrimp stock', 'crab stock', 'lobster stock',
    'shellfish stock', 'seafood stock', 'bisque', 'shellfish bisque',

    // Asian dishes
    'pad thai', 'tom yum', 'prawn curry', 'crab rangoon',

    // Other
    'shellfish flavoring', 'shellfish bouillon',
  ],

  // ✅ SAFE - Does NOT Contain Crustaceans
  safe: [
    // Fish (different allergen)
    'cod', 'haddock', 'salmon', 'tuna', 'fish', 'anchovy',

    // Molluscs (different allergen but may cross-react)
    'mussel', 'oyster', 'clam', 'scallop', 'squid', 'octopus',

    // Plant-based proteins
    'tofu', 'tempeh', 'seitan', 'chickpea', 'lentil', 'bean',
  ],
};

/**
 * SOY/SOYA TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 08-soy-allergen-taxonomy.md
 */
export const SOY_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Soy/Soya
  unsafe: [
    // Primary soy products
    'soy', 'soya', 'soybean', 'soya bean', 'edamame',
    'soy milk', 'soya milk', 'soy yogurt', 'soya yogurt',
    'soy cheese', 'soya cheese',

    // Soy protein products
    'tofu', 'bean curd', 'tempeh', 'natto', 'miso', 'miso paste',
    'soy protein', 'soya protein', 'soy protein isolate', 'textured vegetable protein',
    'tvp', 'soy mince', 'soya mince',

    // Soy flour
    'soy flour', 'soya flour', 'kinako',

    // Asian sauces
    'soy sauce', 'soya sauce', 'shoyu', 'tamari', 'teriyaki', 'teriyaki sauce',
    'hoisin', 'hoisin sauce', 'black bean sauce', 'ponzu', 'sweet soy sauce',

    // Hidden in processed foods
    'many sausages', 'many burgers', 'veggie burger',

    // Note: Soy in ~60% of UK manufactured foods
  ],

  // ✅ SAFE - Does NOT Contain Soy
  safe: [
    // Soy-free alternatives
    'coconut aminos', 'chickpea', 'lentil', 'pea protein',

    // Other legumes
    'bean', 'black bean', 'kidney bean', 'pinto bean', 'navy bean',
    'lentil', 'red lentil', 'green lentil', 'chickpea', 'pea',

    // Note: Soy lecithin (E322) highly refined but must be declared
    // Note: Refined soy oil may be tolerated by some
  ],
};

/**
 * MOLLUSCS TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 09-molluscs-allergen-taxonomy.md
 */
export const MOLLUSCS_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Molluscs
  unsafe: [
    // Cephalopods
    'squid', 'calamari', 'octopus', 'cuttlefish', 'nautilus',

    // Bivalves
    'mussel', 'mussels', 'blue mussel', 'green-lipped mussel',
    'oyster', 'oysters', 'pacific oyster', 'rock oyster',
    'clam', 'clams', 'razor clam', 'hard clam', 'soft clam',
    'scallop', 'scallops', 'king scallop', 'queen scallop',
    'cockle', 'cockles',

    // Gastropods
    'snail', 'snails', 'escargot', 'whelk', 'whelks', 'winkle', 'winkles',
    'periwinkle', 'limpet', 'abalone', 'paua', 'ormer',

    // Mollusc derivatives
    'squid ink', 'squid ink pasta', 'oyster sauce',

    // Dishes
    'paella', 'bouillabaisse', 'moules mariniere', 'clam chowder',

    // Processed
    'smoked mussels', 'pickled cockles', 'pickled whelks',
  ],

  // ✅ SAFE - Does NOT Contain Molluscs
  safe: [
    // Fish (different allergen)
    'cod', 'haddock', 'salmon', 'tuna', 'fish',

    // Crustaceans (different allergen but may cross-react)
    'prawn', 'shrimp', 'crab', 'lobster', 'langoustine',

    // Plant-based
    'tofu', 'tempeh', 'seitan', 'chickpea', 'lentil',
  ],
};

/**
 * SESAME TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 10-sesame-allergen-taxonomy.md
 */
export const SESAME_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Sesame
  unsafe: [
    // Direct sesame products
    'sesame', 'sesame seed', 'sesame seeds', 'sesame oil',
    'tahini', 'tahin', 'tehina', 'sesame paste', 'sesame butter',
    'halva', 'halvah', 'halawa', 'gomashio', 'goma',

    // Sesame-based foods
    'hummus', 'traditional hummus', 'baba ganoush',
    'tahini sauce', 'tahini dressing', 'dukkah', 'za\'atar',

    // Bread and baked goods
    'sesame bagel', 'sesame seed bun', 'sesame seed roll',
    'sesame breadstick', 'sesame cracker', 'sesame pretzel',
    'sesame naan', 'simit',

    // Asian cuisine
    'prawn toast', 'sesame chicken', 'sesame prawn',
    'sesame noodles', 'sesame ball',

    // Snacks
    'sesame snap', 'sesame bar',

    // Alternative names
    'benne', 'benne seed', 'gingelly', 'til', 'simsim',
  ],

  // ✅ SAFE - Does NOT Contain Sesame
  safe: [
    // Sesame-free alternatives
    'tahini-free hummus', 'sesame-free bread', 'sesame-free bagel',

    // Other seed alternatives
    'sunflower seed', 'sunflower seed butter', 'pumpkin seed',
    'chia seed', 'flax seed', 'poppy seed', 'hemp seed',
  ],
};

/**
 * MUSTARD TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 11-mustard-allergen-taxonomy.md
 */
export const MUSTARD_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Mustard
  unsafe: [
    // Mustard condiments
    'mustard', 'yellow mustard', 'dijon mustard', 'wholegrain mustard',
    'english mustard', 'colman\'s mustard', 'honey mustard',
    'french mustard', 'grain mustard',

    // Mustard seeds and derivatives
    'mustard seed', 'mustard seeds', 'mustard powder', 'mustard flour',
    'ground mustard', 'mustard oil',

    // Mustard greens
    'mustard greens', 'mustard leaves', 'sarson ka saag',

    // UK condiments and pickles (CRITICAL!)
    'piccalilli', 'branston pickle', 'ploughman\'s pickle',
    'sandwich pickle', 'mustard pickle',

    // Sauces and dressings
    'many salad dressings', 'vinaigrette', 'caesar dressing',
    'many mayonnaise', 'burger sauce', 'sandwich spread',
    'barbecue sauce', 'many bbq sauces',

    // Indian cuisine
    'curry powder', 'many curry pastes', 'mustard oil curry',

    // Other
    'hot dog relish', 'mustard relish',
  ],

  // ✅ SAFE - Does NOT Contain Mustard
  safe: [
    // Mustard-free condiments
    'ketchup', 'tomato ketchup', 'brown sauce',
    'some mayonnaise', 'mustard-free mayo',

    // Alternative spices
    'turmeric', 'curry leaves', 'fenugreek', 'cumin', 'coriander',
  ],
};

/**
 * LUPIN TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 12-lupin-allergen-taxonomy.md
 */
export const LUPIN_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Lupin
  unsafe: [
    // Direct lupin products
    'lupin', 'lupine', 'lupin bean', 'lupin beans', 'lupini bean', 'lupini beans',
    'lupin flour', 'lupine flour', 'lupin protein', 'lupin flakes',

    // Bread and baked goods
    'some european bread', 'some french bread', 'some italian bread',
    'some gluten-free bread', 'some continental pastries',

    // Pasta
    'some gluten-free pasta', 'high-protein pasta', 'low-carb pasta', 'keto pasta',

    // Vegan/vegetarian products
    'some vegan burgers', 'some vegan sausages', 'lupreme',
    'some vegan meat substitutes',

    // Protein products
    'some protein bars', 'some protein snacks', 'some plant-based protein',
  ],

  // ✅ SAFE - Does NOT Contain Lupin
  safe: [
    // Most UK bread (lupin more common in EU)
    'most uk bread', 'most british bread',

    // Other legumes
    'chickpea', 'lentil', 'bean', 'pea', 'soy', 'soya',

    // Alternative flours
    'chickpea flour', 'gram flour', 'besan', 'rice flour',
    'corn flour', 'almond flour', 'coconut flour',

    // Note: Peanuts are separate allergen but 5-37% cross-reactivity
  ],
};

/**
 * CELERY TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 13-celery-allergen-taxonomy.md
 */
export const CELERY_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Celery
  unsafe: [
    // All parts of celery plant
    'celery', 'celery stalks', 'celery stalk', 'celery leaves', 'celery hearts',
    'celeriac', 'celery root', 'celery knob',

    // Celery derivatives
    'celery seed', 'celery seeds', 'celery salt', 'celery powder',
    'celery extract', 'celery flavouring', 'celery seasoning',

    // UK stock cubes (CRITICAL - almost all contain celery!)
    'knorr vegetable stock', 'oxo vegetable stock', 'tesco vegetable stock',
    'kallo vegetable stock', 'marigold bouillon',
    'most vegetable stock', 'vegetable stock cube',

    // Soups and stews
    'cream of celery soup', 'celery soup', 'vegetable soup',
    'minestrone', 'chicken soup', 'french onion soup',

    // Dishes
    'coleslaw', 'waldorf salad', 'stuffing', 'mirepoix',
    'bloody mary',

    // Other
    'celery juice',
  ],

  // ✅ SAFE - Does NOT Contain Celery
  safe: [
    // Celery-free stock
    'celery-free stock', 'chicken stock', 'beef stock',
    'fish stock', 'homemade stock without celery',

    // Alternative vegetables
    'carrot', 'parsnip', 'leek', 'onion', 'fennel',
  ],
};

/**
 * SULPHITES TAXONOMY
 * Based on UK FSA guidance and Allergy UK resources
 * @see 14-sulphites-allergen-taxonomy.md
 */
export const SULPHITES_TAXONOMY: AllergenTaxonomy = {
  // ❌ UNSAFE - Contains Sulphites
  unsafe: [
    // E numbers (all sulphites)
    'e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228',
    'sulphur dioxide', 'sulfur dioxide', 'sulphite', 'sulfite',
    'sodium sulphite', 'sodium bisulphite', 'sodium metabisulphite',
    'potassium metabisulphite', 'calcium sulphite',

    // Alcoholic drinks (very high levels)
    'wine', 'red wine', 'white wine', 'rose wine', 'champagne', 'prosecco',
    'port', 'sherry', 'vermouth', 'wine vinegar',
    'most beer', 'most cider',

    // Dried fruits (very high levels)
    'dried apricot', 'dried apricots', 'raisin', 'raisins', 'sultana', 'sultanas',
    'dried apple', 'dried mango', 'dried pineapple', 'prune', 'prunes',
    'dried cranberry', 'crystallised fruit', 'glace cherry', 'maraschino cherry',

    // Dehydrated vegetables
    'instant mash', 'potato flakes', 'dehydrated potato',

    // Fruit products
    'fruit juice', 'cordial', 'squash', 'fruit concentrate',

    // Other
    'some pickled foods', 'some sausages', 'some processed meats',
  ],

  // ✅ SAFE - Does NOT Contain Sulphites
  safe: [
    // Fresh produce
    'fresh fruit', 'fresh vegetables', 'fresh meat', 'fresh fish',

    // Alternatives
    'unsulphured dried fruit', 'organic dried fruit', 'sulphite-free wine',

    // Note: Sulphites must be declared if >10mg/kg in UK
    // Note: Particularly dangerous for asthmatics
  ],
};

/**
 * Export all taxonomies indexed by allergen ID
 * IDs match those in UK_ALLERGENS from allergen-detector.ts
 */
export const ALLERGEN_TAXONOMIES: Record<string, AllergenTaxonomy> = {
  gluten: GLUTEN_TAXONOMY,
  milk: DAIRY_TAXONOMY,
  peanuts: PEANUTS_TAXONOMY,
  tree_nuts: TREE_NUTS_TAXONOMY,
  eggs: EGGS_TAXONOMY,
  fish: FISH_TAXONOMY,
  shellfish: SHELLFISH_TAXONOMY,
  soy: SOY_TAXONOMY,
  molluscs: MOLLUSCS_TAXONOMY,
  sesame: SESAME_TAXONOMY,
  mustard: MUSTARD_TAXONOMY,
  lupin: LUPIN_TAXONOMY,
  celery: CELERY_TAXONOMY,
  sulphites: SULPHITES_TAXONOMY,
};
