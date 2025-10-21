'use client';

import { useState, useEffect } from 'react';
import type { Recipe } from '@/types/recipe';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from './image-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateSEOTitle, generateSEODescription, suggestCategory } from '@/lib/seo/recipe-metadata';
import { generateSlug } from '@/lib/seo/generate-slug';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedRecipe: Recipe) => void;
}

const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'sides', label: 'Sides' },
  { value: 'quick-easy', label: 'Quick & Easy' },
  { value: 'healthy', label: 'Healthy' },
] as const;

export function PublishModal({ recipe, open, onClose, onSuccess }: Props) {
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoSlug, setSeoSlug] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing or generated values
  useEffect(() => {
    if (recipe && open) {
      setSeoTitle(recipe.seo_title || generateSEOTitle(recipe.name));
      setSeoDescription(recipe.seo_description || generateSEODescription(recipe));
      setSeoSlug(recipe.seo_slug || generateSlug(recipe.name));
      setCategory(recipe.category || suggestCategory(recipe));
      setImageUrl(recipe.image_url || '');
      setError(null);
    }
  }, [recipe, open]);

  const handlePublish = async () => {
    // Validation
    if (!seoTitle.trim()) {
      setError('SEO title is required');
      return;
    }
    if (!seoDescription.trim()) {
      setError('SEO description is required');
      return;
    }
    if (!seoSlug.trim()) {
      setError('URL slug is required');
      return;
    }
    if (!category) {
      setError('Category is required');
      return;
    }
    if (!imageUrl) {
      setError('Recipe image is required for publishing');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_slug: seoSlug,
          category,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish recipe');
      }

      const { recipe: updatedRecipe } = await response.json();
      onSuccess(updatedRecipe);
    } catch (err) {
      console.error('Error publishing recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish recipe');
    } finally {
      setIsPublishing(false);
    }
  };

  const isPublished = recipe.is_public;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isPublished ? 'Edit' : 'Publish'} Recipe: {recipe.name}
          </DialogTitle>
          <DialogDescription>
            {isPublished
              ? 'Update SEO metadata and settings for this published recipe'
              : 'Add SEO metadata and image to publish this recipe to the public site'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* SEO Title */}
          <div className="space-y-2">
            <Label htmlFor="seo-title">
              SEO Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              maxLength={60}
              placeholder="Recipe title for search engines"
            />
            <p className="text-xs text-muted-foreground">
              {seoTitle.length}/60 characters • Appears in Google search results
            </p>
          </div>

          {/* SEO Description */}
          <div className="space-y-2">
            <Label htmlFor="seo-description">
              SEO Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              maxLength={155}
              rows={3}
              placeholder="Brief description for search engines"
            />
            <p className="text-xs text-muted-foreground">
              {seoDescription.length}/155 characters • Shown below title in
              Google
            </p>
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <Label htmlFor="seo-slug">
              URL Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seo-slug"
              value={seoSlug}
              onChange={(e) => setSeoSlug(e.target.value.toLowerCase())}
              placeholder="recipe-url-slug"
            />
            <p className="text-xs text-muted-foreground">
              Will appear as:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                /recipes/{category || '...'}/{seoSlug || '...'}
              </code>
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Recipe will appear in this category on the public site
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Recipe Image (1200x630px recommended) <span className="text-destructive">*</span>
            </Label>
            <ImageUpload
              recipeSlug={seoSlug}
              currentImageUrl={imageUrl}
              onImageUploaded={(url) => setImageUrl(url)}
            />
            <p className="text-xs text-muted-foreground">
              Upload a high-quality image (1200x630px) for social sharing and
              SEO
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Search Engine Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/50 space-y-1">
              <div className="text-lg text-blue-600 font-medium">
                {seoTitle || 'Recipe Title'}
              </div>
              <div className="text-sm text-green-700">
                https://platewise.xyz/recipes/{category || 'category'}/
                {seoSlug || 'slug'}
              </div>
              <div className="text-sm text-gray-600">
                {seoDescription || 'Recipe description'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPublished ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isPublished ? 'Update Recipe' : 'Publish Recipe'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isPublishing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
