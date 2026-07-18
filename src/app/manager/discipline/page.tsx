'use client';

import { DisciplineManager } from '@/features/discipline/components';
import { useDepartmentStudents } from '@/features/manager';

export default function ManagerDisciplinePage() {
  const { students } = useDepartmentStudents();
  return <DisciplineManager students={students} />;
}
