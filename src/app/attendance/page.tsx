"use client";

import AttendancePage from "@/components/attendance-page";
import CustomSidebar from "@/components/admin/dashboard/CustomSidebar";

export default function Home() {
    return(
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
      <div style={{ display: "flex" }}>
        <CustomSidebar />
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
        <AttendancePage/>
      </div>
    </div>


    )
}