"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

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

  // Fetch instructor data from the API
  const fetchInstructorData = async () => {
    if (!isAuthenticated || role !== "PROFESSEUR" || !userId) {
      setError("Not authorized to access instructor data")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructors/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setInstructorData(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch instructor data")
      } else {
        setError("An unexpected error occurred")
      }
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