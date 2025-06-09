'use client';

import type { HabitWithProgress } from '@/lib/types';
import { HabitItem } from './HabitItem';
import Image from 'next/image';

interface HabitListProps {
  habits: HabitWithProgress[];
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        {/* <Image 
            src="https://placehold.co/300x200.png" // Placeholder for an empty state image
            alt="No habits yet" 
            width={300} 
            height={200} 
            className="mx-auto mb-4 rounded-lg shadow-md"
            data-ai-hint="empty list meditation" 
        /> */}
        <h3 className="text-xl font-semibold text-foreground mb-2">No Habits Yet!</h3>
        <p className="text-muted-foreground">Click "Add New Habit" to start tracking your micro steps.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
