'use client';

/**
 * Merged Manager screen for the academic structure: each department owns its
 * own modules (department/level/semester baked directly onto TeachingModule),
 * and subjects belong to a module. The department is always resolved
 * server-side from the manager's own profile — never passed by the client.
 */
import { Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ModulesManager } from '@/features/modules/components';
import { SubjectsManager } from '@/features/subjects/components';

export function AcademicStructureManager() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title="Structure académique"
        description="Modules et matières de votre département"
      />

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
