'use client';

/**
 * Merged Manager screen for the academic structure: each department owns its
 * own modules (department/level/semester baked directly onto TeachingModule),
 * and subjects belong to a module. The department is always resolved
 * server-side from the manager's own profile — never passed by the client.
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModulesManager } from '@/features/modules/components';
import { SubjectsManager } from '@/features/subjects/components';

export function AcademicStructureManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Structure académique</h1>
        <p className="text-slate-500 mt-1">Modules et matières de votre département</p>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="subjects">Matières</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="pt-4">
          <ModulesManager />
        </TabsContent>

        <TabsContent value="subjects" className="pt-4">
          <SubjectsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
