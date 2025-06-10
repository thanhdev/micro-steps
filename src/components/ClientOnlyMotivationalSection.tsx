
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getHabitsWithProgressClient } from '@/lib/client-actions'; // Updated import
import type { HabitWithProgress } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';


export function ClientOnlyMotivationalSection() {
  const [habits, setHabits] = useState<HabitWithProgress[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserHabits() {
      // initializeClientStore is already called by HabitList or a global wrapper
      const userHabits = await getHabitsWithProgressClient(); // Using client action
      setHabits(userHabits);
      setIsLoading(false);
    }
    // Delay slightly to ensure HabitList's initialization runs first if both are on page
    // Or, use a shared context/event for store initialization status.
    const timer = setTimeout(() => {
        fetchUserHabits();
    }, 100); // Small delay, not ideal but simple for now.

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card as="section" className="mt-12 p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="w-[200px] h-[150px] rounded-lg object-cover" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Card>
    );
  }

  if (!habits || habits.length === 0) {
    return null; // Don't show if no habits after loading
  }

  return (
    <Card as="section" className="mt-12 p-6 shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Image 
          src="https://placehold.co/200x150.png" 
          alt="Motivational visual" 
          width={200} 
          height={150} 
          className="rounded-lg object-cover"
          data-ai-hint="growth plant"
        />
        <div>
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Keep Up The Great Work!</h3>
          <p className="text-muted-foreground">
            Each small step you take contributes to significant progress over time. Consistency is key to building lasting habits.
            Use the "Get Insights" feature on your habits to find personalized tips and stay motivated!
          </p>
        </div>
      </div>
    </Card>
  );
}

