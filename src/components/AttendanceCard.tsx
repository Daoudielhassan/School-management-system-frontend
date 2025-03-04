"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export const AttendanceCard = ({
  overallProgress,
  subjectsAttendance,
  studentid
}: {
  overallProgress: number
  subjectsAttendance: { subject: string; attendanceStatus: string; sessionDate: string; startTime: string; endTime: string }[]
  studentid: number
}) => (
  <Card className="bg-white border-gray-200 shadow-md col-span-1 lg:col-span-2">
    <CardHeader>
      <CardTitle className="font-heading">Attendance Overview</CardTitle>
      <CardDescription className="text-gray-600 font-body">Recent Attendance Records</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Overall Attendance</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-pink-600 rounded-full" style={{ width: `${overallProgress}%` }} />
          </Progress>
          <h1 className="text-xs text-gray-500">Last 5 attendance records
          </h1>
          <h1 className="text-xs text-gray-500">
          {subjectsAttendance.length === 0 && <p>No attendance records found for student ID {studentid}</p>}
          </h1>
        </div>

        {/* Displaying the list of attendance records */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectsAttendance.map((attendance, index) => (
            <div key={index} className="p-4 rounded-lg bg-white/5">
              <p className="text-sm text-gray-600 mb-2">{attendance.subject}</p>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Status</span>
                <span className="text-xs font-medium">{attendance.attendanceStatus}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Session Date</span>
                <span className="text-xs font-medium">{attendance.sessionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Time</span>
                <span className="text-xs font-medium">{attendance.startTime} - {attendance.endTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)
