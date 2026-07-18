'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDepartmentClassGroups, useDepartmentSessions, useDepartmentAttendance } from '../hooks/useDepartment';
import { DepartmentClassGroupsTable } from './DepartmentClassGroupsTable';
import { DepartmentSessionsTable } from './DepartmentSessionsTable';
import { DepartmentAttendanceTable } from './DepartmentAttendanceTable';
import { CreateSessionDialog } from './CreateSessionDialog';
import { SessionAttendanceSheet } from './SessionAttendanceSheet';

export function DepartmentOverview() {
  const classGroupsQuery = useDepartmentClassGroups();
  const sessionsQuery = useDepartmentSessions();
  const attendanceQuery = useDepartmentAttendance();
  const [createSessionOpen, setCreateSessionOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Département</h1>
        <p className="text-slate-500 mt-1">Classes, sessions et présences de votre département</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="classes">
            <TabsList>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="attendance">Présences</TabsTrigger>
              <TabsTrigger value="attendance-sheet">Feuille de présence</TabsTrigger>
            </TabsList>

            <TabsContent value="classes">
              <DepartmentClassGroupsTable
                classGroups={classGroupsQuery.data ?? []}
                isLoading={classGroupsQuery.isLoading}
                isError={classGroupsQuery.isError}
                onRetry={classGroupsQuery.refetch}
              />
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setCreateSessionOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nouvelle séance
                </Button>
              </div>
              <DepartmentSessionsTable
                sessions={sessionsQuery.data ?? []}
                isLoading={sessionsQuery.isLoading}
                isError={sessionsQuery.isError}
                onRetry={sessionsQuery.refetch}
              />
            </TabsContent>

            <TabsContent value="attendance">
              <DepartmentAttendanceTable
                records={attendanceQuery.data ?? []}
                isLoading={attendanceQuery.isLoading}
                isError={attendanceQuery.isError}
                onRetry={attendanceQuery.refetch}
              />
            </TabsContent>

            <TabsContent value="attendance-sheet">
              <SessionAttendanceSheet />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateSessionDialog open={createSessionOpen} onOpenChange={setCreateSessionOpen} />
    </div>
  );
}
