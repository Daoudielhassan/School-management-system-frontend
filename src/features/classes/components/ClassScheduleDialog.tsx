'use client';

/**
 * Lightweight dialog for a class's attendance. The full attendance workflow
 * lives in the dedicated Attendance section — this just points there rather
 * than shipping placeholder tabs.
 */
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight } from 'lucide-react';
import type { ClassGroup } from '../types';

export interface ClassScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classe: ClassGroup | null;
}

export function ClassScheduleDialog({ open, onOpenChange, classe }: ClassScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Présences — {classe?.name}</DialogTitle>
          <DialogDescription>Suivi et validation des présences de cette classe</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-8">
          <div className="p-3 rounded-2xl bg-blue-50 mb-4">
            <ClipboardList className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-slate-500 max-w-sm mb-5">
            La gestion des présences se fait dans la section dédiée, où vous pouvez filtrer par classe,
            consulter les justifications et valider les statuts.
          </p>
          <Link href="/admin/attendance">
            <Button onClick={() => onOpenChange(false)}>
              Ouvrir les présences
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
