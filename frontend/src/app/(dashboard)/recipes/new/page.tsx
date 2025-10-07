'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { RecipeFormData } from '@/types/recipe';

export default function NewRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create recipe');
      }

      const { recipe } = await response.json();
      router.push(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to create recipe');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href="/recipes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Recipe</h1>
        <p className="text-muted-foreground mt-1">
          Add a new recipe to your collection
        </p>
      </div>

      <RecipeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
