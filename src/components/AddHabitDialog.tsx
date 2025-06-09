'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HabitForm } from './HabitForm';
import { PlusCircle } from 'lucide-react';

export function AddHabitDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Micro Habit</DialogTitle>
        </DialogHeader>
        <HabitForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
