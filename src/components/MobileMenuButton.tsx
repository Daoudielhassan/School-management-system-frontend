// components/MobileMenuButton.tsx
"use client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export const MobileMenuButton = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={toggle}
    className="md:hidden text-gray-900 hover:bg-gray-200 rounded-full"
  >
    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </Button>
)