'use client';

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/admin/CustomSidebar";
import Header from "@/components/admin/dashboard/Header";
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
    const [users, setUsers] = useState<User[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/users");
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError("Error fetching users. Please try again.");
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex flex-col flex-1">
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center mt-8">{error}</div>
                ) : (
                    <UserManagement users={users} />
                )}
            </div>
        </div>
    );
}