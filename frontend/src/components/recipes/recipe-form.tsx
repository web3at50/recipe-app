'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import type { RecipeFormData, RecipeWithDetails } from '@/types/recipe';

const recipeFormSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(200),
  description: z.string().optional(),
  prep_time: z.number().min(0).optional(),
  cook_time: z.number().min(0).optional(),
  servings: z.number().min(1, 'Must have at least 1 serving').default(4),
  ingredients: z.array(
    z.object({
      item: z.string().min(1, 'Ingredient name is required'),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one ingredient is required'),
  instructions: z.array(
    z.object({
      instruction: z.string().min(1, 'Instruction cannot be empty'),
    })
  ).min(1, 'At least one instruction is required'),
  category_ids: z.array(z.string()).optional(),
});

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => Promise<void>;
  defaultValues?: RecipeWithDetails;
  isSubmitting?: boolean;
}

export function RecipeForm({ onSubmit, defaultValues, isSubmitting = false }: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      description: defaultValues.description || '',
      prep_time: defaultValues.prep_time || undefined,
      cook_time: defaultValues.cook_time || undefined,
      servings: defaultValues.servings,
      ingredients: defaultValues.ingredients.map(ing => ({
        item: ing.item,
        quantity: ing.quantity || undefined,
        unit: ing.unit || undefined,
        notes: ing.notes || undefined,
      })),
      instructions: defaultValues.instructions.map(inst => ({
        instruction: inst.instruction,
      })),
    } : {
      name: '',
      description: '',
      servings: 4,
      ingredients: [{ item: '', quantity: undefined, unit: '', notes: '' }],
      instructions: [{ instruction: '' }],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    name: 'instructions',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Spaghetti Carbonara" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your recipe..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="prep_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prep Time (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="15"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cook_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cook Time (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="4"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ingredients *</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendIngredient({ item: '', quantity: undefined, unit: '', notes: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.item`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>Item</FormLabel>}
                        <FormControl>
                          <Input placeholder="e.g., Flour" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>Qty</FormLabel>}
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="2"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>Unit</FormLabel>}
                        <FormControl>
                          <Input placeholder="cups" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>Notes</FormLabel>}
                        <FormControl>
                          <Input placeholder="chopped" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {ingredientFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  className={index === 0 ? 'mt-8' : ''}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Instructions *</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendInstruction({ instruction: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-2">
                {index + 1}
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`instructions.${index}.instruction`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this step..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {instructionFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : defaultValues ? 'Update Recipe' : 'Create Recipe'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
