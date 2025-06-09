import { AppHeader } from '@/components/AppHeader';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { HabitList } from '@/components/HabitList';
import { DataExportButton } from '@/components/DataExportButton';
import { getHabitsWithProgress } from '@/lib/actions';
import Image from 'next/image';

export default async function HomePage() {
  const habits = await getHabitsWithProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-headline font-semibold text-foreground">
            Your Micro Habits
          </h2>
          <div className="flex space-x-3">
            <DataExportButton />
            <AddHabitDialog />
          </div>
        </div>

        <HabitList habits={habits} />
        
        {habits.length > 0 && (
          <section className="mt-12 p-6 bg-card rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* <Image 
                src="https://placehold.co/200x150.png" 
                alt="Motivational visual" 
                width={200} 
                height={150} 
                className="rounded-lg object-cover"
                data-ai-hint="growth plant"
              /> */}
              <div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">Keep Up The Great Work!</h3>
                <p className="text-muted-foreground">
                  Each small step you take contributes to significant progress over time. Consistency is key to building lasting habits.
                  Use the "Get Insights" feature on your habits to find personalized tips and stay motivated!
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} Micro Steps. All rights reserved.</p>
        <p>Take small steps towards big changes.</p>
      </footer>
    </div>
  );
}

// Ensure revalidation occurs as needed, e.g., after actions
export const revalidate = 0; // Or a specific time in seconds
