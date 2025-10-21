/**
 * Vercel Blob Storage utilities for recipe image uploads
 * Handles upload, deletion, and URL management for 1200x630px recipe images
 */

import { put, del } from '@vercel/blob';

/**
 * Upload an image to Vercel Blob Storage
 * @param file - File object from form upload
 * @param recipeSlug - Recipe slug for organizing images (e.g., "chicken-tikka-masala")
 * @returns Public URL of uploaded image
 */
export async function uploadRecipeImage(
  file: File,
  recipeSlug: string
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be smaller than 5MB');
  }

  // Generate unique filename with timestamp to avoid caching issues
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `recipes/${recipeSlug}-${timestamp}.${extension}`;

  try {
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading to Blob Storage:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Vercel Blob Storage
 * @param imageUrl - Full URL of the image to delete
 */
export async function deleteRecipeImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    await del(imageUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Error deleting from Blob Storage:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}

/**
 * Validate image dimensions (should be 1200x630px for OpenGraph)
 * @param file - File object from form upload
 * @returns Promise that resolves to true if dimensions are valid
 */
export async function validateImageDimensions(
  file: File
): Promise<{ valid: boolean; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);

      // Recommended: 1200x630px (OpenGraph standard)
      // But we'll accept any landscape ratio >= 1200px width for flexibility
      const valid = width >= 1200 && height >= 630;

      resolve({ valid, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, width: 0, height: 0 });
    };

    img.src = objectUrl;
  });
}
