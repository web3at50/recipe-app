'use client';

import { useState } from 'react';
import type { Recipe } from '@/types/recipe';
import { RecipeCard } from './recipe-card';
import { PublishModal } from './publish-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock } from 'lucide-react';

interface Props {
  initialRecipes: Recipe[];
}

export function RecipeReviewClient({ initialRecipes }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Calculate stats
  const publishedCount = recipes.filter((r) => r.is_public).length;
  const unpublishedCount = recipes.filter((r) => !r.is_public).length;

  // Handle publish success
  const handlePublishSuccess = (updatedRecipe: Recipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
    );
    setIsPublishModalOpen(false);
    setSelectedRecipe(null);
  };

  // Handle unpublish
  const handleUnpublish = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/publish`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish recipe');
      }

      const { recipe: updatedRecipe } = await response.json();

      setRecipes((prev) =>
        prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
      );
    } catch (error) {
      console.error('Error unpublishing recipe:', error);
      alert('Failed to unpublish recipe');
    }
  };

  // Handle delete
  const handleDelete = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{recipes.length}</p>
                <p className="text-sm text-muted-foreground">Total Recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{unpublishedCount}</p>
                <p className="text-sm text-muted-foreground">
                  Awaiting Review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">
            All ({recipes.length})
          </TabsTrigger>
          <TabsTrigger value="unpublished">
            Unpublished ({unpublishedCount})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedCount})
          </TabsTrigger>
        </TabsList>

        {/* All Recipes */}
        <TabsContent value="all" className="mt-6">
          {recipes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No recipes found. Create recipes using the{' '}
                  <a href="/create-recipe" className="text-primary underline">
                    recipe generator
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPublish={() => {
                    setSelectedRecipe(recipe);
                    setIsPublishModalOpen(true);
                  }}
                  onUnpublish={() => handleUnpublish(recipe.id)}
                  onDelete={() => handleDelete(recipe.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Unpublished Recipes */}
        <TabsContent value="unpublished" className="mt-6">
          {unpublishedCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No unpublished recipes. All recipes have been published!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes
                .filter((r) => !r.is_public)
                .map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPublish={() => {
                      setSelectedRecipe(recipe);
                      setIsPublishModalOpen(true);
                    }}
                    onUnpublish={() => handleUnpublish(recipe.id)}
                    onDelete={() => handleDelete(recipe.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Published Recipes */}
        <TabsContent value="published" className="mt-6">
          {publishedCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No published recipes yet. Review and publish recipes from the
                  Unpublished tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes
                .filter((r) => r.is_public)
                .map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPublish={() => {
                      setSelectedRecipe(recipe);
                      setIsPublishModalOpen(true);
                    }}
                    onUnpublish={() => handleUnpublish(recipe.id)}
                    onDelete={() => handleDelete(recipe.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Publish Modal */}
      {selectedRecipe && (
        <PublishModal
          recipe={selectedRecipe}
          open={isPublishModalOpen}
          onClose={() => {
            setIsPublishModalOpen(false);
            setSelectedRecipe(null);
          }}
          onSuccess={handlePublishSuccess}
        />
      )}
    </>
  );
}
