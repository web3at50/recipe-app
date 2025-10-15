'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function FeedbackButton({ page = 'generate' }: { page?: string }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState('');
  const [disliked, setDisliked] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect device type based on viewport
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };
    setDeviceType(detectDevice());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one field is filled
    if (!liked && !disliked && !suggestions) {
      toast.error('Please provide at least some feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liked: liked.trim() || undefined,
          disliked: disliked.trim() || undefined,
          suggestions: suggestions.trim() || undefined,
          device_type: deviceType,
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          page,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Thank you for your feedback!', {
        description: 'Your input helps us improve the app.',
      });

      // Reset form and close modal
      setLiked('');
      setDisliked('');
      setSuggestions('');
      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 h-14 w-14 md:h-auto md:w-auto md:rounded-md md:px-4"
          title="Share feedback"
        >
          <MessageCircle className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve! All fields are optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="liked">What did you like?</Label>
              <Textarea
                id="liked"
                placeholder="What worked well for you?"
                value={liked}
                onChange={(e) => setLiked(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disliked">What didn&apos;t work well?</Label>
              <Textarea
                id="disliked"
                placeholder="Any issues or frustrations?"
                value={disliked}
                onChange={(e) => setDisliked(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Suggestions for improvement?</Label>
              <Textarea
                id="suggestions"
                placeholder="How can we make this better?"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Device:</span>
              <span className="font-medium capitalize">{deviceType}</span>
              {deviceType === 'mobile' && '📱'}
              {deviceType === 'tablet' && '📱'}
              {deviceType === 'desktop' && '💻'}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
