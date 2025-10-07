import Link from 'next/link';
import { Clock, Users, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

export function RecipeCard({ recipe, onToggleFavorite }: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="aspect-video bg-muted relative">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
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
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
              className="flex-shrink-0"
            >
              <Heart
                className={`h-5 w-5 ${
                  recipe.is_favorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          )}
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
