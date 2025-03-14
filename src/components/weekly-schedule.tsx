"use client"

import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudent } from "@/context/StudentContext"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface Session {
  id: number
  sessionDate: string
  startTime: string
  endTime: string
  roomNumber: string
  sessionType: string
  subject: {
    id: number
    name: string
    code: string
  }
  instructor: {
    id: number
    firstName: string
    lastName: string
  }
}

interface WeeklyScheduleProps {
  departmentId?: number
  classeId?: number
  showHeader?: boolean
  showFilters?: boolean
  compact?: boolean
}

// Constants
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
const SESSION_TYPES = {
  Cours: "bg-blue-100 border-blue-300 text-blue-800",
  TD: "bg-green-100 border-green-300 text-green-800",
  TP: "bg-amber-100 border-amber-300 text-amber-800",
  Projet: "bg-purple-100 border-purple-300 text-purple-800",
  Examen: "bg-red-100 border-red-300 text-red-800",
}

// Helper functions
const getSessionStyle = (type: string) => {
  return SESSION_TYPES[type as keyof typeof SESSION_TYPES] || "bg-gray-100 border-gray-300 text-gray-800"
}

const getFrenchDay = (dateString: string) => {
  const date = new Date(dateString)
  return DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const getWeekDates = (date: Date) => {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date)
  monday.setDate(diff)

  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday)
    currentDate.setDate(monday.getDate() + i)
    weekDates.push(currentDate)
  }

  return weekDates
}

