'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addHabitAction, updateHabitAction } from '@/lib/actions';
import type { Habit } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import React from 'react';

const habitFormSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Habit name is too long'),
  reminderTime: z.string().optional(), // HH:mm format
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

interface HabitFormProps {
  habit?: Habit;
  onSuccess: () => void;
}

export function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: habit?.name || '',
      reminderTime: habit?.reminderTime || '',
    },
  });

  async function onSubmit(values: HabitFormValues) {
    setIsSubmitting(true);
    try {
      const result = habit
        ? await updateHabitAction(habit.id, values.name, values.reminderTime)
        : await addHabitAction(values.name, values.reminderTime);

      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: result.success });
        onSuccess();
        form.reset({ name: '', reminderTime: '' }); // Reset form for next entry if adding
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink a glass of water" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Time (Optional)</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {habit ? 'Save Changes' : 'Add Habit'}
        </Button>
      </form>
    </Form>
  );
}
