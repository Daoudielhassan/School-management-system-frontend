"use client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export const MobileMenuButton = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={toggle}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    className="md:hidden text-gray-900 hover:bg-gray-200 rounded-full transition-transform duration-200"
  >
    {isOpen ? (
      <X className="h-6 w-6 transition-transform duration-200 rotate-180" />
    ) : (
      <Menu className="h-6 w-6 transition-transform duration-200" />
    )}
  </Button>
)
