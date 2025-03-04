// components/Sidebar.tsx
"use client"
import { NavItem } from "./NavItem"
import { Button } from "@/components/ui/button"
import { LogOut, Calendar, Home, BookOpen, BarChart2, Mail, Award, User, Settings } from "lucide-react"

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Calendar, label: "Schedule" },
  { icon: BookOpen, label: "Courses" },
  { icon: BarChart2, label: "Grades" },
  { icon: Mail, label: "Messages" },
  { icon: Award, label: "Achievements" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
]

export const Sidebar = ({ isOpen }: { isOpen: boolean }) => (
  <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-gray-100 border-r border-gray-200 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-pink-600 bg-clip-text text-transparent">
          EduPulse
        </h2>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => (
          <NavItem key={index} {...item} />
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-200">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  </div>
)