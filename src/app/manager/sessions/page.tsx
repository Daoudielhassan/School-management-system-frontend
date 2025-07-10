'use client';

import React from 'react';
import SessionManagement from "@/components/shared/SessionManagement";

export default function ManagerSessionsPage() {
  return (
    <div className="min-h-screen bg-[#00246B] text-[#FFFFFF]">
      <div className="p-6 bg-[#FFFFFF] text-black">
        <SessionManagement />
      </div>
    </div>
  );
}