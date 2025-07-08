'use client'

import { useState } from "react";
import CustomSidebar from "./CustomSidebar";
import AdminHeader from "./AdminHeader";
import DashboardStats from "./dashboard/DashboardStats";
import UserManagementCard from "./dashboard/UserManagementCard";

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
          <div style={{ display: "flex" }}>
            <CustomSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
                <AdminHeader toggleSidebar={() => {}} />
                <DashboardStats />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* <UserActivityCard /> */}
                  {/*<AttendanceOverviewCard />*/}
                </div>
                <UserManagementCard />
          </div>
        </div>
      );
    
}