import { useEffect, useState } from "react"
import { AttendanceCard } from "@/components/AttendanceCard"
import { useStudent } from "@/context/StudentContext"

export const AttendanceOverview = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]) // Ensure attendanceData is always an array
  const [loading, setLoading] = useState(true)
  const { studentData } = useStudent() // Access student data from context

  // Fetch attendance data based on student ID
  const fetchAttendanceData = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/attendance/students/${id}`)
      const data = await response.json()

      // Filter data based on today's date
      const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
      const filteredData = data.filter((attendance: any) => attendance.sessionDate === today)

      // Sort the data by session date in descending order (most recent first)
      const sortedData = filteredData.sort((a: any, b: any) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())

      // Select the top 5 most recent attendance records
      const recentData = sortedData.slice(0, 5)

      // Transform data into a more usable format
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
      // Fetch attendance data when student data is available
      fetchAttendanceData(studentData.id)
    }
  }, [studentData]) // Re-run whenever studentData changes

  if (loading) return <div>Loading...</div>

  // Ensure attendanceData is not empty before passing it to the AttendanceCard
  return (
    <div>
      <AttendanceCard
        overallProgress={85} // You can calculate overall progress dynamically if needed
        subjectsAttendance={attendanceData.length > 0 ? attendanceData : []} // Pass an empty array if no data
        studentid={studentData?.id ?? 0}
      />
    </div>
  )
}
