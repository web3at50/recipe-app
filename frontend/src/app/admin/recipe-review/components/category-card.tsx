'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { CategoryImageUpload } from './category-image-upload';
import Link from 'next/link';

export interface CategoryCardData {
  slug: string;
  title: string;
  recipeCount: number;
  currentImageUrl: string | null;
  fallbackImageUrl: string | null;
  isCustomImage: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Props {
  category: CategoryCardData;
  onImageUpdate: (category: string, imageUrl: string | null) => void;
}

export function CategoryCard({ category, onImageUpdate }: Props) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const Icon = category.icon;

  // Determine which image to display
  const displayImage = category.currentImageUrl || category.fallbackImageUrl;
  const imageBadgeLabel = category.isCustomImage
    ? 'Custom'
    : category.currentImageUrl
    ? 'Auto (from recipe)'
    : 'Default';

  const imageBadgeVariant = category.isCustomImage ? 'default' : 'secondary';

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${category.color}`} />
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </div>
            <Link
              href={`/recipes/${category.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {category.recipeCount} recipes
            </Badge>
            <Badge variant={imageBadgeVariant} className="text-xs">
              {imageBadgeLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Image Preview */}
          <div className="relative w-full aspect-[1.91/1] rounded-lg overflow-hidden border bg-muted">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={category.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Icon className={`h-12 w-12 mx-auto mb-2 ${category.color}`} />
                  <p className="text-sm">No image</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="w-full"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {category.isCustomImage ? 'Change Image' : 'Upload Custom Image'}
          </Button>
        </CardFooter>
      </Card>

      {/* Upload Modal */}
      <CategoryImageUpload
        category={category.slug}
        categoryTitle={category.title}
        currentImageUrl={category.currentImageUrl}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(imageUrl) => {
          onImageUpdate(category.slug, imageUrl || null);
        }}
      />
    </>
  );
}
