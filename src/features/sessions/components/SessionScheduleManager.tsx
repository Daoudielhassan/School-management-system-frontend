'use client';

/**
 * Department + class pickers driving the timetable (`Schedule`). Reference data
 * is reused from the departments feature — no local fetching/useEffect.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Schedule from '@/components/shared/schedule';
import { useDepartments, useDepartmentClasses } from '@/features/departments';

export function SessionScheduleManager() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const { data: departments = [], isLoading: deptLoading } = useDepartments();
  const { data: classes = [], isLoading: classLoading } = useDepartmentClasses(
    selectedDepartment || null
  );

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedClass('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {deptLoading ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    departments.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {dep.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
                disabled={!selectedDepartment || classLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classLoading ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : classes.length > 0 ? (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} (L{cls.level})
                      </SelectItem>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-gray-500">Aucune classe trouvée</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDepartment && selectedClass ? (
        <Schedule departmentId={selectedDepartment} classeId={selectedClass} />
      ) : (
        <Card className="text-center p-8">
          <p className="text-gray-600">
            Veuillez sélectionner un département et une classe pour afficher l&apos;emploi du temps.
          </p>
        </Card>
      )}
    </div>
  );
}
