import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export async function RecipeCTA() {
  const { userId } = await auth();

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            Want to Create Your Own Recipe?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get 4 AI-generated recipe variations in 30 seconds. British
            measurements, UK allergen tracking, and completely free to try.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {userId ? (
            <Link href="/create-recipe">
              <Button size="lg">Create Your Own Recipe</Button>
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <Button size="lg">Start Free - No Card Needed</Button>
            </SignUpButton>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          40 recipes free • £9.99 lifetime after • No subscription ever
        </p>
      </CardContent>
    </Card>
  );
}
