/**
 * Kitchen Styles - Friendly names for AI models
 * Maps technical model IDs to user-friendly style names
 */

export type ModelId = 'model_1' | 'model_2' | 'model_3' | 'model_4';

export interface ModelStyle {
  name: string;
  icon: string;
  tagline: string;
  description: string;
}

export const MODEL_STYLES: Record<ModelId, ModelStyle> = {
  model_1: {
    name: 'Balanced',
    icon: '⚖️',
    tagline: 'Well-rounded recipes for everyday cooking',
    description: 'A reliable all-rounder that adapts to your needs',
  },
  model_2: {
    name: 'Guided',
    icon: '🧭',
    tagline: 'Step-by-step with helpful tips',
    description: 'Perfect for learning new techniques with detailed explanations',
  },
  model_3: {
    name: 'Streamlined',
    icon: '⚡',
    tagline: 'Fast, no-fuss recipes',
    description: 'Quick and efficient recipes without unnecessary extras',
  },
  model_4: {
    name: 'Essential',
    icon: '🎯',
    tagline: 'Core steps only, nothing extra',
    description: 'Clean, focused instructions for confident cooks',
  },
};

/**
 * Get the friendly style name for a model ID
 */
export function getStyleName(modelId: ModelId | string): string {
  if (modelId in MODEL_STYLES) {
    return MODEL_STYLES[modelId as ModelId].name;
  }
  return modelId;
}

/**
 * Get the style icon for a model ID
 */
export function getStyleIcon(modelId: ModelId | string): string {
  if (modelId in MODEL_STYLES) {
    return MODEL_STYLES[modelId as ModelId].icon;
  }
  return '🍳';
}

/**
 * Get the full style info for a model ID
 */
export function getStyleInfo(modelId: ModelId | string): ModelStyle | null {
  if (modelId in MODEL_STYLES) {
    return MODEL_STYLES[modelId as ModelId];
  }
  return null;
}

/**
 * Get formatted display text (icon + name)
 */
export function getStyleDisplay(modelId: ModelId | string): string {
  const info = getStyleInfo(modelId);
  if (info) {
    return `${info.icon} ${info.name}`;
  }
  return modelId;
}
