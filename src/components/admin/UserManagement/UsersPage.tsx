'use client';

import { useCallback, useState } from "react";
import Sidebar from "@/components/admin/CustomSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import UserManagement from "@/components/admin/UserManagement/UserManagement";
// Create a simple spinner component inline
import { Loader2 } from "lucide-react";

const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={`animate-spin ${className || ""}`} />
);

interface User {
    id: number;
    username: string;
    email: string;
    identity: string;
}

export default function UsersPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminHeader toggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-y-auto p-6">
                    <UserManagement />
                </main>
            </div>
        </div>
    );
}