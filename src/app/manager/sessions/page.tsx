'use client';

import React from 'react';
import CustomSidebar from "@/components/admin/CustomSidebar";
import SessionManagement from "@/components/shared/SessionManagement";

export default function ManagerSessionsPage() {
  return (
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
      <div style={{ display: "flex" }}>
        <CustomSidebar isOpen={true} onClose={() => {}} />
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
        <SessionManagement />
      </div>
    </div>
  );
} 