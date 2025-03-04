"use client"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileMenuButton } from "@/components/MobileMenuButton"

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle sidebar
  const toggleSidebar = () => setIsOpen(!isOpen)

  // Close sidebar when pressing Esc key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar (Hidden on mobile unless open) */}
      <Sidebar isOpen={isOpen} />

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Menu Button */}
        <header className="p-4 flex items-center md:hidden">
          <MobileMenuButton isOpen={isOpen} toggle={toggleSidebar} />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
