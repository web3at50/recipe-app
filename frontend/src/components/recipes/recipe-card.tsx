'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Heart, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  userAllergens?: string[]; // Optional: pass from parent if available
}

export function RecipeCard({ recipe, onToggleFavorite, onDelete, userAllergens }: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  // Check if recipe contains user allergens
  const hasAllergenConflict = userAllergens && userAllergens.length > 0 && recipe.ingredients
    ? recipe.ingredients.some((ingredient) => {
        const ingredientText = `${ingredient.item} ${ingredient.notes || ''}`.toLowerCase();
        return userAllergens.some((allergen) => ingredientText.includes(allergen.toLowerCase()));
      })
    : false;

  // Get cuisine-based gradient and emoji
  const getCuisineVisuals = (cuisine: string | null) => {
    const visuals: Record<string, { gradient: string; emoji: string }> = {
      'British': { gradient: 'from-red-500 via-blue-500 to-slate-200', emoji: '🇬🇧' },
      'Italian': { gradient: 'from-green-600 via-white to-red-600', emoji: '🍝' },
      'Indian': { gradient: 'from-orange-500 via-yellow-400 to-green-500', emoji: '🍛' },
      'Chinese': { gradient: 'from-red-600 via-yellow-500 to-red-700', emoji: '🥡' },
      'Mexican': { gradient: 'from-green-600 via-white to-red-600', emoji: '🌮' },
      'Thai': { gradient: 'from-purple-500 via-pink-400 to-yellow-400', emoji: '🍜' },
      'French': { gradient: 'from-blue-600 via-white to-red-600', emoji: '🥐' },
      'Greek': { gradient: 'from-blue-500 via-white to-blue-400', emoji: '🫒' },
      'Spanish': { gradient: 'from-yellow-500 via-red-600 to-yellow-500', emoji: '🥘' },
      'Japanese': { gradient: 'from-red-600 via-white to-red-600', emoji: '🍱' },
      'Middle Eastern': { gradient: 'from-amber-600 via-yellow-500 to-amber-700', emoji: '🧆' },
      'American': { gradient: 'from-blue-600 via-red-600 to-white', emoji: '🍔' },
      'Caribbean': { gradient: 'from-green-500 via-yellow-400 to-red-500', emoji: '🌴' },
    };
    return visuals[cuisine || ''] || { gradient: 'from-slate-600 via-slate-500 to-slate-400', emoji: '🍽️' };
  };

  const { gradient, emoji } = getCuisineVisuals(recipe.cuisine);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="aspect-video relative">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
              <span className="text-6xl">{emoji}</span>
            </div>
          )}
          {/* Allergen Warning Badge */}
          {hasAllergenConflict && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Allergen
            </div>
          )}
        </div>
      </Link>

      <CardHeader>
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold line-clamp-2 hover:underline">
            {recipe.name}
          </h3>
        </Link>
      </CardHeader>

      <CardContent>
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 text-sm text-muted-foreground flex-wrap">
        {/* Left side: Time + Servings */}
        <div className="flex items-center gap-4">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Right side: Heart + Trash */}
        {(onToggleFavorite || onDelete) && (
          <div className="flex items-center gap-1 ml-auto">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    recipe.is_favorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-red-500"
                onClick={() => onDelete(recipe.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
