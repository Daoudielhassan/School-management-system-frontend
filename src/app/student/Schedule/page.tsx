"use client";

import CustomSidebar from "@/components/admin/dashboard/CustomSidebar";
import { WeeklySchedule } from "@/components/weekly-schedule";
import { QueryClient, QueryClientProvider } from "react-query";

// Create a client
const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
        <CustomSidebar />
        <div className="flex flex-col flex-1 h-screen">
          <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Emploi du temps</h1>
              <p className="text-gray-300">
                Consultez votre emploi du temps hebdomadaire
              </p>
            </div>
            <WeeklySchedule />
          </main>
          <footer className="border-t border-gray-700 bg-[#001B4D] py-4">
            <div className="container mx-auto px-4 md:px-6">
              <p className="text-center text-sm text-gray-400">
                © {new Date().getFullYear()} EduManager. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  );
}