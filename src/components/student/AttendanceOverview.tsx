import { useEffect, useState } from "react"
import { AttendanceCard } from "@/components/student/AttendanceCard"
import { useStudent } from "@/context/StudentContext"

export const AttendanceOverview = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { studentData } = useStudent()

  // Fetch attendance data based on student ID
  const fetchAttendanceData = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/attendance/students/${id}`)
      const data = await response.json()

      // Ensure sessionDate is properly formatted before filtering/sorting
      const validData = data.filter((attendance: any) => attendance.sessionDate)

      // Sort attendance records by sessionDate (most recent first)
      const sortedData = validData.sort((a: any, b: any) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      )

      // Select the most recent 5 records
      const recentData = sortedData.slice(0, 5)

      // Transform the data
      const formattedData = recentData.map((attendance: any) => ({
        subject: attendance.subjectName,
        attendanceStatus: attendance.status === "non" ? "Non justifié" : "Justifié",
        sessionDate: attendance.sessionDate,
        startTime: attendance.startTime,
        endTime: attendance.endTime
      }))

      setAttendanceData(formattedData)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentData) {
      fetchAttendanceData(studentData.id)
    }
  }, [studentData])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <AttendanceCard
        overallProgress={85} // TODO: Calculate dynamically
        subjectsAttendance={attendanceData}
        studentid={studentData?.id ?? 0}
      />
    </div>
  )
}
