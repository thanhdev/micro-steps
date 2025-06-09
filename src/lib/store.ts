import type { Habit, HabitCompletion } from './types';
import { getTodayDateString, getStartOfWeekDate, getDatesOfWeek } from './dateUtils';

interface AppState {
  habits: Habit[];
  completions: HabitCompletion[];
}

// Ensure store is only initialized once
let storeInstance: AppState | null = null;

function getStore(): AppState {
  if (storeInstance === null) {
    storeInstance = {
      habits: [
        { id: '1', name: 'Drink 8 glasses of water', createdAt: new Date().toISOString(), reminderTime: '09:00' },
        { id: '2', name: 'Read 10 pages of a book', createdAt: new Date().toISOString(), reminderTime: '20:00' },
        { id: '3', name: 'Meditate for 5 minutes', createdAt: new Date().toISOString() },
      ],
      completions: [
        { habitId: '1', date: getTodayDateString() },
        { habitId: '1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] }, // Yesterday
        { habitId: '2', date: getTodayDateString() },
      ],
    };
  }
  return storeInstance;
}


// Habit functions
export async function getAllHabits(): Promise<Habit[]> {
  return [...getStore().habits];
}

export async function addHabitStore(name: string, reminderTime?: string): Promise<Habit> {
  const newHabit: Habit = {
    id: String(Date.now()),
    name,
    createdAt: new Date().toISOString(),
    reminderTime,
  };
  getStore().habits.push(newHabit);
  return newHabit;
}

export async function updateHabitStore(habitId: string, name: string, reminderTime?: string): Promise<Habit | null> {
  const habitIndex = getStore().habits.findIndex(h => h.id === habitId);
  if (habitIndex === -1) return null;
  const updatedHabit = { ...getStore().habits[habitIndex], name, reminderTime: reminderTime ?? undefined };
  getStore().habits[habitIndex] = updatedHabit;
  return updatedHabit;
}

export async function deleteHabitStore(habitId: string): Promise<void> {
  getStore().habits = getStore().habits.filter(h => h.id !== habitId);
  getStore().completions = getStore().completions.filter(c => c.habitId !== habitId);
}

// Completion functions
export async function getCompletionsForHabit(habitId: string): Promise<HabitCompletion[]> {
  return getStore().completions.filter(c => c.habitId === habitId);
}

export async function getCompletionsForHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | undefined> {
  return getStore().completions.find(c => c.habitId === habitId && c.date === date);
}

export async function toggleHabitCompletionStore(habitId: string, date: string): Promise<boolean> {
  const existingCompletionIndex = getStore().completions.findIndex(c => c.habitId === habitId && c.date === date);
  if (existingCompletionIndex !== -1) {
    getStore().completions.splice(existingCompletionIndex, 1);
    return false; // Was completed, now not
  } else {
    getStore().completions.push({ habitId, date });
    return true; // Was not completed, now is
  }
}

export async function getWeeklyCompletions(habitId: string, today: Date = new Date()): Promise<HabitCompletion[]> {
  const weekDates = getDatesOfWeek(today).map(d => d.toISOString().split('T')[0]);
  return getStore().completions.filter(c => c.habitId === habitId && weekDates.includes(c.date));
}

export async function getAllCompletionsData(): Promise<{ habitName: string, date: string, completed: boolean }[]> {
  const data: { habitName: string, date: string, completed: boolean }[] = [];
  const habits = await getAllHabits();
  const allCompletions = getStore().completions;

  // This is a bit inefficient for a large dataset but okay for scaffolding
  // Create a set of all unique dates with completions
  const uniqueDates = Array.from(new Set(allCompletions.map(c => c.date))).sort();

  for (const habit of habits) {
    for (const date of uniqueDates) {
      const completed = allCompletions.some(c => c.habitId === habit.id && c.date === date);
      // We only really care about positive completions for export in this format
      if (completed) {
         data.push({ habitName: habit.name, date, completed });
      }
    }
     // If a habit has no completions, it won't appear.
     // To show all habits, even with no completions, one might iterate dates per habit.
     // For now, only completed entries.
  }
  return data;
}

// Initialize store when module is loaded (simulates app startup)
getStore();
