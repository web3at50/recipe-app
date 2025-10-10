import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Ingredient } from '@/types/recipe';
import { normalizeUnit } from '@/lib/units';

// Type for meal plan item with recipe
interface MealPlanItemWithRecipe {
  id: string;
  recipe?: {
    ingredients: Ingredient[];
  };
  recipes?: {
    ingredients: Ingredient[];
  };
}

// POST /api/shopping-lists/generate - Generate shopping list from meal plan
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meal_plan_id } = body;

    if (!meal_plan_id) {
      return NextResponse.json(
        { error: 'meal_plan_id is required' },
        { status: 400 }
      );
    }

    // Verify meal plan ownership
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select('id, start_date, end_date')
      .eq('id', meal_plan_id)
      .eq('user_id', user.id)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Fetch all meal plan items with their recipes
    const { data: mealPlanItems, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipes (
          id,
          name,
          ingredients
        )
      `)
      .eq('meal_plan_id', meal_plan_id);

    if (itemsError) {
      console.error('Error fetching meal plan items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    if (!mealPlanItems || mealPlanItems.length === 0) {
      return NextResponse.json(
        { error: 'No recipes in meal plan' },
        { status: 400 }
      );
    }

    // Extract and consolidate ingredients
    const consolidatedIngredients = consolidateIngredients(mealPlanItems);

    // Create shopping list
    const { data: shoppingList, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        meal_plan_id: meal_plan_id,
        name: `Shopping List - Week of ${mealPlan.start_date}`,
        status: 'active',
      })
      .select()
      .single();

    if (listError) {
      console.error('Error creating shopping list:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // Create shopping list items (batch insert)
    if (consolidatedIngredients.length > 0) {
      const items = consolidatedIngredients.map(ing => {
        // Combine quantity and unit into a single display string
        let quantityDisplay = '';
        if (ing.quantity && ing.unit) {
          quantityDisplay = `${ing.quantity}${ing.unit}`;
        } else if (ing.quantity) {
          quantityDisplay = ing.quantity;
        } else if (ing.unit) {
          quantityDisplay = ing.unit;
        }

        return {
          shopping_list_id: shoppingList.id,
          item_name: ing.item,
          quantity: quantityDisplay,
          category: assignCategory(ing.item),
          checked: false,
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('shopping_list_items')
        .insert(items);

      if (itemsInsertError) {
        console.error('Error inserting shopping list items:', itemsInsertError);
        // Clean up - delete the list if items failed
        await supabase
          .from('shopping_lists')
          .delete()
          .eq('id', shoppingList.id);

        return NextResponse.json({ error: itemsInsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      shopping_list_id: shoppingList.id,
      items_count: consolidatedIngredients.length
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/shopping-lists/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to consolidate ingredients
function consolidateIngredients(mealPlanItems: MealPlanItemWithRecipe[]): Ingredient[] {
  const ingredientMap = new Map<string, Ingredient>();

  mealPlanItems.forEach(item => {
    // Access nested recipe data
    const recipe = item.recipes || item.recipe;
    if (!recipe || !recipe.ingredients) return;

    const ingredients = recipe.ingredients as Ingredient[];

    ingredients.forEach(ing => {
      const normalizedName = normalizeItemName(ing.item);

      if (ingredientMap.has(normalizedName)) {
        // Ingredient already exists - combine quantities
        const existing = ingredientMap.get(normalizedName)!;
        const combined = combineQuantities(existing, ing);
        ingredientMap.set(normalizedName, combined);
      } else {
        // New ingredient
        ingredientMap.set(normalizedName, { ...ing });
      }
    });
  });

  return Array.from(ingredientMap.values());
}

// Normalize item names for consolidation (lowercase, remove plural 's')
function normalizeItemName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Simple plural handling - remove trailing 's' if present
  // (This is MVP-level, can be enhanced with proper pluralization library later)
  if (normalized.endsWith('es')) {
    // tomatoes -> tomato
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    // onions -> onion (but not 'grass' -> 'gras')
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

// Combine quantities of same ingredient
function combineQuantities(ing1: Ingredient, ing2: Ingredient): Ingredient {
  // If either has no quantity, just combine the text
  if (!ing1.quantity || !ing2.quantity) {
    return {
      item: ing1.item, // Use original name from first instance
      quantity: [ing1.quantity, ing2.quantity].filter(Boolean).join(' + '),
      unit: ing1.unit || ing2.unit,
      notes: [ing1.notes, ing2.notes].filter(Boolean).join(', '),
    };
  }

  // Try to parse as numbers
  const num1 = parseFloat(ing1.quantity);
  const num2 = parseFloat(ing2.quantity);

  // Normalize units for comparison (handles variations like 'grams' -> 'g')
  const normalizedUnit1 = normalizeUnit(ing1.unit);
  const normalizedUnit2 = normalizeUnit(ing2.unit);

  // If both are valid numbers with same normalized unit (or no unit), add them
  if (!isNaN(num1) && !isNaN(num2) && (!normalizedUnit1 || !normalizedUnit2 || normalizedUnit1 === normalizedUnit2)) {
    const sum = num1 + num2;
    return {
      item: ing1.item,
      quantity: sum.toString(),
      unit: ing1.unit || ing2.unit, // Keep original unit format
      notes: [ing1.notes, ing2.notes].filter(Boolean).join(', '),
    };
  }

  // Different units or non-numeric - list separately
  return {
    item: ing1.item,
    quantity: `${ing1.quantity} + ${ing2.quantity}`,
    unit: ing1.unit && ing2.unit ? `${ing1.unit} + ${ing2.unit}` : (ing1.unit || ing2.unit),
    notes: [ing1.notes, ing2.notes].filter(Boolean).join(', '),
  };
}

// Assign category based on ingredient name (MVP-level keyword matching)
function assignCategory(itemName: string): string {
  const name = itemName.toLowerCase();

  // Produce
  const produce = ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'lettuce', 'pepper', 'cucumber', 'broccoli', 'spinach', 'mushroom', 'celery', 'cabbage', 'zucchini', 'eggplant', 'avocado', 'apple', 'banana', 'orange', 'lemon', 'lime'];
  if (produce.some(p => name.includes(p))) return 'Produce';

  // Meat & Seafood
  const meat = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'bacon', 'sausage', 'ham'];
  if (meat.some(m => name.includes(m))) return 'Meat & Seafood';

  // Dairy
  const dairy = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'sour cream', 'cheddar', 'mozzarella', 'parmesan'];
  if (dairy.some(d => name.includes(d))) return 'Dairy';

  // Pantry
  const pantry = ['flour', 'sugar', 'salt', 'pepper', 'rice', 'pasta', 'oil', 'olive oil', 'vinegar', 'sauce', 'stock', 'broth', 'spice', 'herb', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'cinnamon'];
  if (pantry.some(p => name.includes(p))) return 'Pantry';

  // Frozen
  const frozen = ['frozen', 'ice', 'pea'];
  if (frozen.some(f => name.includes(f))) return 'Frozen';

  // Bakery
  const bakery = ['bread', 'roll', 'bun', 'bagel', 'croissant', 'pastry', 'cake'];
  if (bakery.some(b => name.includes(b))) return 'Bakery';

  // Beverages
  const beverages = ['water', 'juice', 'soda', 'tea', 'coffee', 'beer', 'wine'];
  if (beverages.some(b => name.includes(b))) return 'Beverages';

  // Default
  return 'Other';
}
