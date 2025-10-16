/**
 * DeleteRecipeButton Component
 *
 * Client component that handles recipe deletion with confirmation dialog.
 *
 * Features:
 * - Confirmation dialog before deletion
 * - Loading state during deletion
 * - Redirects to recipes list after successful deletion
 * - Error handling with user feedback
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteRecipeButtonProps {
  recipeId: string
  recipeName?: string
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function DeleteRecipeButton({
  recipeId,
  recipeName,
  variant = 'destructive',
  size = 'default',
  className = ''
}: DeleteRecipeButtonProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete recipe')

      // Redirect to recipes list
      router.push('/recipes')
      router.refresh()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Failed to delete recipe')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDeleteDialog(true)}
        className={className}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline ml-2">Delete Recipe</span>
        <span className="sm:hidden ml-2">Delete</span>
      </Button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              {recipeName
                ? `Are you sure you want to delete "${recipeName}"? This action cannot be undone.`
                : 'Are you sure you want to delete this recipe? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
