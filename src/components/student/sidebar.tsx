"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Calendar, Home, BookOpen, BarChart2, Mail, Award, User, Settings } from "lucide-react"

const BASE_URL = "http://localhost:3000/student"

const navItems = [
  { icon: Home, label: "Tableau de bord", href: `${BASE_URL}/` },
  { icon: Calendar, label: "Emploi du temps", href: `${BASE_URL}/Schedule` },
  { icon: BookOpen, label: "Cours", href: `${BASE_URL}/courses` },
  { icon: BarChart2, label: "Notes", href: `${BASE_URL}/grades` },
  { icon: Mail, label: "Messages", href: `${BASE_URL}/messages` },
  { icon: User, label: "Profil", href: `${BASE_URL}/profile` },
  { icon: Settings, label: "Paramètres", href: `${BASE_URL}/settings` },
]

export const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const pathname = usePathname()

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-gray-100 border-r border-gray-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-pink-600 bg-clip-text text-transparent">
            EduPulse
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === new URL(href).pathname
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition ${
                  isActive ? "bg-cyan-500 text-white" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-4 mt-auto">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-200">
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}