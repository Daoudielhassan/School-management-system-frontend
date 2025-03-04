// components/NavItem.tsx
"use client"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export const NavItem = ({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) => (
  <Button
    variant="ghost"
    className={`w-full justify-start text-lg mb-1 group ${active ? "bg-gray-200 text-gray-900 font-bold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200 font-normal"}`}
  >
    <Icon className={`mr-3 h-5 w-5 transition-all duration-300 group-hover:text-cyan-600 ${active ? "text-cyan-600" : ""}`} />
    {label}
    {active && <div className="ml-auto w-1 h-6 bg-gradient-to-b from-pink-600 to-cyan-600 rounded-full" />}
  </Button>
)