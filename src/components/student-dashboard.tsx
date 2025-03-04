// app/student-dashboard/page.tsx
"use client"
import { useState, useEffect } from "react"
import { MobileMenuButton } from "@/components/MobileMenuButton"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { StatCard } from "@/components/StatCard"
import { ScheduleCard } from "@/components/ScheduleCard"
import { MessagesCard } from "@/components/MessagesCard"
import { AttendanceCard } from "@/components/AttendanceCard"
import { AssignmentsCard } from "@/components/AssignmentsCard"
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
          <StatCard
            title="Attendance"
            value="87%"
            icon={Clock}
            color="from-cyan-500 to-blue-600"
          />
          {/* Add other StatCards */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScheduleCard />
          <MessagesCard />
          <AttendanceCard progress={progress} />
          <AssignmentsCard />
        </div>
      </div>
    </div>
  )
}