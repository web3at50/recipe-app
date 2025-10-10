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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="aspect-video bg-muted relative">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
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
        <div className="flex items-start justify-between gap-2">
          <Link href={`/recipes/${recipe.id}`} className="flex-1">
            <h3 className="font-semibold line-clamp-2 hover:underline">
              {recipe.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    recipe.is_favorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(recipe.id)}
                className="hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
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
      </CardFooter>
    </Card>
  );
}
