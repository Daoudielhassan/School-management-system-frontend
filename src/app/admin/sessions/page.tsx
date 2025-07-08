'use client';

import { useCallback, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import CustomSidebar from "@/components/admin/CustomSidebar";
import SessionManagement from "@/components/admin/SessionManagement";

export default function AdminSessionsPage() {
    const [isSidebarOpen, setIsSidebarOpen] =useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    return (
        <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
            <div style={{ display: "flex" }}>
                <CustomSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
                <AdminHeader toggleSidebar={toggleSidebar} />

                <main className="grid grid-cols-1 gap-6 mb-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Session Management</h1>
                    <SessionManagement />
                </main>
            </div>
        </div>
    );
} 