/**
 * AI Usage Tracking Library
 * Tracks token usage, costs, and performance for recipe generation
 *
 * Created: 2025-10-17
 * Token properties verified from actual API responses
 */

import { createClient } from '@/lib/supabase/server';

export interface UsageLogEntry {
  userId?: string;
  sessionId: string;
  requestId: string;
  modelProvider: 'openai' | 'claude' | 'gemini' | 'grok';
  modelName: string;
  modelVersion: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  complexityScore?: number;
  recipeGenerated: boolean;
  responseTimeMs: number;
  ingredientCount?: number;
  allergenCount?: number;
  dietaryRestrictionCount?: number;
  errorMessage?: string;
}

// VERIFIED pricing from AI_Model_Pricing_Tracker.md (2025-10-17)
// Updated with actual costs per million tokens
const MODEL_PRICING = {
  // OpenAI
  'gpt-4.1-2025-04-14': {
    input: 2.00,
    output: 8.00,
    cached: 0.50,
  },
  'gpt-4.1-mini-2025-04-14': {
    input: 0.40,
    output: 1.60,
    cached: 0.10,
  },
  // Claude
  'claude-haiku-4-5-20251001': {
    input: 1.00,
    output: 5.00,
    cached: 0.10,
  },
  'claude-sonnet-4-5-20250929': {
    input: 3.00,
    output: 15.00,
    cached: 0.30,
  },
  // Gemini
  'gemini-2.0-flash-exp': {
    input: 0.30,
    output: 2.50,
    cached: 0.03,
  },
  'gemini-2.5-flash': {
    input: 0.30,
    output: 2.50,
    cached: 0.03,
  },
  // Grok
  'grok-4-fast-reasoning': {
    input: 0.20,
    output: 0.50,
    cached: 0.05,
  },
} as const;

/**
 * Log AI usage to database for cost tracking and analytics
 * Non-blocking - failures won't break recipe generation
 */
export async function logAIUsage(entry: UsageLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    // Get pricing for this model
    const pricing = MODEL_PRICING[entry.modelName as keyof typeof MODEL_PRICING];

    if (!pricing) {
      console.warn(`⚠️ No pricing data for model: ${entry.modelName}`);
      // Still log the entry with zero cost for tracking
      await supabase.from('ai_usage_logs').insert({
        user_id: entry.userId || null,
        session_id: entry.sessionId,
        request_id: entry.requestId,
        model_provider: entry.modelProvider,
        model_name: entry.modelName,
        model_version: entry.modelVersion,
        input_tokens: entry.inputTokens,
        output_tokens: entry.outputTokens,
        cached_tokens: entry.cachedTokens || 0,
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        cached_cost_per_million: 0,
        calculated_cost: 0,
        complexity_score: entry.complexityScore,
        recipe_generated: entry.recipeGenerated,
        error_message: entry.errorMessage,
        response_time_ms: entry.responseTimeMs,
        ingredient_count: entry.ingredientCount,
        allergen_count: entry.allergenCount,
        dietary_restriction_count: entry.dietaryRestrictionCount,
      });
      return;
    }

    // Calculate cost (per million tokens)
    const inputCost = (entry.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (entry.outputTokens / 1_000_000) * pricing.output;
    const cachedCost = entry.cachedTokens
      ? (entry.cachedTokens / 1_000_000) * pricing.cached
      : 0;

    const totalCost = inputCost + outputCost + cachedCost;

    // Log to database
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: entry.userId || null,
      session_id: entry.sessionId,
      request_id: entry.requestId,
      model_provider: entry.modelProvider,
      model_name: entry.modelName,
      model_version: entry.modelVersion,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      cached_tokens: entry.cachedTokens || 0,
      input_cost_per_million: pricing.input,
      output_cost_per_million: pricing.output,
      cached_cost_per_million: pricing.cached,
      calculated_cost: totalCost,
      complexity_score: entry.complexityScore,
      recipe_generated: entry.recipeGenerated,
      error_message: entry.errorMessage,
      response_time_ms: entry.responseTimeMs,
      ingredient_count: entry.ingredientCount,
      allergen_count: entry.allergenCount,
      dietary_restriction_count: entry.dietaryRestrictionCount,
    });

    if (error) {
      console.error('❌ Failed to log AI usage to database:', error);
    } else {
      const totalTokens = entry.inputTokens + entry.outputTokens;
      const status = entry.recipeGenerated ? '✅' : '❌';
      console.log(`${status} AI Usage: ${entry.modelName} | ${totalTokens} tokens | $${totalCost.toFixed(6)} | ${entry.responseTimeMs}ms`);
    }
  } catch (error) {
    // Don't throw - logging failures should never break recipe generation
    console.error('❌ Exception in logAIUsage:', error);
  }
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Generate session ID for anonymous user tracking
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `sess_${timestamp}_${random}`;
}

/**
 * Calculate estimated cost for a given token count and model
 * Useful for forecasting before API call
 */
export function estimateCost(
  modelName: keyof typeof MODEL_PRICING,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const pricing = MODEL_PRICING[modelName];
  if (!pricing) {
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const cachedCost = (cachedTokens / 1_000_000) * pricing.cached;

  return inputCost + outputCost + cachedCost;
}
