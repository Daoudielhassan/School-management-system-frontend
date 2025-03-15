// app/student-dashboard/page.tsx
"use client"
import { useState, useEffect } from "react"
import { MobileMenuButton } from "@/components/student/MobileMenuButton"
import { Sidebar } from "@/components/student/sidebar"
import { Header } from "@/components/student/Header"
import { ScheduleCard } from "@/components/student/ScheduleCard"
import { MessagesCard } from "@/components/MessagesCard"
import { AttendanceOverview } from "./AttendanceOverview"
import { AttendanceCard } from "@/components/student/AttendanceCard"
import { AssignmentsCard } from "@/components/student/AssignmentsCard"
import { Clock } from "lucide-react"

export default function StudentDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(87), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MobileMenuButton
        isOpen={isMobileMenuOpen}
        toggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      <Sidebar isOpen={isMobileMenuOpen} />
      
      <div className="md:ml-64 p-6 md:p-8">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScheduleCard />
          {/* <MessagesCard /> */}
          <AttendanceOverview  />

          <AssignmentsCard />
        </div>
      </div>
    </div>
  )
}