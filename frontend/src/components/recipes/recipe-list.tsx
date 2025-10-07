'use client';

import { useState } from 'react';
import { RecipeCard } from './recipe-card';
import type { Recipe } from '@/types/recipe';

interface RecipeListProps {
  initialRecipes: Recipe[];
}

export function RecipeList({ initialRecipes }: RecipeListProps) {
  const [recipes, setRecipes] = useState(initialRecipes);

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      // Update local state
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === id ? { ...recipe, is_favorite: isFavorite } : recipe
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No recipes yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first recipe to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
