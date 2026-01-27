"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_ENDPOINTS, apiGet } from "@/lib/api-clients"

// Define the instructor data type
type InstructorData = {
  id: number
  firstName: string
  lastName: string
  email: string
  departmentId: number
  specialization: string
}

interface InstructorContextType {
  instructorData: InstructorData | null
  instructorId: number | null
  isLoading: boolean
  error: string | null
  fetchInstructorData: () => Promise<void>
}

// Create the context with default values
const InstructorContext = createContext<InstructorContextType | undefined>(undefined)

// Context provider component
export function InstructorProvider({ children }: { children: React.ReactNode }) {
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, role, isAuthenticated, userId } = useAuth()

  // Fetch instructor data from the API using microservices
  const fetchInstructorData = async () => {
    if (!isAuthenticated || role !== "PROFESSEUR" || !userId) {
      setError("Not authorized to access instructor data")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use API_ENDPOINTS for microservices
      const data = await apiGet(API_ENDPOINTS.INSTRUCTORS.BY_USER_ID(userId), token!)
      setInstructorData(data)
    } catch (err: any) {
      console.error('Error fetching instructor data:', err)
      setError(err.message || "Failed to fetch instructor data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && role === "PROFESSEUR" && userId) {
      fetchInstructorData()
    }
  }, [isAuthenticated, role, userId])

  return (
    <InstructorContext.Provider value={{
      instructorData,
      instructorId: instructorData?.id || null,
      isLoading,
      error,
      fetchInstructorData
    }}>
      {children}
    </InstructorContext.Provider>
  )
}

// Custom hook to use the instructor context
export function useInstructor() {
  const context = useContext(InstructorContext)
  if (context === undefined) {
    throw new Error("useInstructor must be used within an InstructorProvider")
  }
  return context
} 