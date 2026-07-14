"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_ENDPOINTS, apiGet } from "@/config/api"

// Define the admin data type
type AdminData = {
    id: string | number
    userId: string | number
    employeeNumber: string
    firstname: string
    lastname: string
    email: string
    phone?: string
    officeLocation?: string
    status: string
    username?: string
    createdAt?: string
    updatedAt?: string
}

interface AdminContextType {
    adminData: AdminData | null
    isLoading: boolean
    error: string | null
    fetchAdminData: () => Promise<void>
}

// Create the context with default values
const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Context provider component
export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [adminData, setAdminData] = useState<AdminData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { token, role, isAuthenticated, userId } = useAuth()

    // Fetch admin data from the API
    const fetchAdminData = async () => {
        if (!isAuthenticated || role !== "ADMIN" || !userId) {
            setError("Not authorized to access admin data")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await apiGet(API_ENDPOINTS.USERS.BY_ID(userId), token!)

            const normalizedAdmin: AdminData = {
                id: data?.id ?? userId,
                userId: data?.id ?? userId,
                employeeNumber: data?.employeeNumber ?? '',
                firstname: data?.firstname ?? data?.firstName ?? '',
                lastname: data?.lastname ?? data?.lastName ?? '',
                email: data?.email ?? '',
                phone: data?.phone,
                officeLocation: data?.officeLocation,
                status: data?.status ?? 'ACTIVE',
                username: data?.username,
                createdAt: data?.createdAt,
                updatedAt: data?.updatedAt,
            }

            setAdminData(normalizedAdmin)
        } catch (err: any) {
            console.error('Error fetching admin data:', err)
            setError(err.message || "Failed to fetch admin data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated && role === "ADMIN" && userId) {
            fetchAdminData()
        }
    }, [isAuthenticated, role, userId])

    return (
        <AdminContext.Provider value={{
            adminData,
            isLoading,
            error,
            fetchAdminData
        }}>
            {children}
        </AdminContext.Provider>
    )
}

// Custom hook to use the admin context
export function useAdmin() {
    const context = useContext(AdminContext)
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider")
    }
    return context
}
