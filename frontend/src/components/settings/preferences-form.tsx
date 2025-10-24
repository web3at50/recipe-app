'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Save } from 'lucide-react';
import type { UserPreferences } from '@/types/user-profile';
import { UK_ALLERGENS } from '@/lib/allergen-detector';

interface PreferencesFormProps {
  initialPreferences: UserPreferences;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' }
];

const POPULAR_CUISINES = ['British', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'French'];

export function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  // Track household size separately to allow empty input during editing
  const [householdSizeInput, setHouseholdSizeInput] = useState<string>(
    initialPreferences.household_size?.toString() || '2'
  );

  const handleToggleArray = (field: keyof UserPreferences, value: string) => {
    const currentArray = (preferences[field] as string[]) || [];
    if (currentArray.includes(value)) {
      setPreferences({
        ...preferences,
        [field]: currentArray.filter(v => v !== value)
      });
    } else {
      setPreferences({
        ...preferences,
        [field]: [...currentArray, value]
      });
    }
  };

  const handleSave = async () => {
    // Ensure household size has a valid value before saving
    const finalPreferences = {
      ...preferences,
      household_size: parseInt(householdSizeInput) || preferences.household_size || 2
    };

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: finalPreferences })
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Update local state with the saved value
      setPreferences(finalPreferences);
      setHouseholdSizeInput(finalPreferences.household_size.toString());

      router.refresh();
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Allergies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Allergens & Restrictions</CardTitle>
          </div>
          <CardDescription>
            These help keep you safe by filtering recipes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Allergens</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {UK_ALLERGENS.map((allergen) => (
                <div key={allergen.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergen.id}
                    checked={preferences.allergies?.includes(allergen.id)}
                    onCheckedChange={() => handleToggleArray('allergies', allergen.id)}
                  />
                  <Label htmlFor={allergen.id} className="cursor-pointer">
                    {allergen.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base mb-3 block">Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={preferences.dietary_restrictions?.includes(option.id)}
                    onCheckedChange={() => handleToggleArray('dietary_restrictions', option.id)}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cooking Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Cooking Profile</CardTitle>
          <CardDescription>
            Help us suggest recipes that match your style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooking_skill">Cooking Skill Level</Label>
              <Select
                value={preferences.cooking_skill}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                  setPreferences({ ...preferences, cooking_skill: value })
                }
              >
                <SelectTrigger id="cooking_skill">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cook_time">Typical Cooking Time</Label>
              <Select
                value={preferences.typical_cook_time.toString()}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, typical_cook_time: parseInt(value) })
                }
              >
                <SelectTrigger id="cook_time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="household_size">Household Size</Label>
              <Input
                id="household_size"
                type="number"
                min="1"
                max="12"
                placeholder="2"
                value={householdSizeInput}
                onChange={(e) => {
                  setHouseholdSizeInput(e.target.value);
                  // Update preferences if valid number
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 12) {
                    setPreferences({ ...preferences, household_size: value });
                  }
                }}
                onBlur={() => {
                  // Restore saved value if input is empty on blur
                  if (!householdSizeInput) {
                    setHouseholdSizeInput(preferences.household_size?.toString() || '2');
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spice_level">Spice Tolerance</Label>
              <Select
                value={preferences.spice_level}
                onValueChange={(value: 'mild' | 'medium' | 'hot') =>
                  setPreferences({ ...preferences, spice_level: value })
                }
              >
                <SelectTrigger id="spice_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild 🌶️</SelectItem>
                  <SelectItem value="medium">Medium 🌶️🌶️</SelectItem>
                  <SelectItem value="hot">Hot 🌶️🌶️🌶️</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base mb-3 block">Favourite Cuisines</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {POPULAR_CUISINES.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${cuisine}`}
                    checked={preferences.cuisines_liked?.includes(cuisine)}
                    onCheckedChange={() => handleToggleArray('cuisines_liked', cuisine)}
                  />
                  <Label htmlFor={`cuisine-${cuisine}`} className="cursor-pointer">
                    {cuisine}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
