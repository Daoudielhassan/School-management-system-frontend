// components/Header.tsx
"use client"
import { useStudent } from "@/context/StudentContext"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScheduleCard } from "@/components/ScheduleCard"

export const Header = () => {
  const { studentData } = useStudent() // Access student data from the context

  if (!studentData) return <div>Loading...</div> // Show loading if data is not available

  return (
    <div>
      {/* Profile and Header Content */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-10 md:pt-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {studentData.firstName}!</h1>
          <p className="text-gray-600 font-normal">
            "Success is not final, failure is not fatal: It is the courage to continue that counts."
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <Button variant="ghost" size="icon" className="mr-2 relative hover:bg-gray-200 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
          </Button>
          <Avatar className="h-12 w-12 border-2 border-cyan-400">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Student" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700">
              {studentData.firstName.charAt(0)}{studentData.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

    </div>
  )
}
