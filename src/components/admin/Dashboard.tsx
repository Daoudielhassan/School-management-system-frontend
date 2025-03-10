import { useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import DashboardStats from "./dashboard/DashboardStats";
import UserActivityCard from "./dashboard/UserActivityCard";
import AttendanceOverviewCard from "./dashboard/AttendanceOverviewCard";
import UserManagementCard from "./dashboard/UserManagementCard";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#0A192F] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A192F]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-gray-400 mt-2">Welcome back, Admin. Here's what's happening today.</p>
            </div>
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* <UserActivityCard /> */}
              <AttendanceOverviewCard />
            </div>
            <UserManagementCard /> 
          </div>
        </main>
      </div>
    </div>
  );
}