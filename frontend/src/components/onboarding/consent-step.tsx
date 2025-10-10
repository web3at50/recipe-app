'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Eye, BarChart } from 'lucide-react';

interface ConsentData {
  essential: boolean;
  personalization: boolean;
  analytics: boolean;
}

interface ConsentStepProps {
  consents: ConsentData;
  onChange: (consents: ConsentData) => void;
}

export function ConsentStep({ consents, onChange }: ConsentStepProps) {
  const handleToggle = (type: keyof ConsentData) => {
    if (type === 'essential') return; // Cannot disable essential
    onChange({ ...consents, [type]: !consents[type] });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          We respect your privacy. Here&apos;s how we use your data and what you can control.
        </p>
      </div>

      <div className="space-y-4">
        {/* Essential - Always Required */}
        <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-base">Essential Functionality</Label>
                <Checkbox
                  checked={true}
                  disabled
                  className="opacity-50"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Required for the app to work properly. We store your dietary restrictions to keep you safe
                and remember your saved recipes.
              </p>
              <p className="text-xs text-primary font-medium">
                ✓ Always active (required)
              </p>
            </div>
          </div>
        </div>

        {/* Personalization - Optional */}
        <div
          className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${
            consents.personalization
              ? 'border-primary/20 bg-primary/5'
              : 'border-border hover:bg-accent/50'
          }`}
          onClick={() => handleToggle('personalization')}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              consents.personalization ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <Eye className={`h-5 w-5 ${
                consents.personalization ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-base cursor-pointer">
                  Personalized Recommendations
                </Label>
                <Checkbox
                  checked={consents.personalization}
                  onCheckedChange={() => handleToggle('personalization')}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Track which recipes you view, save, and cook to suggest better recipes over time.
                This helps us learn your preferences and improve AI-generated suggestions.
              </p>
              <p className="text-xs text-muted-foreground">
                {consents.personalization ? '✓ Enabled' : '○ Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics - Optional */}
        <div
          className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${
            consents.analytics
              ? 'border-primary/20 bg-primary/5'
              : 'border-border hover:bg-accent/50'
          }`}
          onClick={() => handleToggle('analytics')}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              consents.analytics ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <BarChart className={`h-5 w-5 ${
                consents.analytics ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-base cursor-pointer">
                  Anonymous Usage Analytics
                </Label>
                <Checkbox
                  checked={consents.analytics}
                  onCheckedChange={() => handleToggle('analytics')}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Help us improve the app by sharing anonymous usage data (which features you use,
                how long you spend, etc.). No personal data or recipe details are shared.
              </p>
              <p className="text-xs text-muted-foreground">
                {consents.analytics ? '✓ Enabled' : '○ Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Your Rights:</strong> You can change these settings anytime in your account settings.
          You also have the right to request deletion of all your data at any time.
        </p>
      </div>
    </div>
  );
}
