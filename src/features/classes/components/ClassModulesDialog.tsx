'use client';

/**
 * Read-only modules & subjects browser for a class's department.
 * Presentational — data is passed in; selectors derive the per-module view.
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { modulesByDepartment, subjectsByModule } from '../lib/class-selectors';
import type { ClassGroup, Module, Subject } from '../types';

export interface ClassModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classe: ClassGroup | null;
  modules: Module[];
  subjects: Subject[];
}

export function ClassModulesDialog({
  open,
  onOpenChange,
  classe,
  modules,
  subjects,
}: ClassModulesDialogProps) {
  const deptModules = classe ? modulesByDepartment(modules, classe.departmentId) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Modules &amp; matières</DialogTitle>
          <DialogDescription>Modules et matières du département de {classe?.name}</DialogDescription>
        </DialogHeader>

        {classe && (
          <Tabs defaultValue="modules" className="w-full">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="subjects">Matières</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              {deptModules.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun module pour ce département.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deptModules.map((module) => (
                    <Card key={module.id} className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-800">{module.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500">
                          {subjectsByModule(subjects, module.id).length} matières
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptModules.flatMap((module) =>
                  subjectsByModule(subjects, module.id).map((subject) => (
                    <Card key={subject.id} className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-800">{subject.name}</CardTitle>
                        <CardDescription>{module.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500">
                          {subject.description || 'Aucune description'}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
