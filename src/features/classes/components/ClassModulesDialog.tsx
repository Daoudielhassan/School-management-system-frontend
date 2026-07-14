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
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-purple-500/30 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Modules &amp; Subjects Management</DialogTitle>
          <DialogDescription className="text-slate-500">
            Manage modules and subjects for {classe?.name}
          </DialogDescription>
        </DialogHeader>

        {classe && (
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="bg-white/70 backdrop-blur-md border border-slate-200">
              <TabsTrigger value="modules" className="data-[state=active]:bg-purple-500/30">
                Modules
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-indigo-500/30">
                Subjects
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-pink-500/30">
                Curriculum
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptModules.map((module) => (
                  <Card key={module.id} className="bg-white/70 backdrop-blur-md border-purple-400/30">
                    <CardHeader>
                      <CardTitle className="text-purple-300">{module.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-500">
                        {subjectsByModule(subjects, module.id).length} subjects
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptModules.flatMap((module) =>
                  subjectsByModule(subjects, module.id).map((subject) => (
                    <Card
                      key={subject.id}
                      className="bg-white/70 backdrop-blur-md border-indigo-400/30"
                    >
                      <CardHeader>
                        <CardTitle className="text-indigo-300">{subject.name}</CardTitle>
                        <CardDescription className="text-slate-500">{module.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500">
                          {subject.description || 'No description'}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Curriculum Management</h3>
                <p className="text-slate-500">
                  Advanced curriculum planning and mapping coming soon...
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
