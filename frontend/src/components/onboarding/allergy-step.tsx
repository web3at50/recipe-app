'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { UK_ALLERGENS } from '@/lib/allergen-detector';

interface AllergyStepProps {
  selected: string[];
  onChange: (allergies: string[]) => void;
}

export function AllergyStep({ selected, onChange }: AllergyStepProps) {
  const handleToggle = (allergyId: string) => {
    if (selected.includes(allergyId)) {
      onChange(selected.filter(id => id !== allergyId));
    } else {
      onChange([...selected, allergyId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-500 mb-1">Important for Your Safety</p>
          <p className="text-muted-foreground">
            Select any allergens you&apos;re allergic to. We&apos;ll make sure recipes containing these ingredients are clearly marked
            and excluded from AI-generated suggestions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Select your allergens (if any):</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UK_ALLERGENS.map((allergen) => (
            <div
              key={allergen.id}
              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleToggle(allergen.id)}
            >
              <Checkbox
                id={allergen.id}
                checked={selected.includes(allergen.id)}
                onCheckedChange={() => handleToggle(allergen.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={allergen.id}
                  className="font-medium cursor-pointer"
                >
                  {allergen.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {allergen.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-500">
              Selected allergens: {selected.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Recipes containing these ingredients will be flagged and excluded from AI generation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
