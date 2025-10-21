'use client';

import type { Recipe } from '@/types/recipe';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import { MODEL_STYLES } from '@/lib/model-styles';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  recipe: Recipe;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

export function RecipeCard({ recipe, onPublish, onUnpublish, onDelete }: Props) {
  const isPublished = recipe.is_public;
  const modelName = recipe.ai_model ? MODEL_STYLES[recipe.ai_model]?.name : 'Unknown';
  const modelIcon = recipe.ai_model ? MODEL_STYLES[recipe.ai_model]?.icon : '🤖';

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Published
              </>
            ) : (
              'Unpublished'
            )}
          </Badge>
          {recipe.ai_model && (
            <Badge variant="outline" className="text-xs">
              {modelIcon} {modelName}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-tight">{recipe.name}</CardTitle>
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {recipe.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Image Preview */}
        {recipe.image_url ? (
          <div className="relative w-full h-32 rounded-md overflow-hidden bg-muted">
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        {/* SEO Info (if published) */}
        {isPublished && (
          <div className="space-y-1 text-xs">
            {recipe.seo_slug && (
              <p className="text-muted-foreground">
                <span className="font-medium">URL:</span>{' '}
                <code className="bg-muted px-1 py-0.5 rounded">
                  /recipes/{recipe.category}/{recipe.seo_slug}
                </code>
              </p>
            )}
            {recipe.published_at && (
              <p className="text-muted-foreground">
                <span className="font-medium">Published:</span>{' '}
                {new Date(recipe.published_at).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        {/* Primary Actions */}
        <div className="flex gap-2 w-full">
          {isPublished ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onPublish}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link
                  href={`/recipes/${recipe.category}/${recipe.seo_slug}`}
                  target="_blank"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onPublish}
            >
              Publish Recipe
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 w-full">
          {isPublished && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={onUnpublish}
            >
              Unpublish
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={isPublished ? '' : 'flex-1'}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
