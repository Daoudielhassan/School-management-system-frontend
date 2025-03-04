// context/StudentContext.tsx
"use client"
import { createContext, useContext, useState, useEffect } from "react"

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
  fetchStudentData: (userId: number) => Promise<void>
}

// Create the context with default values
const StudentContext = createContext<StudentContextType | undefined>(undefined)

// Context provider component
export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  // Fetch student data from the API
  const fetchStudentData = async (userId: number) => {
    const response = await fetch(`http://localhost:8080/api/students/user/${userId}`)
    const data = await response.json()
    setStudentData(data)
  }

  useEffect(() => {
    // You can set userId dynamically, for now it's hardcoded to 250
    fetchStudentData(250) // Replace with actual dynamic userId if needed
  }, [])

  return (
    <StudentContext.Provider value={{ studentData, fetchStudentData }}>
      {children}
    </StudentContext.Provider>
  )
}

// Custom hook to use the student context
export const useStudent = () => {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
