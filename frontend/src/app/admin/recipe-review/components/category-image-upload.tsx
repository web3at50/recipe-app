'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface Props {
  category: string;
  categoryTitle: string;
  currentImageUrl: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (imageUrl: string) => void;
}

export function CategoryImageUpload({
  category,
  categoryTitle,
  currentImageUrl,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/categories/${category}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const { imageUrl } = await response.json();
      onSuccess(imageUrl);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle remove custom image
  const handleRemove = async () => {
    if (!confirm('Remove custom image? The category will use the first recipe image as fallback.')) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await fetch(`/api/categories/${category}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove image');
      }

      onSuccess(''); // Empty string signals removal
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Manage {categoryTitle} Category Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended:</strong> 1200x630px (OpenGraph standard)<br />
              <strong>Max size:</strong> 5MB<br />
              <strong>Fallback:</strong> If no custom image, uses first recipe&apos;s image
            </AlertDescription>
          </Alert>

          {/* Current Image */}
          {currentImageUrl && !previewUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Image
              </label>
              <div className="relative w-full aspect-[1.91/1] rounded-lg overflow-hidden border">
                <Image
                  src={currentImageUrl}
                  alt={categoryTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="mt-2"
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Custom Image
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {currentImageUrl ? 'Replace Image' : 'Upload Image'}
            </label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="category-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="category-image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to select image or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, WebP (max 5MB)
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <div className="relative w-full aspect-[1.91/1] rounded-lg overflow-hidden border">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="outline" disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
