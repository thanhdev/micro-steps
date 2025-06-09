import { CheckSquare } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50 bg-background sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        <CheckSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold text-primary">Micro Steps</h1>
      </div>
    </header>
  );
}
