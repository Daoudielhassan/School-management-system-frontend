"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Download,
  Search,
  UserCheck,
  UserX,
  BookOpen,
  MapPin,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface SessionWithDetails {
  id: number
  subject_id: number
  session_date: string
  class_id: number
  sessiontype: string
  start_time: string
  end_time?: string
  room_number?: string
  subjects?: { name: string; description?: string }
  classes?: { name: string; level: number }
  instructors?: { firstname: string; lastname: string }
}

interface AttendanceRecord {
  id?: number
  student_id: number
  session_id: number
  status: "non" | "oui"
  students?: {
    id: number
    firstname: string
    lastname: string
    phonenumber: string
  }
}

export default function AttendancePage() {
  const { userId, token } = useAuth()
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    todaySessions: 0,
    weeklyAttendance: 0,
    absenceRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (userId && token) {
      loadData()
    }
  }, [userId, token])

  const loadData = async () => {
    if (!userId || !token) return

    try {
      setLoading(true)
      const [sessionsData, statsData] = await Promise.all([
        axios.get(`http://localhost:8080/api/sessions/instructor/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data).catch((err) => {
          console.log("Erreur sessions:", err)
          return []
        }),
        axios.get(`http://localhost:8080/api/instructors/${userId}/attendance-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data).catch((err) => {
          console.log("Erreur stats:", err)
          return { totalSessions: 0, todaySessions: 0, weeklyAttendance: 0, absenceRate: 0 }
        }),
      ])
      setSessions(sessionsData || [])
      setStats(statsData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      setSessions([])
      setStats({ totalSessions: 0, todaySessions: 0, weeklyAttendance: 0, absenceRate: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSelect = async (sessionId: string) => {
    if (!userId || !token) return

    const session = sessions.find((s) => s.id === Number.parseInt(sessionId))
    if (!session) return

    setSelectedSession(session)
    setLoading(true)

    try {
      // Récupérer les présences existantes
      let attendanceData = await axios.get(`http://localhost:8080/api/attendance/session/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.data).catch((err) => {
        console.log("Erreur présences:", err)
        return []
      })

      // Si aucune présence n'existe, initialiser avec tous les étudiants de la classe
      if (!attendanceData || attendanceData.length === 0) {
        attendanceData = await axios.post(`http://localhost:8080/api/attendance/initialize/${session.id}`, {
          classId: session.class_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data).catch((err) => {
          console.log("Erreur initialisation:", err)
          return []
        })
      }

      setAttendanceRecords(attendanceData || [])
    } catch (error) {
      console.error("Erreur lors du chargement des présences:", error)
      setAttendanceRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: number, newStatus: "non" | "oui") => {
    setAttendanceRecords((prev) =>
      prev.map((record) => (record.student_id === studentId ? { ...record, status: newStatus } : record)),
    )
  }

  const handleBulkStatusChange = (status: "non" | "oui") => {
    const filteredRecords = getFilteredRecords()
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        filteredRecords.some((fr) => fr.student_id === record.student_id) ? { ...record, status } : record,
      ),
    )
  }

  const handleSaveAttendance = async () => {
    if (!selectedSession || !token) return

    setSaving(true)
    try {
      const attendanceData = attendanceRecords.map((record) => ({
        student_id: record.student_id,
        session_id: selectedSession.id,
        status: record.status,
      }))

      await axios.post(`http://localhost:8080/api/attendance/bulk-update`, attendanceData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Recharger les statistiques
      const newStats = await axios.get(`http://localhost:8080/api/instructors/${userId}/attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.data)
      setStats(newStats)

      alert("Présences enregistrées avec succès!")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      alert("Erreur lors de l'enregistrement des présences")
    } finally {
      setSaving(false)
    }
  }

  const getFilteredRecords = () => {
    return attendanceRecords.filter((record) => {
      const student = record.students
      if (!student) return false

      const matchesSearch =
        searchTerm === "" || `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }

  const getStatusStats = () => {
    const total = attendanceRecords.length
    const present = attendanceRecords.filter((r) => r.status === "oui").length
    const absent = attendanceRecords.filter((r) => r.status === "non").length

    return { total, present, absent }
  }

  const getStatusColor = (status: "non" | "oui") => {
    return status === "oui" ? "text-green-600" : "text-red-600"
  }

  const getStatusIcon = (status: "non" | "oui") => {
    return status === "oui" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  if (loading && !selectedSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des présences</h1>
          <p className="text-gray-600">Enregistrez les présences de vos étudiants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Sessions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.todaySessions}</div>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.weeklyAttendance}</div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.absenceRate}%</div>
                <p className="text-xs text-muted-foreground">Taux d'absence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Session actuelle</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Sélection de session */}
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner une session</CardTitle>
              <CardDescription>Choisissez la session pour laquelle enregistrer les présences</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleSessionSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{session.sessiontype}</Badge>
                        <span>
                          {session.subjects?.name} - {session.classes?.name} -
                          {format(new Date(session.session_date), "dd/MM/yyyy", { locale: fr })} -{session.start_time}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Détails de la session sélectionnée */}
          {selectedSession && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {selectedSession.subjects?.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedSession.classes?.name} - Niveau {selectedSession.classes?.level}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{selectedSession.sessiontype}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(new Date(selectedSession.session_date), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedSession.start_time} - {selectedSession.end_time || "N/A"}
                      </span>
                    </div>
                    {selectedSession.room_number && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Salle {selectedSession.room_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques de présence */}
              {attendanceRecords.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{getStatusStats().total}</div>
                          <p className="text-xs text-muted-foreground">Total étudiants</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">{getStatusStats().present}</div>
                          <p className="text-xs text-muted-foreground">Présents</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <UserX className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="text-2xl font-bold text-red-600">{getStatusStats().absent}</div>
                          <p className="text-xs text-muted-foreground">Absents</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filtres et actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Rechercher un étudiant..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="oui">Présents</SelectItem>
                        <SelectItem value="non">Absents</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("oui")}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Tous présents
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("non")}>
                        <UserX className="mr-2 h-4 w-4" />
                        Tous absents
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des étudiants */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste de présence</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={saving}>
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer l'enregistrement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir enregistrer les présences pour cette session ? Cette action ne peut
                            pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSaveAttendance}>Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Étudiant</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredRecords().map((record) => (
                          <TableRow key={record.student_id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                  <AvatarFallback>
                                    {record.students?.firstname[0]}
                                    {record.students?.lastname[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {record.students?.firstname} {record.students?.lastname}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{record.students?.phonenumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(record.status)}
                                <span className={getStatusColor(record.status)}>
                                  {record.status === "oui" ? "Présent" : "Absent"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={record.status === "oui" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(record.student_id, "oui")}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={record.status === "non" ? "destructive" : "outline"}
                                  onClick={() => handleStatusChange(record.student_id, "non")}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des présences</CardTitle>
              <CardDescription>Consultez l'historique des présences de vos sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">Fonctionnalité d'historique à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
