
'use server';

import {
  getAllHabits,
  getCompletionsForHabit,
  getAllCompletionsData
} from './store';
import { generateHabitInsights, HabitInsightsInput } from '@/ai/flows/habit-insights';

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
  const habits = await getAllHabits(); // Used to get habit names
  const allData = await getAllCompletionsData(); // This gets all completion records

  if (allData.length === 0 && habits.length === 0) {
    return "No data to export.";
  }
  
  // Create a map of habitId to habitName for easy lookup
  const habitNameMap = new Map(habits.map(h => [h.id, h.name]));

  const csvHeader = "Habit Name,Date,Completed\n";
  const csvRows = allData
    .map(item => {
      // item from getAllCompletionsData already includes habitName
      const habitName = item.habitName || habitNameMap.get(item.habitId) || "Unknown Habit";
      return `"${habitName.replace(/"/g, '""')}",${item.date},${item.completed ? 'Yes' : 'No'}`;
    })
    .join("\n");
  
  // Handle habits that might exist but have no completions
  const habitsWithNoCompletions = habits.filter(h => !allData.some(d => d.habitId === h.id));
  const noCompletionRows = habitsWithNoCompletions
    .map(h => `"${h.name.replace(/"/g, '""')}",N/A,No`)
    .join("\n");

  let finalCsv = csvHeader + csvRows;
  if (noCompletionRows) {
    finalCsv += (csvRows ? "\n" : "") + noCompletionRows;
  }
  
  if (finalCsv === csvHeader) { // Only header means no actual data rows were generated
     return "No data to export.";
  }

  return finalCsv;
}

