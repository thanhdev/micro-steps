'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportHabitDataAction } from '@/lib/actions';
import { Download, Loader2 } from 'lucide-react';

export function DataExportButton() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportHabitDataAction();
      if (csvData === "No data to export.") {
        toast({ title: 'Export Info', description: csvData, variant: 'default' });
        return;
      }

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'micro_steps_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Export Successful', description: 'Your habit data has been downloaded.', variant: 'default' });
      } else {
        toast({ title: 'Export Failed', description: 'Your browser does not support direct downloads.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export Failed', description: 'An error occurred while exporting data.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export Data
    </Button>
  );
}