const fetchSessions = async ({ departmentId, classeId }: { departmentId: number; classeId: number }) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`,
    )
    if (!response.ok) {
      throw new Error("Failed to fetch sessions")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching sessions:", error)
    throw error
  }
}

export function WeeklySchedule({
  departmentId: propDepartmentId,
  classeId: propClasseId,
  showHeader = true,
  showFilters = true,
  compact = false,
}: WeeklyScheduleProps) {
  // Get student data from context if props are not provided
  const { studentData } = useStudent()

  const departmentId = propDepartmentId || studentData?.departmentId
  const classeId = propClasseId || studentData?.classeId

  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>(getWeekDates(currentDate))
  const [view, setView] = useState<"week" | "day" | "list">("week")
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  // Update week dates when current date changes
  useEffect(() => {
    setWeekDates(getWeekDates(currentDate))
  }, [currentDate])

  // Fetch sessions data
  const {
    data: sessions,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ["sessions", departmentId, classeId],
    () => fetchSessions({ departmentId: departmentId!, classeId: classeId! }),
    {
      enabled: !!departmentId && !!classeId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentDate(new Date())
  }

  // Get sessions for a specific day and time slot
  const getSessionForSlot = (day: string, time: string) => {
    if (!sessions) return null

    return sessions.find(
      (session: Session) => getFrenchDay(session.sessionDate) === day && session.startTime.startsWith(time),
    )
  }

  // Get all sessions for a specific day
  const getSessionsForDay = (date: Date) => {
    if (!sessions) return []

    const formattedDate = date.toISOString().split("T")[0]
    return sessions
      .filter((session: Session) => session.sessionDate.startsWith(formattedDate))
      .sort((a: Session, b: Session) => a.startTime.localeCompare(b.startTime))
  }

  // Get today's sessions
  const getTodaySessions = () => {
    if (!sessions) return []

    const today = new Date()
    const formattedToday = today.toISOString().split("T")[0]

    return sessions
      .filter((session: Session) => session.sessionDate.startsWith(formattedToday))
      .sort((a: Session, b: Session) => a.startTime.localeCompare(b.startTime))
  }

  // Render session card
  const renderSessionCard = (session: Session) => {
    return (
      <div
        key={session.id}
        className={cn("p-3 border rounded-lg mb-3 transition-all", getSessionStyle(session.sessionType))}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold">{session.subject.name}</h4>
            <Badge variant="outline" className="mt-1">
              {session.sessionType}
            </Badge>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center justify-end gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              {session.startTime} - {session.endTime}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-1 mr-3">
            <MapPin className="h-3 w-3" />
            Salle {session.roomNumber}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {session.instructor.firstName} {session.instructor.lastName}
          </div>
        </div>
      </div>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Emploi du temps</CardTitle>
          <CardDescription>Chargement de l'emploi du temps...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-[40px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (isError || !departmentId || !classeId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Emploi du temps</CardTitle>
          <CardDescription>
            {!departmentId || !classeId
              ? "Veuillez sélectionner un département et une classe"
              : "Erreur lors du chargement de l'emploi du temps"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {!departmentId || !classeId
                ? "Les informations de département et de classe sont nécessaires pour afficher l'emploi du temps."
                : "Impossible de charger les données. Veuillez réessayer plus tard."}
            </p>
            {isError && <Button onClick={() => refetch()}>Réessayer</Button>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle>Emploi du temps</CardTitle>
            <CardDescription>
              {view === "week" && `Semaine du ${formatDate(weekDates[0])} au ${formatDate(weekDates[4])}`}
              {view === "day" &&
                `${selectedDay.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`}
              {view === "list" && "Aujourd'hui"}
            </CardDescription>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Aujourd'hui
              </Button>
              <div className="flex">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="rounded-r-none">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextWeek} className="rounded-l-none">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={view} onValueChange={(value) => setView(value as "week" | "day" | "list")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="list">Aujourd'hui</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent>
        <Tabs value={view} onValueChange={(value) => setView(value as "week" | "day" | "list")}>
          <TabsList className="mb-4">
            <TabsTrigger value="week" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Semaine</span>
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Jour</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Aujourd'hui</span>
            </TabsTrigger>
          </TabsList>

          {/* Week View */}
          <TabsContent value="week" className="mt-0">
            <div className="overflow-x-auto">
              <div className={cn("grid gap-1", compact ? "min-w-[700px]" : "min-w-[900px]")}>
                {/* Header row with days */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1">
                  <div className="font-medium text-center text-gray-500 text-sm p-2"></div>
                  {weekDates.slice(0, 5).map((date, index) => (
                    <div
                      key={index}
                      className={cn(
                        "font-medium text-center p-2 rounded",
                        date.toDateString() === new Date().toDateString()
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700",
                      )}
                    >
                      <div>{DAYS[index]}</div>
                      <div className="text-sm">
                        {date.getDate()}/{date.getMonth() + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1">
                    <div className="font-medium text-right pr-2 text-sm text-gray-500 self-start pt-1">{time}</div>

                    {weekDates.slice(0, 5).map((date, dayIndex) => {
                      const day = DAYS[dayIndex]
                      const session = getSessionForSlot(day, time)

                      return (
                        <div
                          key={`${day}-${time}`}
                          className={cn(
                            "border rounded min-h-[60px] p-1 text-xs",
                            date.toDateString() === new Date().toDateString()
                              ? "bg-blue-50/30 border-blue-100"
                              : "border-gray-200",
                          )}
                        >
                          {session && (
                            <div
                              className={cn(
                                "h-full p-1 rounded border overflow-hidden",
                                getSessionStyle(session.sessionType),
                              )}
                            >
                              <div className="font-bold truncate">{session.subject.name}</div>
                              <div className="truncate">
                                {session.startTime} - {session.endTime}
                              </div>
                              <div className="truncate">Salle: {session.roomNumber}</div>
                              <div className="truncate">
                                {session.instructor.firstName} {session.instructor.lastName}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Day View */}
          <TabsContent value="day" className="mt-0">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDates.map((date, index) => (
                <Button
                  key={index}
                  variant={date.toDateString() === selectedDay.toDateString() ? "default" : "outline"}
                  className={cn(
                    "flex flex-col items-center",
                    date.toDateString() === new Date().toDateString() &&
                      date.toDateString() !== selectedDay.toDateString() &&
                      "border-blue-300",
                  )}
                  onClick={() => setSelectedDay(date)}
                >
                  <span className="text-xs">{DAYS[index].substring(0, 3)}</span>
                  <span className="text-lg font-bold">{date.getDate()}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-1">
              {getSessionsForDay(selectedDay).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Aucun cours prévu pour cette journée</p>
                </div>
              ) : (
                getSessionsForDay(selectedDay).map((session: Session) => renderSessionCard(session))
              )}
            </div>
          </TabsContent>

          {/* Today's List View */}
          <TabsContent value="list" className="mt-0">
            <div className="space-y-1">
              {getTodaySessions().length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Aucun cours prévu pour aujourd'hui</p>
                </div>
              ) : (
                getTodaySessions().map((session: Session) => renderSessionCard(session))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(SESSION_TYPES).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1 text-xs">
              <div className={cn("w-3 h-3 rounded", style.split(" ")[0])}></div>
              <span>{type}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}