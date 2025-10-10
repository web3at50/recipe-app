'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Leaf, Fish, Apple } from 'lucide-react';

const DIETARY_OPTIONS = [
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat or fish, but dairy and eggs are okay',
    icon: Leaf,
    color: 'text-green-500'
  },
  {
    id: 'vegan',
    label: 'Vegan',
    description: 'No animal products at all (meat, dairy, eggs, honey)',
    icon: Apple,
    color: 'text-green-600'
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    description: 'No meat, but fish and seafood are okay',
    icon: Fish,
    color: 'text-blue-500'
  },
  {
    id: 'halal',
    label: 'Halal',
    description: 'Following Islamic dietary laws',
    icon: Leaf,
    color: 'text-emerald-500'
  },
  {
    id: 'kosher',
    label: 'Kosher',
    description: 'Following Jewish dietary laws',
    icon: Leaf,
    color: 'text-indigo-500'
  }
];

interface DietaryStepProps {
  selected: string[];
  onChange: (dietary: string[]) => void;
}

export function DietaryStep({ selected, onChange }: DietaryStepProps) {
  const handleToggle = (dietId: string) => {
    // Vegan and vegetarian are mutually exclusive with pescatarian
    if (dietId === 'vegan' && selected.includes('pescatarian')) {
      onChange([dietId, ...selected.filter(id => id !== 'pescatarian' && id !== 'vegetarian')]);
    } else if (dietId === 'vegetarian' && selected.includes('pescatarian')) {
      onChange([dietId, ...selected.filter(id => id !== 'pescatarian')]);
    } else if (dietId === 'pescatarian' && (selected.includes('vegan') || selected.includes('vegetarian'))) {
      onChange([dietId, ...selected.filter(id => id !== 'vegan' && id !== 'vegetarian')]);
    } else if (selected.includes(dietId)) {
      onChange(selected.filter(id => id !== dietId));
    } else {
      onChange([...selected, dietId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Select your dietary preferences. This helps us suggest recipes that fit your lifestyle.
        </p>
      </div>

      <div className="space-y-3">
        {DIETARY_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleToggle(option.id)}
            >
              <Checkbox
                id={option.id}
                checked={selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                className="mt-1"
              />
              <Icon className={`h-5 w-5 ${option.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <Label
                  htmlFor={option.id}
                  className="font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No dietary restrictions? That&apos;s fine! You can skip this step.
        </p>
      )}
    </div>
  );
}
