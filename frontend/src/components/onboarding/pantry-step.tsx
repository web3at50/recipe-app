'use client';

import { PantryOnboarding } from '@/components/pantry/pantry-onboarding';

interface PantryStepProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

export function PantryStep({ selected, onChange }: PantryStepProps) {
  return (
    <div className="space-y-4">
      {/* Intro text */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Pantry staples are items you typically keep at home (like olive oil, salt, or spices).
          We&apos;ll hide these from your shopping lists by default to keep them clean and focused.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>This step is optional</strong> - you can always set this up later in Settings,
          or customize items directly from your shopping lists.
        </p>
      </div>

      {/* Pantry selection component */}
      <PantryOnboarding
        selected={selected}
        onChange={onChange}
      />
    </div>
  );
}
