
'use client';

import type { HabitWithProgress } from '@/lib/types';
import { HabitItem } from './HabitItem';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { initializeClientStore } from '@/lib/store';
import { getHabitsWithProgress } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';


// Simple skeleton for habit card
function CardSkeleton() {
  return (
    <Card className="p-6 rounded-lg shadow-lg">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <div className="flex justify-between mt-4 pt-4 border-t">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex space-x-2 w-1/2 justify-end">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    </Card>
  );
}

interface HabitListProps {
  onDataChange: () => void;
}

export function HabitList({ onDataChange }: HabitListProps) {
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAndFetchHabits() {
      setIsLoading(true); 
      await initializeClientStore(); 
      const fetchedHabits = await getHabitsWithProgress(); 
      setHabits(fetchedHabits);
      setIsLoading(false);
    }
    loadAndFetchHabits();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {[1, 2, 3].map(i => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <Image 
            src="https://placehold.co/300x200.png" 
            alt="No habits yet" 
            width={300} 
            height={200} 
            className="mx-auto mb-4 rounded-lg shadow-md"
            data-ai-hint="empty list meditation" 
        />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Habits Yet!</h3>
        <p className="text-muted-foreground">Click "Add New Habit" to start tracking your micro steps.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} onDataChange={onDataChange} />
      ))}
    </div>
  );
}
