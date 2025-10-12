'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChefHat } from 'lucide-react';
import { AllergyStep } from '@/components/onboarding/allergy-step';
import { DietaryStep } from '@/components/onboarding/dietary-step';
import { PreferencesStep } from '@/components/onboarding/preferences-step';
import { PantryStep } from '@/components/onboarding/pantry-step';
import { ConsentStep } from '@/components/onboarding/consent-step';
import { CompletionStep } from '@/components/onboarding/completion-step';
import type { OnboardingFormData } from '@/types/user-profile';

const STEPS = [
  { id: 1, title: 'Allergies & Restrictions', description: 'Help us keep you safe' },
  { id: 2, title: 'Dietary Preferences', description: 'What do you like to eat?' },
  { id: 3, title: 'Cooking Profile', description: 'Tell us about your cooking style' },
  { id: 4, title: 'Pantry Staples', description: 'What do you keep at home?' },
  { id: 5, title: 'Privacy & Data', description: 'Your data, your choice' },
  { id: 6, title: 'All Set!', description: "You&apos;re ready to cook" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<OnboardingFormData>({
    allergies: [],
    dietary_restrictions: [],
    cooking_skill: 'intermediate',
    typical_cook_time: 30,
    household_size: 2,
    pantry_staples: [],
    cuisines_liked: [],
    spice_level: 'medium',
    consents: {
      essential: true, // Always required
      personalization: false,
      analytics: false
    }
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip to final step
    setCurrentStep(STEPS.length);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Redirect to dashboard
      router.push('/recipes');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save your preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Recipe App</h1>
          <p className="text-muted-foreground">
            Let&apos;s personalize your cooking experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <AllergyStep
                selected={formData.allergies}
                onChange={(allergies) => updateFormData({ allergies })}
              />
            )}

            {currentStep === 2 && (
              <DietaryStep
                selected={formData.dietary_restrictions}
                onChange={(dietary_restrictions) => updateFormData({ dietary_restrictions })}
              />
            )}

            {currentStep === 3 && (
              <PreferencesStep
                data={{
                  cooking_skill: formData.cooking_skill,
                  typical_cook_time: formData.typical_cook_time,
                  household_size: formData.household_size,
                  cuisines_liked: formData.cuisines_liked,
                  spice_level: formData.spice_level
                }}
                onChange={(updates) => updateFormData(updates)}
              />
            )}

            {currentStep === 4 && (
              <PantryStep
                selected={formData.pantry_staples || []}
                onChange={(pantry_staples) => updateFormData({ pantry_staples })}
              />
            )}

            {currentStep === 5 && (
              <ConsentStep
                consents={formData.consents}
                onChange={(consents) => updateFormData({ consents })}
              />
            )}

            {currentStep === 6 && (
              <CompletionStep formData={formData} />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStep > 1 && currentStep < STEPS.length && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
