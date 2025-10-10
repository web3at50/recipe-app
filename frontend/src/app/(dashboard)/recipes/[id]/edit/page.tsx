'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { RecipeFormData, Recipe } from '@/types/recipe';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch recipe');
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Failed to load recipe');
        router.push('/recipes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipe();
  }, [id, router]);

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update recipe');
      }

      router.push(`/recipes/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to update recipe');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <p>Loading...</p>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href={`/recipes/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Recipe
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <p className="text-muted-foreground mt-1">
          Update your recipe details
        </p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        defaultValues={recipe}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
