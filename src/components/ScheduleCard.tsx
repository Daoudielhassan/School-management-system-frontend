// components/ScheduleCard.tsx
"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const scheduleData = [
  { time: "09:00 - 10:30", title: "Advanced Mathematics", location: "Room 301", status: "Completed" },
  { time: "11:00 - 12:30", title: "Computer Science", location: "Lab 102", status: "Current" },
  { time: "14:00 - 15:30", title: "Physics", location: "Room 205", status: "Upcoming" },
]

export const ScheduleCard = () => (
  <Card className="bg-white border-gray-200 shadow-md col-span-1 lg:col-span-2">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="font-heading">Today's Schedule</CardTitle>
        <CardDescription className="text-gray-600 font-body">Monday, March 3, 2025</CardDescription>
      </div>
      <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5">
        View All <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      {scheduleData.map((class_, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center">
              <div className="w-1 h-12 rounded-full mr-4 bg-gradient-to-b from-pink-500 to-cyan-400" />
              <div>
                <p className="font-medium">{class_.title}</p>
                <p className="text-sm text-gray-600">{class_.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{class_.time}</p>
              <Badge className={class_.status === "Completed" ? "bg-green-100 text-green-800 hover:bg-green-200" : class_.status === "Current" ? "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}>
                {class_.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)