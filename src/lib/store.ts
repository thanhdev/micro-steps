import type { Habit, HabitCompletion, StoreState } from './types';
import { getTodayDateString, getStartOfWeekDate, getDatesOfWeek } from './dateUtils';
import { saveState, loadState } from './indexedDb';


// Ensure store is only initialized once
let storeInstance: StoreState | null = null;

function getStore(): StoreState {
  if (storeInstance === null) { // This function is now synchronous for the initial access
    storeInstance = {
      // Provide default state immediately while async load happens
      // The async load will update this state if data exists
      // A more robust solution might show a loading state or block UI
      habits: [
        { id: '1', name: 'Wake up on time', createdAt: new Date().toISOString(), reminderTime: '06:00' },
        { id: '2', name: 'Exercise for 1 minute', createdAt: new Date().toISOString(), reminderTime: '06:00' },
        { id: '3', name: 'Read 10 pages of a book', createdAt: new Date().toISOString(), reminderTime: '20:00' },
      ],
      completions: [],
    };
    // Start async loading of state from IndexedDB
    loadState().then(loadedState => {
      if (loadedState) {
        storeInstance = loadedState;
        console.log("State loaded from IndexedDB");
      }
    });
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
  await saveState(getStore());
  return newHabit;
}

export async function updateHabitStore(habitId: string, name: string, reminderTime?: string): Promise<Habit | null> {
  const habitIndex = getStore().habits.findIndex(h => h.id === habitId);
  if (habitIndex === -1) return null;
  const updatedHabit = { ...getStore().habits[habitIndex], name, reminderTime: reminderTime ?? undefined };
  getStore().habits[habitIndex] = updatedHabit;
  return updatedHabit;
  await saveState(getStore());
}

export async function deleteHabitStore(habitId: string): Promise<void> {
  getStore().habits = getStore().habits.filter(h => h.id !== habitId);
  getStore().completions = getStore().completions.filter(c => c.habitId !== habitId);
  await saveState(getStore());
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
    await saveState(getStore());
    return false; // Was completed, now not
  } else {
    getStore().completions.push({ habitId, date });
    await saveState(getStore());
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
// The initial call now happens implicitly when module is imported,
// triggering the async load within getStore. No explicit call needed here.

