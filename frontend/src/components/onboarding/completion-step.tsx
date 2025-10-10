'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import type { OnboardingFormData } from '@/types/user-profile';

interface CompletionStepProps {
  formData: OnboardingFormData;
}

export function CompletionStep({ formData }: CompletionStepProps) {
  const allergyCount = formData.allergies.length;
  const dietCount = formData.dietary_restrictions.length;
  const cuisineCount = formData.cuisines_liked?.length || 0;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-500/10 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
        <p className="text-muted-foreground">
          Your profile is ready. Let&apos;s start cooking!
        </p>
      </div>

      <div className="bg-muted rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Here&apos;s what we learned about you:
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong>Cooking Level:</strong> {formData.cooking_skill.charAt(0).toUpperCase() + formData.cooking_skill.slice(1)}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong>Typical Cook Time:</strong> {formData.typical_cook_time} minutes
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong>Household Size:</strong> {formData.household_size} {formData.household_size === 1 ? 'person' : 'people'}
            </span>
          </div>

          {allergyCount > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                <strong className="text-red-500">Allergens to avoid:</strong> {allergyCount} selected
              </span>
            </div>
          )}

          {dietCount > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                <strong>Dietary Preferences:</strong> {formData.dietary_restrictions.join(', ')}
              </span>
            </div>
          )}

          {cuisineCount > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                <strong>Favourite Cuisines:</strong> {formData.cuisines_liked?.join(', ')}
              </span>
          </div>
          )}

          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong>Personalization:</strong> {formData.consents.personalization ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-center">
          Click <strong>&quot;Complete Setup&quot;</strong> below to start discovering recipes tailored just for you!
        </p>
      </div>
    </div>
  );
}
