'use client';

/**
 * Attendance / schedule dialog. Currently a set of placeholders carried over
 * from the original page (feature work pending). Kept isolated so it can be
 * fleshed out — or removed — without touching the classes container.
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ClassGroup } from '../types';

export interface ClassScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classe: ClassGroup | null;
}

const PLACEHOLDERS = [
  { value: 'attendance', tab: 'Attendance Records', emoji: '📊', title: 'Attendance Management', text: 'Attendance tracking and reporting coming soon...' },
  { value: 'subjects', tab: 'Subject Allocation', emoji: '📚', title: 'Subject Allocation', text: 'Subject assignment and curriculum management coming soon...' },
  { value: 'settings', tab: 'Attendance Settings', emoji: '⚙️', title: 'Attendance Settings', text: 'Advanced attendance configuration options coming soon...' },
] as const;

export function ClassScheduleDialog({ open, onOpenChange, classe }: ClassScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-indigo-300">Class Attendance Management</DialogTitle>
          <DialogDescription className="text-slate-500">
            Manage attendance for {classe?.name}
          </DialogDescription>
        </DialogHeader>

        {classe && (
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="bg-white/70 backdrop-blur-md border border-slate-200">
              {PLACEHOLDERS.map((p) => (
                <TabsTrigger key={p.value} value={p.value} className="data-[state=active]:bg-indigo-500/30">
                  {p.tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {PLACEHOLDERS.map((p) => (
              <TabsContent key={p.value} value={p.value} className="space-y-4">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{p.emoji}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-slate-500">{p.text}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
