"use client";

import { Sidebar } from "@/components/student/sidebar";
import { MobileMenuButton } from "@/components/student/MobileMenuButton"
import { WeeklySchedule } from "@/components/student/weekly-schedule";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";


// Create a client
const queryClient = new QueryClient();

const SchedulePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MobileMenuButton
        isOpen={isMobileMenuOpen}
        toggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <Sidebar isOpen={isMobileMenuOpen} />
      <div className="md:ml-64 p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Emploi du temps</h1>
          <p className="text-gray-300">
            Consultez votre emploi du temps hebdomadaire
          </p>
        </div>
        <WeeklySchedule />

        <footer className="border-t border-gray-700 bg-[#001B4D] py-4">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} EduManager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SchedulePage;