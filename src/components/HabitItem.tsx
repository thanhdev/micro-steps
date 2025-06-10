
'use client';

import React from 'react';
import type { HabitWithProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ProgressDisplay } from './ProgressDisplay';
import { InsightsDialog } from './InsightsDialog';
import { EditHabitDialog } from './EditHabitDialog';
import { deleteHabitAction, toggleHabitCompletionAction, updateHabitAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { getTodayDateString } from '@/lib/dateUtils';
import { Bell, Edit3, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface HabitItemProps {
  habit: HabitWithProgress;
  onDataChange: () => void; // Callback to notify parent of data mutation
}

export function HabitItem({ habit, onDataChange }: HabitItemProps) {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = React.useState(habit.completionsToday);
  const [isLoadingToggle, setIsLoadingToggle] = React.useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
  const [reminder, setReminder] = React.useState(habit.reminderTime || '');
  const [isEditingReminder, setIsEditingReminder] = React.useState(false);

  React.useEffect(() => {
    setIsCompleted(habit.completionsToday);
    setReminder(habit.reminderTime || '');
  }, [habit.completionsToday, habit.reminderTime]);

  const handleToggleCompletion = async () => {
    setIsLoadingToggle(true);
    try {
      const today = getTodayDateString();
      const result = await toggleHabitCompletionAction(habit.id, today);
      setIsCompleted(result.completed);
      toast({
        title: result.completed ? 'Habit Marked Complete!' : 'Habit Marked Incomplete',
        description: `"${habit.name}" for today.`,
        variant: 'default',
      });
      onDataChange(); // Refresh list as completion data changed
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update habit completion.', variant: 'destructive' });
      setIsCompleted(!isCompleted);
    } finally {
      setIsLoadingToggle(false);
    }
  };

  const handleDeleteHabit = async () => {
    setIsLoadingDelete(true);
    try {
      await deleteHabitAction(habit.id);
      toast({ title: 'Habit Deleted', description: `"${habit.name}" has been removed.`, variant: 'default' });
      onDataChange(); // Notify parent to refresh list
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete habit.', variant: 'destructive' });
    } finally {
      setIsLoadingDelete(false);
    }
  };
  
  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminder(e.target.value);
  };

  const saveReminder = async () => {
    try {
      await updateHabitAction(habit.id, habit.name, reminder);
      toast({ title: 'Reminder Updated', description: `Reminder for "${habit.name}" set to ${reminder || 'none'}.`});
      setIsEditingReminder(false);
      onDataChange(); // Notify parent to refresh list
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update reminder.', variant: 'destructive' });
    }
  };


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl text-primary">{habit.name}</CardTitle>
            {habit.reminderTime && !isEditingReminder && (
              <CardDescription className="flex items-center text-sm mt-1">
                <Bell className="h-4 w-4 mr-1 text-muted-foreground" /> Reminder at {habit.reminderTime}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`completion-${habit.id}`}
              checked={isCompleted}
              onCheckedChange={handleToggleCompletion}
              disabled={isLoadingToggle}
              aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-muted"
            />
             {isLoadingToggle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ProgressDisplay completionsToday={isCompleted} weeklyCompletions={habit.weeklyCompletions} habitId={habit.id} />
        
        <div className="mt-4">
          <Label htmlFor={`reminder-${habit.id}`} className="text-xs text-muted-foreground">Set Reminder</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input 
              type="time" 
              id={`reminder-${habit.id}`} 
              value={reminder} 
              onChange={handleReminderChange}
              onFocus={() => setIsEditingReminder(true)}
              className="w-auto text-sm"
              disabled={!isEditingReminder && !!habit.reminderTime && reminder === habit.reminderTime}
            />
            {isEditingReminder ? (
              <>
                <Button variant="ghost" size="icon" onClick={saveReminder} aria-label="Save reminder">
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setReminder(habit.reminderTime || ''); setIsEditingReminder(false); }} aria-label="Cancel reminder edit">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsEditingReminder(true)} aria-label="Edit reminder">
                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
        <InsightsDialog habit={habit} />
        <div className="flex space-x-2">
          <EditHabitDialog habit={habit} onEditSuccess={onDataChange}>
            <Button variant="outline" size="sm">
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
          </EditHabitDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoadingDelete}>
                {isLoadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the habit "{habit.name}" and all its completion data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Yes, delete habit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
