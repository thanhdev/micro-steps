
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

interface AddHabitDialogProps {
  onHabitAdded?: () => void; // Define the new prop
}

export function AddHabitDialog({ onHabitAdded }: AddHabitDialogProps) { // Destructure the prop
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onHabitAdded?.(); // Call the callback if it exists
  };

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
        <HabitForm onSuccess={handleSuccess} /> {/* Pass the combined success handler */}
      </DialogContent>
    </Dialog>
  );
}
