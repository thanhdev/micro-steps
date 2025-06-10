
import type { Habit, HabitCompletion, StoreState } from './types';
import { getDatesOfWeek } from './dateUtils';
import { saveState, loadState } from './indexedDb';

let storeInstance: StoreState = {
  habits: [], 
  completions: [],
};

let clientStoreInitialized = false;

// Default habits to populate if IndexedDB is empty on first client load
const defaultInitialHabits: Habit[] = [
  { id: '1', name: 'Wake up on time', createdAt: new Date().toISOString(), reminderTime: '06:00' },
  { id: '2', name: 'Exercise for 1 minute', createdAt: new Date().toISOString(), reminderTime: '06:30' },
  { id: '3', name: 'Read 10 pages of a book', createdAt: new Date().toISOString(), reminderTime: '20:00' },
];

// This function should ONLY be called on the client-side.
export async function initializeClientStore(): Promise<void> {
  if (typeof window === 'undefined' || clientStoreInitialized) {
    return;
  }
  console.log('Initializing client store...');
  const loadedState = await loadState();
  if (loadedState && loadedState.habits && loadedState.habits.length > 0) {
    storeInstance = loadedState;
    console.log("Store initialized from IndexedDB on client", storeInstance);
  } else {
    console.log("No valid state in IndexedDB or empty habits, setting default initial habits.");
    storeInstance = {
      habits: [...defaultInitialHabits.map(h => ({...h, createdAt: new Date().toISOString()}))], // Ensure fresh createdAt
      completions: [],
    };
    await saveState(storeInstance); // Save the default state
    console.log("Default initial habits set and saved to IndexedDB on client", storeInstance);
  }
  clientStoreInitialized = true;
}

// Synchronously get the current state of the store.
// On server, returns initial empty state. On client, returns state after initialization.
function getStore(): StoreState {
  return storeInstance;
}

// Habit functions - these modify the in-memory storeInstance and then persist to IndexedDB.
// They are intended to be called from client-side logic (e.g., client-actions.ts).

export async function getAllHabits(): Promise<Habit[]> {
  // If called client-side before initialization, ensure defaults are at least considered.
  // However, initializeClientStore should be awaited first in most client flows.
  if (typeof window !== 'undefined' && !clientStoreInitialized) {
      // This is a fallback, ideally initializeClientStore handles the primary load.
      await initializeClientStore();
  }
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
  console.log('Habit added and saved:', newHabit, getStore());
  return newHabit;
}

export async function updateHabitStore(habitId: string, name: string, reminderTime?: string): Promise<Habit | null> {
  const store = getStore();
  const habitIndex = store.habits.findIndex(h => h.id === habitId);
  if (habitIndex === -1) return null;
  const updatedHabit = { ...store.habits[habitIndex], name, reminderTime: reminderTime ?? undefined };
  store.habits[habitIndex] = updatedHabit;
  await saveState(store);
  console.log('Habit updated and saved:', updatedHabit, getStore());
  return updatedHabit;
}

export async function deleteHabitStore(habitId: string): Promise<void> {
  const store = getStore();
  store.habits = store.habits.filter(h => h.id !== habitId);
  store.completions = store.completions.filter(c => c.habitId !== habitId); // Also remove associated completions
  await saveState(store);
  console.log('Habit deleted and saved. Remaining store:', getStore());
}

// Completion functions

export async function getCompletionsForHabit(habitId: string): Promise<HabitCompletion[]> {
  if (typeof window !== 'undefined' && !clientStoreInitialized) {
      await initializeClientStore();
  }
  return getStore().completions.filter(c => c.habitId === habitId);
}

export async function getCompletionsForHabitAndDate(habitId: string, date: string): Promise<HabitCompletion | undefined> {
   if (typeof window !== 'undefined' && !clientStoreInitialized) {
      await initializeClientStore();
  }
  return getStore().completions.find(c => c.habitId === habitId && c.date === date);
}

export async function toggleHabitCompletionStore(habitId: string, date: string): Promise<boolean> {
  const store = getStore();
  const existingCompletionIndex = store.completions.findIndex(c => c.habitId === habitId && c.date === date);
  let completed: boolean;
  if (existingCompletionIndex !== -1) {
    store.completions.splice(existingCompletionIndex, 1);
    completed = false; // Was completed, now not
  } else {
    store.completions.push({ habitId, date });
    completed = true; // Was not completed, now is
  }
  await saveState(store);
  console.log(`Habit completion toggled for ${habitId} on ${date}. Completed: ${completed}. Store saved.`, getStore());
  return completed;
}

export async function getWeeklyCompletions(habitId: string, today: Date = new Date()): Promise<HabitCompletion[]> {
  if (typeof window !== 'undefined' && !clientStoreInitialized) {
      await initializeClientStore();
  }
  const weekDates = getDatesOfWeek(today).map(d => d.toISOString().split('T')[0]);
  return getStore().completions.filter(c => c.habitId === habitId && weekDates.includes(c.date));
}


// For data export - used by a server action, so it needs to ensure it gets data if available.
// Note: This relies on the server-side storeInstance if called server-side, which is typically empty.
// The export action should ideally fetch fresh from a proper DB or have a mechanism to get client data.
// For pure IndexedDB, export should be client-initiated or this function enhanced.
// For now, it reflects the state known to `storeInstance` when called.
export async function getAllCompletionsData(): Promise<{ habitId: string, habitName: string, date: string, completed: boolean }[]> {
  const data: { habitId: string, habitName: string, date: string, completed: boolean }[] = [];
  const habits = await getAllHabits(); // This will use the current storeInstance
  const allCompletions = getStore().completions;

  const habitMap = new Map(habits.map(h => [h.id, h.name]));

  // Get all unique dates from completions to iterate through
  const uniqueDatesFromCompletions = Array.from(new Set(allCompletions.map(c => c.date))).sort();
  
  // Create a set of all dates involved for comprehensive export
  const allDates = new Set<string>(uniqueDatesFromCompletions);
  // Potentially add all dates for which habits exist, even if no completions (might be too much if habits are old)

  for (const habit of habits) {
    // Option 1: Iterate through unique dates where *any* habit was completed
    for (const date of uniqueDatesFromCompletions) {
        const completed = allCompletions.some(c => c.habitId === habit.id && c.date === date);
        // We only want to export actual completion records, or represent non-completions explicitly.
        // The current export logic in actions.ts handles combining this.
        if (completed) { // Only log actual completions for this function's direct output
             data.push({ habitId: habit.id, habitName: habit.name, date, completed });
        }
    }
     // Option 2: Add entries for all habits, even if not completed on any logged date (for full habit list in export)
     // This is better handled by the exportHabitDataAction logic to combine completions with habit list.
     // For now, this function focuses on actual completion records from the store.
  }

  // To ensure the export includes all habits, even those without any completions,
  // the `exportHabitDataAction` in `actions.ts` will merge this with the full habit list.
  // This function primarily provides the completion entries.
  const allCompletionEntries = getStore().completions.map(comp => ({
      habitId: comp.habitId,
      habitName: habitMap.get(comp.habitId) || "Unknown Habit",
      date: comp.date,
      completed: true, // If it's in completions, it was completed
  }));

  return allCompletionEntries;
}

