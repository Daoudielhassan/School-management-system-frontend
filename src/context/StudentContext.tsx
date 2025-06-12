// context/StudentContext.tsx
"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import axios from "axios"

// Define the student data type
type StudentData = {
  id: number
  firstName: string
  lastName: string
  email: string
  departmentId: number
  classeId: number
  // Add any other student properties you need
}

interface StudentContextType {
  studentData: StudentData | null
  isLoading: boolean
  error: string | null
  fetchStudentData: () => Promise<void>
}

// Create the context with default values
const StudentContext = createContext<StudentContextType | undefined>(undefined)

// Context provider component
export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, role, isAuthenticated, userId } = useAuth()

  // Fetch student data from the API
  const fetchStudentData = async () => {
    if (!isAuthenticated || role !== "ETUDIANT" || !userId) {
      setError("Not authorized to access student data")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://localhost:8080/api/students/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setStudentData(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch student data")
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && role === "ETUDIANT" && userId) {
      fetchStudentData()
    }
  }, [isAuthenticated, role, userId])

  return (
    <StudentContext.Provider value={{ studentData, isLoading, error, fetchStudentData }}>
      {children}
    </StudentContext.Provider>
  )
}

// Custom hook to use the student context
export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
