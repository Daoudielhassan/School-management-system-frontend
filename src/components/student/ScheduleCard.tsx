"use client"
import { useState, useEffect } from "react"
import { useStudent } from "@/context/StudentContext"
import { useAuth } from "@/context/AuthContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const fetchScheduleData = async (departmentId: number, classeId: number, token: string | null) => {
  const response = await fetch(
    `http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
  if (!response.ok) throw new Error("Failed to fetch schedule data")
  const text = await response.text()
  if (!text) return []
  return JSON.parse(text)
}

export const ScheduleCard = () => {
  const { studentData } = useStudent() // Accéder aux données de l'étudiant depuis le contexte
  const { token } = useAuth()
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    setCurrentDate(today.toLocaleDateString(undefined, options))

    if (studentData && token) {
      // Récupérer les données de l'emploi du temps lorsque les données de l'étudiant sont disponibles
      const loadSchedule = async () => {
        const data = await fetchScheduleData(studentData.departmentId, studentData.classeId, token)
        setScheduleData(Array.isArray(data) ? data : [])
      }
      loadSchedule()
    }
  }, [studentData, token])

  // Filtrer les données de l'emploi du temps pour n'inclure que les sessions d'aujourd'hui
  const todaySessions = scheduleData.filter((session) => {
    const sessionDate = new Date(session.sessionDate)
    const today = new Date()

    // Comparer uniquement la partie date (en ignorant l'heure)
    return (
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate()
    )
  })

  return (
    <Card className="bg-white border-gray-200 shadow-md col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-heading">Emploi du temps d'aujourd'hui</CardTitle>
          <CardDescription className="text-gray-600 font-body">{currentDate}</CardDescription>
        </div>
        <Link href="/student/Schedule">
        <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5" >
          Voir tout <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {todaySessions.length === 0 ? (
          <p className="text-center text-gray-500">Aucune session aujourd'hui</p>
        ) : (
          todaySessions.map((session, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="w-1 h-12 rounded-full mr-4 bg-gradient-to-b from-pink-500 to-cyan-400" />
                  <div>
                    <p className="font-medium">{session.subject.name}</p>
                    <p className="text-sm text-gray-600">{session.roomNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{session.sessionDate} - {session.startTime} à {session.endTime}</p>
                  <p className="text-sm text-gray-600">{session.instructor.firstName} {session.instructor.lastName}</p>
                  <Badge className={session.sessionType === "Cours" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"}>
                    {session.sessionType}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}