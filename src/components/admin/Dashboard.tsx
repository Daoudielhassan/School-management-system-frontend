import { useState } from "react";
import CustomSidebar from "./dashboard/CustomSidebar";
import { Header } from "@/components/student/Header"
import DashboardStats from "./dashboard/DashboardStats";
import UserActivityCard from "./dashboard/UserActivityCard";
import AttendanceOverviewCard from "./dashboard/AttendanceOverviewCard";
import UserManagementCard from "./dashboard/UserManagementCard";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
      <div style={{ display: "flex" }}>
        <CustomSidebar />
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
            <Header />
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