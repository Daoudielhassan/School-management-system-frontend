"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Define the expected shape of a session object
type Session = {
  subject: { name: string }
  instructor: { firstName: string; lastName: string }
  roomNumber: string
  sessionDate: string
  startTime: string
  endTime: string
  sessionType: string
}

// Props expected by the WeeklySchedule component
interface WeeklyScheduleProps {
  departmentId?: number
  classeId?: number
}

export const WeeklySchedule = ({ departmentId, classeId }: WeeklyScheduleProps) => {
  const [scheduleData, setScheduleData] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Days of the week in French
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  // Fetch sessions from the API
  const fetchScheduleData = async (departmentId: number, classeId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`)
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'emploi du temps.")
      }
      const data = await response.json()
      setScheduleData(data)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch when props change
  useEffect(() => {
    if (departmentId && classeId) {
      fetchScheduleData(departmentId, classeId)
    }
  }, [departmentId, classeId])

  // Group sessions by weekday
  const groupedByDay = daysOfWeek.map(day => ({
    day,
    sessions: scheduleData.filter(session =>
      new Date(session.sessionDate).toLocaleDateString("fr-FR", { weekday: "long" }) === day
    )
  }))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Emploi du temps hebdomadaire</h2>
        <p className="text-sm text-gray-500">Voici vos sessions prévues cette semaine</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6 text-cyan-600" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-center text-red-500 font-medium">{error}</p>
      )}

      {/* Schedule cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupedByDay.map(({ day, sessions }) => (
          <Card
            key={day}
            className="border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold">{day}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {sessions.length > 0
                  ? `${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'}`
                  : "Aucune session"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune session prévue.</p>
              ) : (
                sessions.map((session, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white/50 border border-gray-200 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{session.subject.name}</p>
                      <Badge
                        className={
                          session.sessionType === "Cours"
                            ? "bg-green-100 text-green-800"
                            : "bg-cyan-100 text-cyan-800"
                        }
                      >
                        {session.sessionType}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">Salle : {session.roomNumber}</p>

                    <p className="text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </p>

                    <p className="text-sm text-gray-600">
                      {session.instructor.firstName} {session.instructor.lastName}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
