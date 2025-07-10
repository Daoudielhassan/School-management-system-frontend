"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import frLocale from "@fullcalendar/core/locales/fr"

type Session = {
  id: number
  subject: { name: string }
  instructor: { firstName: string; lastName: string }
  roomNumber: string
  sessionDate: string
  startTime: string
  endTime: string
  sessionType: "Cours" | "TP" | "TD" | "Examen"
}

interface WeeklyScheduleProps {
  departmentId?: number
  classeId?: number
}

const sessionColors: Record<Session["sessionType"], string> = {
  Cours: "#3B82F6",
  TP: "#10B981",
  TD: "#FACC15",
  Examen: "#EF4444"
}

export const WeeklySchedule = ({ departmentId, classeId }: WeeklyScheduleProps) => {
  const [scheduleData, setScheduleData] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [calendarView, setCalendarView] = useState<"timeGridWeek" | "timeGridDay">("timeGridWeek")

  // Responsive view detection
  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 768) {
        setCalendarView("timeGridDay")
      } else {
        setCalendarView("timeGridWeek")
      }
    }

    updateView()
    window.addEventListener("resize", updateView)
    return () => window.removeEventListener("resize", updateView)
  }, [])

  const fetchScheduleData = async (departmentId: number, classeId: number, token: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      if (!response.ok) throw new Error("Erreur lors du chargement de l'emploi du temps.")
      const data = await response.json()
      setScheduleData(data)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (departmentId && classeId && token) {
      fetchScheduleData(departmentId, classeId, token)
    }
  }, [departmentId, classeId, token])

  const calendarEvents = scheduleData.map((session) => ({
    id: String(session.id),
    title: session.subject.name,
    start: `${session.sessionDate}T${session.startTime}`,
    end: `${session.sessionDate}T${session.endTime}`,
    backgroundColor: sessionColors[session.sessionType],
    extendedProps: session
  }))

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Emploi du Temps</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          windowResize={(arg) => {
            if (arg.view.type !== calendarView) {
              arg.view.calendar.changeView(calendarView)
            }
          }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          locale={frLocale}
          events={calendarEvents}
          eventClick={(info) => {
            setSelectedSession(info.event.extendedProps as Session)
          }}
          height="auto"
        />
      )}

      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-2">{selectedSession.subject.name}</h3>
            <p><strong>Professeur:</strong> {selectedSession.instructor.firstName} {selectedSession.instructor.lastName}</p>
            <p><strong>Type:</strong> {selectedSession.sessionType}</p>
            <p><strong>Salle:</strong> {selectedSession.roomNumber}</p>
            <p><strong>Date:</strong> {selectedSession.sessionDate}</p>
            <p><strong>Heure:</strong> {selectedSession.startTime} - {selectedSession.endTime}</p>
            <button
              onClick={() => setSelectedSession(null)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Fermer
            </button>
                              </div>
                            </div>
                          )}
                        </div>
  )
}
