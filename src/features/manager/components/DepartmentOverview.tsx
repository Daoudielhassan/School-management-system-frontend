'use client';

import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { useDepartmentClassGroups, useDepartmentAttendance } from '../hooks/useDepartment';
import { DepartmentClassGroupsTable } from './DepartmentClassGroupsTable';
import { SessionScheduleBoard } from './SessionScheduleBoard';
import { DepartmentAttendanceTable } from './DepartmentAttendanceTable';
import { SessionAttendanceSheet } from './SessionAttendanceSheet';

export function DepartmentOverview() {
  const classGroupsQuery = useDepartmentClassGroups();
  const attendanceQuery = useDepartmentAttendance();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Département"
        description="Classes, sessions et présences de votre département"
      />

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

            <TabsContent value="sessions">
              <SessionScheduleBoard />
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
    </div>
  );
}
