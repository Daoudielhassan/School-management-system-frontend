'use client';

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/dashboard/Sidebar";
import Header from "@/components/admin/dashboard/Header";
import UserManagement from "@/components/admin/UserManagement/UserManagement";

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);

    // Fetch users from API (replace with actual API call)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users"); // Replace with real API URL
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="flex h-screen">
            {/* Sidebar (Navbar) */}
            <Sidebar isOpen={false} toggleSidebar={function(): void {
                throw new Error("Function not implemented.");
            } } />

            <div className="flex flex-col flex-1">
                {/* Header */}
                <Header toggleSidebar={() => {
                    throw new Error("Function not implemented.");
                }} />

                {/* Main Content */}
                <UserManagement users={users} />
            </div>
        </div>
    );
};

export default UsersPage;
