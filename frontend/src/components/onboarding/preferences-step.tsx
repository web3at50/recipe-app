'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface PreferencesData {
  cooking_skill: 'beginner' | 'intermediate' | 'advanced';
  typical_cook_time: number;
  household_size: number;
  cuisines_liked?: string[];
  spice_level?: 'mild' | 'medium' | 'hot';
}

interface PreferencesStepProps {
  data: PreferencesData;
  onChange: (updates: Partial<PreferencesData>) => void;
}

const POPULAR_CUISINES = ['British', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Thai'];

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  const handleCuisineToggle = (cuisine: string) => {
    const current = data.cuisines_liked || [];
    if (current.includes(cuisine)) {
      onChange({ cuisines_liked: current.filter(c => c !== cuisine) });
    } else {
      onChange({ cuisines_liked: [...current, cuisine] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cooking Skill */}
      <div className="space-y-2">
        <Label htmlFor="skill">Cooking Skill Level</Label>
        <Select
          value={data.cooking_skill}
          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
            onChange({ cooking_skill: value })
          }
        >
          <SelectTrigger id="skill">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner - I&apos;m just starting out</SelectItem>
            <SelectItem value="intermediate">Intermediate - I can follow most recipes</SelectItem>
            <SelectItem value="advanced">Advanced - I&apos;m confident in the kitchen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Typical Cook Time */}
      <div className="space-y-2">
        <Label htmlFor="cook-time">How much time do you usually have for cooking?</Label>
        <Select
          value={data.typical_cook_time.toString()}
          onValueChange={(value) => onChange({ typical_cook_time: parseInt(value) })}
        >
          <SelectTrigger id="cook-time">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes - Quick meals only</SelectItem>
            <SelectItem value="30">30 minutes - Standard weeknight cooking</SelectItem>
            <SelectItem value="45">45 minutes - I don&apos;t mind spending time</SelectItem>
            <SelectItem value="60">60+ minutes - I enjoy cooking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Household Size */}
      <div className="space-y-2">
        <Label htmlFor="household">How many people do you usually cook for?</Label>
        <Input
          id="household"
          type="number"
          min="1"
          max="12"
          value={data.household_size}
          onChange={(e) => onChange({ household_size: parseInt(e.target.value) || 1 })}
        />
        <p className="text-sm text-muted-foreground">
          We&apos;ll adjust recipe servings to match this by default
        </p>
      </div>

      {/* Spice Level */}
      <div className="space-y-2">
        <Label htmlFor="spice">Spice Tolerance</Label>
        <Select
          value={data.spice_level || 'medium'}
          onValueChange={(value: 'mild' | 'medium' | 'hot') =>
            onChange({ spice_level: value })
          }
        >
          <SelectTrigger id="spice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Mild - Keep it gentle 🌶️</SelectItem>
            <SelectItem value="medium">Medium - A bit of heat 🌶️🌶️</SelectItem>
            <SelectItem value="hot">Hot - Bring the fire! 🌶️🌶️🌶️</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Favorite Cuisines */}
      <div className="space-y-3">
        <Label>Favourite Cuisines (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Select cuisines you enjoy. We&apos;ll suggest more of these.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {POPULAR_CUISINES.map((cuisine) => (
            <div
              key={cuisine}
              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleCuisineToggle(cuisine)}
            >
              <Checkbox
                id={`cuisine-${cuisine}`}
                checked={(data.cuisines_liked || []).includes(cuisine)}
                onCheckedChange={() => handleCuisineToggle(cuisine)}
              />
              <Label
                htmlFor={`cuisine-${cuisine}`}
                className="cursor-pointer flex-1"
              >
                {cuisine}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
