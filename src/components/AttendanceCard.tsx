// components/AttendanceCard.tsx
"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export const AttendanceCard = ({ progress }: { progress: number }) => (
  <Card className="bg-white border-gray-200 shadow-md col-span-1 lg:col-span-2">
    <CardHeader>
      <CardTitle className="font-heading">Attendance Overview</CardTitle>
      <CardDescription className="text-gray-600 font-body">Current semester progress</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Overall Attendance</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-pink-600 rounded-full" style={{ width: `${progress}%` }} />
          </Progress>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { subject: "Mathematics", attendance:  92 },
            { subject: "Computer Science", attendance: 87 },
            { subject: "Physics", attendance: 78 },
          ].map((subject, index) => (
            <div key={index} className="p-4 rounded-lg bg-white/5">
              <p className="text-sm text-gray-600 mb-2">{subject.subject}</p>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Attendance</span>
                <span className="text-xs font-medium">{subject.attendance}%</span>
              </div>
              <Progress value={subject.attendance} className="h-1.5 bg-gray-200">
                <div
                  className={`h-full rounded-full ${
                    subject.attendance > 90
                      ? "bg-green-500"
                      : subject.attendance > 80
                      ? "bg-cyan-500"
                      : subject.attendance > 70
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${subject.attendance}%` }}
                />
              </Progress>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)