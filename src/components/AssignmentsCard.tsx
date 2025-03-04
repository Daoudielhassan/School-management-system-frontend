// components/AssignmentsCard.tsx
"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const assignmentsData = [
  { title: "Research Paper", subject: "Computer Science", dueDate: "Tomorrow", priority: "High" },
  { title: "Problem Set", subject: "Mathematics", dueDate: "Mar 5", priority: "Medium" },
  { title: "Lab Report", subject: "Physics", dueDate: "Mar 7", priority: "Low" },
]

export const AssignmentsCard = () => (
  <Card className="bg-white border-gray-200 shadow-md">
    <CardHeader>
      <CardTitle className="font-heading">Upcoming Assignments</CardTitle>
      <CardDescription className="text-gray-600 font-body">Due this week</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {assignmentsData.map((assignment, index) => (
          <div key={index} className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div
              className={`w-2 h-10 rounded-full mr-3 ${
                assignment.priority === "High"
                  ? "bg-red-500"
                  : assignment.priority === "Medium"
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
            />
            <div className="flex-1">
              <p className="font-medium">{assignment.title}</p>
              <p className="text-sm text-gray-600">{assignment.subject}</p>
            </div>
            <Badge className="bg-gray-100 hover:bg-gray-200 text-gray-900">{assignment.dueDate}</Badge>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter className="pt-0">
      <Button variant="outline" className="w-full border-gray-300 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
        View All Assignments
      </Button>
    </CardFooter>
  </Card>
)