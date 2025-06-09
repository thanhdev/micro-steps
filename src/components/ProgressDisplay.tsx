'use client';

import type { HabitCompletion } from '@/lib/types';
import { getDatesOfWeek, formatToDayOfWeek, getTodayDateString } from '@/lib/dateUtils';
import { CheckCircle2, Circle, CalendarDays } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProgressDisplayProps {
  completionsToday: boolean;
  weeklyCompletions: HabitCompletion[];
  habitId: string; // For keying purposes if needed
}

export function ProgressDisplay({ completionsToday, weeklyCompletions }: ProgressDisplayProps) {
  const todayStr = getTodayDateString();
  const weekDates = getDatesOfWeek(new Date());

  const weeklyStatus = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const isCompleted = weeklyCompletions.some(comp => comp.date === dateStr);
    return {
      date: dateStr,
      dayName: formatToDayOfWeek(date),
      isCompleted,
      isToday: dateStr === todayStr,
    };
  });

  return (
    <div className="mt-3">
      <div className="flex items-center mb-2">
         <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground" />
         <h4 className="text-sm font-medium text-foreground">Weekly Progress</h4>
      </div>
      <div className="flex space-x-1.5 justify-around p-2 bg-muted/50 rounded-md">
        <TooltipProvider delayDuration={100}>
          {weeklyStatus.map(status => (
            <Tooltip key={status.date}>
              <TooltipTrigger asChild>
                <div className={`flex flex-col items-center p-1 rounded-md transition-all ease-in-out duration-150 ${status.isToday ? 'bg-primary/10 ring-1 ring-primary' : ''}`}>
                  <span className={`text-xs font-medium ${status.isToday ? 'text-primary' : 'text-muted-foreground'}`}>{status.dayName}</span>
                  {status.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <Circle className={`h-5 w-5 ${status.isToday ? 'text-primary/50' : 'text-muted-foreground/50'} mt-1`} />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{status.date}</p>
                <p>{status.isCompleted ? 'Completed' : 'Not completed'}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
