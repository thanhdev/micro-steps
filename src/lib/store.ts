
import type { Habit, HabitCompletion, StoreState } from './types';
import { getTodayDateString, getStartOfWeekDate, getDatesOfWeek } from './dateUtils';
import { saveState, loadState } from './indexedDb';

let storeInstance: StoreState = {
  habits: [], // Start with an empty store for server-side rendering compatibility
  completions: [],
};

let clientStoreInitialized = false;

const defaultInitialHabits: Habit[] = [
  { id: '1', name: 'Wake up on time', createdAt: new Date().toISOString(), reminderTime: '06:00' },
  { id: '2', name: 'Exercise for 1 minute', createdAt: new Date().toISOString(), reminderTime: '06:30' },
  { id: '3', name: 'Read 10 pages of a book', createdAt: new Date().toISOString(), reminderTime: '20:00' },
];

export async function initializeClientStore(): Promise<void> {
  if (typeof window === 'undefined' || clientStoreInitialized) {
    return;
  }

  const loadedState = await loadState();
  if (loadedState && loadedState.habits && loadedState.habits.length > 0) {
    storeInstance = loadedState;
    // console.log("Store initialized from IndexedDB on client");
  } else {
    // No valid state in IndexedDB or empty habits, set default initial habits and save.
    storeInstance = {
      habits: [...defaultInitialHabits], // Use a copy
      completions: [],
    };
    await saveState(storeInstance);
    // console.log("Default initial habits set and saved to IndexedDB on client");
  }
  clientStoreInitialized = true;
}

// This synchronous function is used by both server and client.
// On the server, it returns the initial empty state.
// On the client, it returns the state after initializeClientStore has run.
function getStore(): StoreState {
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
  const store = getStore();
  const habitIndex = store.habits.findIndex(h => h.id === habitId);
  if (habitIndex === -1) return null;
  const updatedHabit = { ...store.habits[habitIndex], name, reminderTime: reminderTime ?? undefined };
  store.habits[habitIndex] = updatedHabit;
  await saveState(store);
  return updatedHabit;
}

export async function deleteHabitStore(habitId: string): Promise<void> {
  const store = getStore();
  store.habits = store.habits.filter(h => h.id !== habitId);
  store.completions = store.completions.filter(c => c.habitId !== habitId);
  await saveState(store);
}

// Completion functions
export async function getCompletionsForHabit(habitId: string): Promise<HabitCompletion[]> {
  return getStore().completions.filter(c => c.habitId === habitId);
}

export async function getCompletionsForHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | undefined> {
  return getStore().completions.find(c => c.habitId === habitId && c.date === date);
}

export async function toggleHabitCompletionStore(habitId: string, date: string): Promise<boolean> {
  const store = getStore();
  const existingCompletionIndex = store.completions.findIndex(c => c.habitId === habitId && c.date === date);
  if (existingCompletionIndex !== -1) {
    store.completions.splice(existingCompletionIndex, 1);
    await saveState(store);
    return false; // Was completed, now not
  } else {
    store.completions.push({ habitId, date });
    await saveState(store);
    return true; // Was not completed, now is
  }
}

export async function getWeeklyCompletions(habitId: string, today: Date = new Date()): Promise<HabitCompletion[]> {
  const weekDates = getDatesOfWeek(today).map(d => d.toISOString().split('T')[0]);
  return getStore().completions.filter(c => c.habitId === habitId && weekDates.includes(c.date));
}

export async function getAllCompletionsData(): Promise<{ habitName: string, date: string, completed: boolean }[]> {
  const data: { habitName: string, date: string, completed: boolean }[] = [];
  const habits = await getAllHabits(); // Uses getStore()
  const allCompletions = getStore().completions;

  const uniqueDates = Array.from(new Set(allCompletions.map(c => c.date))).sort();

  for (const habit of habits) {
    for (const date of uniqueDates) {
      const completed = allCompletions.some(c => c.habitId === habit.id && c.date === date);
      if (completed) {
         data.push({ habitName: habit.name, date, completed });
      }
    }
  }
  return data;
}
