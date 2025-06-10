
// This file contains actions that run on the client-side and interact with IndexedDB.
// NO 'use server'; directive here.

import {
  addHabitStore,
  deleteHabitStore,
  getAllHabits,
  getCompletionsForHabitAndDate,
  getWeeklyCompletions,
  getCompletionsForHabit,
  toggleHabitCompletionStore,
  updateHabitStore,
} from './store';
import type { HabitWithProgress } from './types';
import { getTodayDateString } from './dateUtils';

export async function getHabitsWithProgressClient(): Promise<HabitWithProgress[]> {
  const habits = await getAllHabits();
  const today = getTodayDateString();
  const habitsWithProgress: HabitWithProgress[] = [];

  for (const habit of habits) {
    const completionsToday = !!(await getCompletionsForHabitAndDate(habit.id, today));
    const weeklyCompletions = await getWeeklyCompletions(habit.id, new Date());
    const allCompletions = await getCompletionsForHabit(habit.id); // For AI insights
    habitsWithProgress.push({
      ...habit,
      completionsToday,
      weeklyCompletions,
      allCompletions,
    });
  }
  return habitsWithProgress;
}

export async function addHabitActionClient(name: string, reminderTime?: string) {
  if (!name.trim()) {
    return { error: 'Habit name cannot be empty.' };
  }
  await addHabitStore(name, reminderTime);
  // UI refresh will be handled by onDataChange callback in components
  return { success: 'Habit added successfully.' };
}

export async function updateHabitActionClient(habitId: string, name: string, reminderTime?: string) {
  if (!name.trim()) {
    return { error: 'Habit name cannot be empty.' };
  }
  const updated = await updateHabitStore(habitId, name, reminderTime);
  if (!updated) {
    return { error: 'Failed to update habit.' };
  }
  // UI refresh will be handled by onDataChange callback in components
  return { success: 'Habit updated successfully.' };
}

export async function deleteHabitActionClient(habitId: string) {
  await deleteHabitStore(habitId);
  // UI refresh will be handled by onDataChange callback in components
  return { success: 'Habit deleted successfully.' };
}

export async function toggleHabitCompletionActionClient(habitId: string, date: string): Promise<{ completed: boolean }> {
  const completed = await toggleHabitCompletionStore(habitId, date);
  // UI refresh will be handled by onDataChange callback in components
  return { completed };
}
