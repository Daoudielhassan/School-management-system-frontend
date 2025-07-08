"use client";

import { Sidebar } from "@/components/student/sidebar";
import { MobileMenuButton } from "@/components/student/MobileMenuButton"
import { WeeklySchedule } from "@/components/student/weekly-schedule";
import { useState } from "react";
import { useStudent } from "@/context/StudentContext";

const SchedulePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { studentData } = useStudent();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileMenuButton
        isOpen={isMobileMenuOpen}
        toggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <Sidebar isOpen={isMobileMenuOpen} />
      <div className="md:ml-64 p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Emploi du temps</h1>
          <p className="text-gray-500">
            Consultez votre emploi du temps hebdomadaire
          </p>
        </div>
        <WeeklySchedule 
          departmentId={studentData?.departmentId} 
          classeId={studentData?.classeId} 
        />
      </div>
    </div>
  );
};

export default SchedulePage;