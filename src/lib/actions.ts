'use server';

import { revalidatePath } from 'next/cache';
import {
  addHabitStore,
  deleteHabitStore,
  getAllHabits,
  getCompletionsForHabit,
  toggleHabitCompletionStore,
  updateHabitStore,
  getWeeklyCompletions,
  getCompletionsForHabitAndDate,
  getAllCompletionsData
} from './store';
import type { Habit, HabitCompletion, HabitWithProgress } from './types';
import { generateHabitInsights, HabitInsightsInput } from '@/ai/flows/habit-insights';
import { getTodayDateString } from './dateUtils';

export async function getHabitsWithProgress(): Promise<HabitWithProgress[]> {
  const habits = await getAllHabits();
  const today = getTodayDateString();
  const habitsWithProgress: HabitWithProgress[] = [];

  for (const habit of habits) {
    const completionsToday = !!(await getCompletionsForHabitAndDate(habit.id, today));
    const weeklyCompletions = await getWeeklyCompletions(habit.id, new Date());
    const allCompletions = await getCompletionsForHabit(habit.id);
    habitsWithProgress.push({
      ...habit,
      completionsToday,
      weeklyCompletions,
      allCompletions,
    });
  }
  return habitsWithProgress;
}

export async function addHabitAction(name: string, reminderTime?: string) {
  if (!name.trim()) {
    return { error: 'Habit name cannot be empty.' };
  }
  await addHabitStore(name, reminderTime);
  revalidatePath('/');
  return { success: 'Habit added successfully.' };
}

export async function updateHabitAction(habitId: string, name: string, reminderTime?: string) {
  if (!name.trim()) {
    return { error: 'Habit name cannot be empty.' };
  }
  const updated = await updateHabitStore(habitId, name, reminderTime);
  if (!updated) {
    return { error: 'Failed to update habit.' };
  }
  revalidatePath('/');
  return { success: 'Habit updated successfully.' };
}

export async function deleteHabitAction(habitId: string) {
  await deleteHabitStore(habitId);
  revalidatePath('/');
  return { success: 'Habit deleted successfully.' };
}

export async function toggleHabitCompletionAction(habitId: string, date: string): Promise<{ completed: boolean }> {
  const completed = await toggleHabitCompletionStore(habitId, date);
  revalidatePath('/');
  return { completed };
}

export async function getAIHabitInsightsAction(habitId: string, habitName: string) {
  const completions = await getCompletionsForHabit(habitId);
  const completionData = completions.map(c => c.date).join(',');

  if (!completionData) {
    return { insights: "Not enough data to generate insights. Keep tracking your habit!" };
  }

  const input: HabitInsightsInput = {
    habitName,
    completionData,
  };

  try {
    const result = await generateHabitInsights(input);
    return { insights: result.tips };
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return { error: "Failed to generate insights. Please try again later." };
  }
}

export async function exportHabitDataAction(): Promise<string> {
  const data = await getAllCompletionsData();
  if (data.length === 0) {
    return "No data to export.";
  }
  
  const csvHeader = "Habit Name,Date,Completed\n";
  const csvRows = data
    .map(item => `"${item.habitName.replace(/"/g, '""')}",${item.date},${item.completed}`)
    .join("\n");
  
  return csvHeader + csvRows;
}
