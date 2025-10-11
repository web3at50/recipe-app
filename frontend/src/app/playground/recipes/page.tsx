'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, ChefHat, Sparkles } from 'lucide-react';
import { getPlaygroundRecipes, type PlaygroundRecipe } from '@/lib/session-storage';

export default function PlaygroundRecipesPage() {
  const [recipes, setRecipes] = useState<PlaygroundRecipe[]>([]);

  useEffect(() => {
    setRecipes(getPlaygroundRecipes());
  }, []);

  if (recipes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-6 py-16">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">No Recipes Yet</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Generate your first recipe to get started. All your playground recipes will appear here.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/playground">
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your First Recipe
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            My Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in your playground session
          </p>
        </div>
        <Button asChild>
          <Link href="/playground">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Another
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link key={recipe.id} href={`/playground/recipes/${recipe.id}`}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{recipe.name}</CardTitle>
                  <ChefHat className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                {recipe.description && (
                  <CardDescription className="line-clamp-2">
                    {recipe.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {recipe.prep_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prep_time + (recipe.cook_time || 0)}m</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings}</span>
                  </div>
                  {recipe.difficulty && (
                    <span className="capitalize text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {recipe.difficulty}
                    </span>
                  )}
                </div>

                {recipe.cuisine && (
                  <div className="text-xs text-muted-foreground">
                    {recipe.cuisine}
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer CTA for persistence */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-semibold text-lg">Love these recipes?</h3>
            <p className="text-sm text-muted-foreground">
              Sign up to save them permanently and access from any device
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
