"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, MessageSquare, Clock, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useInstructor } from "@/context/InstructorContext"
import axios from "axios"

interface DashboardStats {
  coursesCount: number
  studentsCount: number
  unreadMessages: number
  pendingRequests: number
}

interface Session {
  id: number
  courses?: {
    name: string
    class_level: string
  }
  session_date: string
  start_time: string
  room: string
}

export default function DashboardPage() {
  const { token } = useAuth()
  const { instructorData, instructorId, isLoading: instructorLoading } = useInstructor()
  const [stats, setStats] = useState<DashboardStats>({
    coursesCount: 0,
    studentsCount: 0,
    unreadMessages: 0,
    pendingRequests: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (instructorId && token) {
      loadData()
    }
  }, [instructorId, token])

  const loadData = async () => {
    if (!instructorId || !token) return

    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructors/${instructorId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(statsResponse.data)

      // Fetch upcoming sessions
      const sessionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/instructor/${instructorId}/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUpcomingSessions(sessionsResponse.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      // Set default values on error
      setStats({
        coursesCount: 0,
        studentsCount: 0,
        unreadMessages: 0,
        pendingRequests: 0,
      })
      setUpcomingSessions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading || instructorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue, {instructorData ? `Prof. ${instructorData.firstName} ${instructorData.lastName}` : "Professeur"}
        </p>
        {instructorData?.specialization && (
          <p className="text-sm text-gray-500">Spécialisation: {instructorData.specialization}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours actifs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesCount}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +1 ce semestre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsCount}</div>
            <p className="text-xs text-muted-foreground">Tous niveaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadMessages > 0 && <AlertCircle className="inline h-3 w-3 mr-1 text-orange-500" />}
              Nouveaux aujourd'hui
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes d'absence</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochains cours */}
      <Card>
        <CardHeader>
          <CardTitle>Prochains cours</CardTitle>
          <CardDescription>Vos sessions à venir cette semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{session.courses?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {session.courses?.class_level} • Salle {session.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(session.session_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{session.start_time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun cours programmé</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <BookOpen className="h-6 w-6 mb-2" />
              Nouveau cours
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Users className="h-6 w-6 mb-2" />
              Ajouter notes
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <MessageSquare className="h-6 w-6 mb-2" />
              Envoyer message
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Calendar className="h-6 w-6 mb-2" />
              Planifier session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
