
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
import type { Habit } from '@/lib/types';
import { Pencil } from 'lucide-react';

interface EditHabitDialogProps {
  habit: Habit;
  children: React.ReactNode; // Trigger element
  onEditSuccess?: () => void; // Callback for successful edit
}

export function EditHabitDialog({ habit, children, onEditSuccess }: EditHabitDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onEditSuccess?.(); // Call the callback if it exists
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        <HabitForm habit={habit} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
