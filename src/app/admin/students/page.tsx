'use clients';
import React from 'react';

import CustomSidebar from "@/components/admin/dashboard/CustomSidebar";
import AddStudent from '@/components/admin/UserManagement/AddStudent';
import StudentManagement from '@/components/admin/UserManagement/StudentManagement';


export default function StudentsPage() {
  return (
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
        <div style={{ display: "flex" }}>
            <CustomSidebar />
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
            <AddStudent />
            <StudentManagement />
        </div>
    </div>
  );
}