import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';
import { detectAllergensInIngredients, UK_ALLERGENS } from '@/lib/allergen-detector';
import { generateRecipeFAQs } from '@/lib/faq-generator';
import { recipeCreationSchema } from '@/lib/validation/recipe-schemas';
import { sanitizeRecipeInput, containsSuspiciousPatterns } from '@/lib/security/sanitization';
import { rateLimitMiddleware, getRequestIP } from '@/lib/security/rate-limit';

// GET /api/recipes - List all user's recipes (JSONB schema)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const favorite = searchParams.get('favorite') === 'true';
    const cuisine = searchParams.get('cuisine');
    const tag = searchParams.get('tag');

    // Build query (single table, no joins!)
    let query = supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (favorite) {
      query = query.eq('is_favorite', true);
    }
    if (cuisine) {
      query = query.eq('cuisine', cuisine);
    }
    if (tag) {
      query = query.contains('tags', [tag]); // Array contains operator
    }

    const { data: recipes, error, count } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      recipes: recipes || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recipes - Create a new recipe (JSONB schema - single insert!)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting: 20 recipes per hour per user
    const rateLimitResult = await rateLimitMiddleware(request, userId, {
      maxRequests: 20,
      windowSeconds: 3600, // 1 hour
      identifier: 'recipe-create',
    });

    if (rateLimitResult) return rateLimitResult;

    const supabase = await createClient();

    const body: RecipeFormData = await request.json();

    // Validate input with Zod schema
    const validationResult = recipeCreationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Check for suspicious XSS patterns (additional security layer)
    const textToCheck = [
      body.name,
      body.description,
      ...body.ingredients.map(i => `${i.item} ${i.notes || ''}`),
      ...body.instructions.map(i => i.instruction),
    ].join(' ');

    if (containsSuspiciousPatterns(textToCheck)) {
      return NextResponse.json(
        {
          error: 'Invalid input detected',
          message: 'Your input contains potentially unsafe content. Please remove any HTML tags or special characters.',
        },
        { status: 400 }
      );
    }

    // Sanitize all user inputs to prevent XSS
    const sanitizedBody = sanitizeRecipeInput(body as RecipeFormData & { [key: string]: unknown });

    // Add step numbers to instructions if not provided
    const instructions = sanitizedBody.instructions.map((inst, index) => ({
      step: inst.step || index + 1,
      instruction: inst.instruction
    }));

    // Auto-detect allergens from ingredients (server-side validation)
    const allAllergenIds = UK_ALLERGENS.map(a => a.id);
    const detectedMatches = detectAllergensInIngredients(
      sanitizedBody.ingredients,
      allAllergenIds
    );

    // Get unique allergen IDs
    const detectedAllergens = [...new Set(detectedMatches.map(m => m.allergen))];

    // Merge with provided allergens (if any)
    const finalAllergens = [
      ...new Set([...(sanitizedBody.allergens || []), ...detectedAllergens])
    ];

    // Map difficulty values: beginner -> easy, intermediate -> medium, advanced -> hard
    const difficultyMapping: Record<string, 'easy' | 'medium' | 'hard'> = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard',
    };
    const mappedDifficulty = sanitizedBody.difficulty
      ? difficultyMapping[sanitizedBody.difficulty as string]
      : undefined;

    // Generate comprehensive FAQs for LLM optimization
    const generatedFAQs = generateRecipeFAQs({
      name: sanitizedBody.name,
      allergens: finalAllergens,
      tags: sanitizedBody.tags,
      prep_time: sanitizedBody.prep_time as number | undefined,
      cook_time: sanitizedBody.cook_time as number | undefined,
      difficulty: mappedDifficulty,
    });

    // Create recipe (everything in one insert!)
    const { data: recipe, error: recipeError} = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        name: sanitizedBody.name,
        description: sanitizedBody.description || null,
        cuisine: sanitizedBody.cuisine || null,
        prep_time: (sanitizedBody.prep_time as number | undefined) || null,
        cook_time: (sanitizedBody.cook_time as number | undefined) || null,
        servings: sanitizedBody.servings as number,
        difficulty: (sanitizedBody.difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined) || null,
        source: (sanitizedBody as { source?: string }).source || 'user_created', // Accept source from body or default
        ai_model: (sanitizedBody as { ai_model?: string }).ai_model || null, // Store AI model if provided
        ingredients: sanitizedBody.ingredients, // JSONB array (sanitized)
        instructions: instructions, // JSONB array (sanitized)
        tags: sanitizedBody.tags || [], // Simple array (sanitized)
        allergens: finalAllergens, // Auto-detected + provided allergens
        faqs: generatedFAQs, // FAQ for LLM optimization
        nutrition: (sanitizedBody.nutrition as { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number } | undefined) || null, // JSONB object
        cost_per_serving: (sanitizedBody.cost_per_serving as number | undefined) || null,
        image_url: (sanitizedBody.image_url as string | undefined) || null,
      })
      .select()
      .single();

    if (recipeError) {
      console.error('Error creating recipe:', recipeError);
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
