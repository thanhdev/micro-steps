'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger, // Added DialogTrigger here
} from '@/components/ui/dialog';
import { getAIHabitInsightsAction } from '@/lib/actions';
import type { Habit } from '@/lib/types';
import { Sparkles, Loader2, Brain } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface InsightsDialogProps {
  habit: Habit;
}

export function InsightsDialog({ habit }: InsightsDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [insights, setInsights] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchInsights() {
    if (!isOpen) return; // Only fetch if dialog is open
    setIsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await getAIHabitInsightsAction(habit.id, habit.name);
      if (result.error) {
        setError(result.error);
      } else if (result.insights) {
        setInsights(result.insights);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching insights.');
    } finally {
      setIsLoading(false);
    }
  }
  
  React.useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, habit.id, habit.name]); // Re-fetch if habit changes or dialog re-opens

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Get Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Insights for "{habit.name}"
          </DialogTitle>
          <DialogDescription>
            Personalized tips to help you improve consistency.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full p-1">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Generating insights...</p>
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {insights && (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm text-foreground">
            {insights}
          </div>
        )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
