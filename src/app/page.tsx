
'use client'; // Add 'use client' because we are introducing useState

import React, { useState } from 'react'; // Import useState
import { AppHeader } from '@/components/AppHeader';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { HabitList } from '@/components/HabitList';
import { DataExportButton } from '@/components/DataExportButton';
import { ClientOnlyMotivationalSection } from '@/components/ClientOnlyMotivationalSection';

export default function HomePage() {
  const [habitsVersion, setHabitsVersion] = useState(0);

  const handleHabitAdded = () => {
    setHabitsVersion(prevVersion => prevVersion + 1);
  };

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
            <AddHabitDialog onHabitAdded={handleHabitAdded} /> {/* Pass the callback */}
          </div>
        </div>

        <HabitList key={`habit-list-${habitsVersion}`} /> {/* Add key prop */}
        
        <ClientOnlyMotivationalSection key={`motivational-section-${habitsVersion}`} /> {/* Add key prop */}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} Micro Steps. All rights reserved.</p>
        <p>Take small steps towards big changes.</p>
      </footer>
    </div>
  );
}

// Ensure revalidation occurs as needed, e.g., after actions
// export const revalidate = 0; // This is not needed for a 'use client' component's dynamic behavior like this
