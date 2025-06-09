'use server';

/**
 * @fileOverview Generates personalized tips for habit improvement based on completion data.
 *
 * - generateHabitInsights - A function that generates habit insights.
 * - HabitInsightsInput - The input type for the generateHabitInsights function.
 * - HabitInsightsOutput - The return type for the generateHabitInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitInsightsInputSchema = z.object({
  habitName: z.string().describe('The name of the micro habit.'),
  completionData: z
    .string()
    .describe(
      'A comma-separated list of dates in ISO format (YYYY-MM-DD) when the habit was completed.'
    ),
});
export type HabitInsightsInput = z.infer<typeof HabitInsightsInputSchema>;

const HabitInsightsOutputSchema = z.object({
  tips: z.string().describe('Personalized tips for improving habit consistency.'),
});
export type HabitInsightsOutput = z.infer<typeof HabitInsightsOutputSchema>;

export async function generateHabitInsights(input: HabitInsightsInput): Promise<HabitInsightsOutput> {
  return habitInsightsFlow(input);
}

const habitInsightsPrompt = ai.definePrompt({
  name: 'habitInsightsPrompt',
  input: {schema: HabitInsightsInputSchema},
  output: {schema: HabitInsightsOutputSchema},
  prompt: `You are a habit improvement coach. Analyze the following habit completion data and provide personalized tips for improving consistency.

Habit Name: {{{habitName}}}
Completion Data: {{{completionData}}}

Tips:`,
});

const habitInsightsFlow = ai.defineFlow(
  {
    name: 'habitInsightsFlow',
    inputSchema: HabitInsightsInputSchema,
    outputSchema: HabitInsightsOutputSchema,
  },
  async input => {
    const {output} = await habitInsightsPrompt(input);
    return output!;
  }
);
