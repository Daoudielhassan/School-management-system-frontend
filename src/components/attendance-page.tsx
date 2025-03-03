"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Calendar } from "lucide-react"
import axios from "axios"

// Interfaces TypeScript
interface Session {
  id: number
  subject: { name: string }
  sessionDate: string
  classId: number
  startTime: string
  endTime: string
  roomNumber: string
  classe: { name: string }
}

interface Student {
  id: number
  firstname: string
  lastname: string
  email: string
  classId: number
}

interface AttendanceRecord {
  studentId: number
  sessionId: number
  isPresent: boolean
}

function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedAttendance, setSavedAttendance] = useState(false)
  const { toast } = useToast()

  const instructorId = 1 // Replace with the actual instructor ID

  // Fetch instructor's sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get<Session[]>(`http://localhost:8080/api/sessions/instructor/${instructorId}`)
        setSessions(response.data)
      } catch (error) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les sessions. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [instructorId, toast])

  // Fetch students for a session
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSession) return
      setIsLoading(true)
      try {
        const session = sessions.find((s) => s.id === selectedSession)
        if (!session) return

        const studentsResponse = await axios.get(`http://localhost:8080/api/classes/${session.classId}/students`)
        const fetchedStudents = studentsResponse.data.map((student: any) => ({
          id: student.id,
          firstname: student.firstName,
          lastname: student.lastName,
          email: student.email,
          classId: student.classeId,
        }))
        setStudents(fetchedStudents)

        // Initialize attendance
        const initialAttendance: Record<number, boolean> = {}
        fetchedStudents.forEach((student: Student) => {
          initialAttendance[student.id] = true
        })
        setAttendance(initialAttendance)
      } catch (error) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les étudiants. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [selectedSession, sessions, toast])

  const handleAttendanceChange = (studentId: number, isPresent: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: isPresent }))
    setSavedAttendance(false)
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    try {
      const payload: AttendanceRecord[] = Object.entries(attendance).map(([studentId, isPresent]) => ({
        studentId: Number(studentId),
        sessionId: selectedSession!,
        isPresent,
      }))

      await axios.post("http://localhost:8080/api/attendance", payload)
      setSavedAttendance(true)
      toast({
        title: "Présences enregistrées",
        description: "Les présences ont été enregistrées avec succès.",
        variant: "default",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
    } catch (error) {
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible d'enregistrer les présences. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedSessionDetails = sessions.find((s) => s.id === selectedSession)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestion des présences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedSession?.toString()}
              onValueChange={(value) => {
                setSelectedSession(Number(value))
                setSavedAttendance(false)
              }}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Sélectionnez une session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {session.subject.name} - {session.classe.name} ({session.sessionDate} à {session.startTime})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSessionDetails && (
              <div className="text-sm text-muted-foreground">
                Salle: {selectedSessionDetails.roomNumber} | Horaire: {selectedSessionDetails.startTime} -{" "}
                {selectedSessionDetails.endTime}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-4">Chargement des données...</div>
            ) : students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Présent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.firstname} {student.lastname}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-right">
                        <Checkbox
                          checked={attendance[student.id]}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : selectedSession ? (
              <div className="text-center py-4">Aucun étudiant trouvé pour cette session.</div>
            ) : null}

            <div className="flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                disabled={isSaving || !selectedSession || savedAttendance}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving
                  ? "Enregistrement..."
                  : savedAttendance
                    ? "Présences enregistrées"
                    : "Enregistrer les présences"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

export default function AttendancePageWrapper() {
  return (
    <ToastProvider>
      <AttendancePage />
    </ToastProvider>
  )
}

