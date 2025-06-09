export interface Habit {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  reminderTime?: string; // HH:mm format, e.g., "09:00"
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
}

export interface HabitWithProgress extends Habit {
  completionsToday: boolean;
  weeklyCompletions: HabitCompletion[]; // Completions for the current week
  allCompletions: HabitCompletion[]; // All completions for AI insights
}
