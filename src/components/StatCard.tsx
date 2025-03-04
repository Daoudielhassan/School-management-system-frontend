// components/StatCard.tsx
"use client"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

export const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: LucideIcon; color: string }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-lg overflow-hidden">
    <CardContent className="p-6 flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-white/70">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
)