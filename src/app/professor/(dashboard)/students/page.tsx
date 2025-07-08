"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Download, Eye, MessageSquare, BarChart3 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useInstructor } from "@/context/InstructorContext"
import axios from "axios"

interface Student {
  id: number
  first_name: string
  last_name: string
  student_number: string
  class_level: string
  average: number
  absenceCount: number
  status: string
}

export default function StudentsPage() {
  const { token } = useAuth()
  const { instructorId } = useInstructor()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (instructorId && token) {
      loadStudents()
    }
  }, [selectedClass, instructorId, token])

  const loadStudents = async () => {
    if (!instructorId || !token) return

    try {
      const params = selectedClass !== "all" ? `?class=${selectedClass}` : ""
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructors/${instructorId}/students${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "warning":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "warning":
        return "Attention"
      case "critical":
        return "Critique"
      default:
        return status
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Étudiants</h1>
          <p className="text-gray-600">Suivi et gestion de vos étudiants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
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
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="L1 Info">L1 Info</SelectItem>
                <SelectItem value="L2 Info">L2 Info</SelectItem>
                <SelectItem value="L3 Info">L3 Info</SelectItem>
                <SelectItem value="M1 Info">M1 Info</SelectItem>
                <SelectItem value="M2 Info">M2 Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">Total étudiants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredStudents.filter((s) => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredStudents.filter((s) => s.status === "warning").length}
            </div>
            <p className="text-xs text-muted-foreground">Attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredStudents.filter((s) => s.status === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Critiques</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des étudiants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants</CardTitle>
          <CardDescription>
            {filteredStudents.length} étudiant{filteredStudents.length > 1 ? "s" : ""} trouvé
            {filteredStudents.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Moyenne</TableHead>
                <TableHead>Absences</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                        <AvatarFallback>
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{student.student_number}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.class_level}</TableCell>
                  <TableCell>
                    <Badge
                      variant={student.average >= 15 ? "default" : student.average >= 12 ? "secondary" : "destructive"}
                    >
                      {student.average?.toFixed(1) || "0.0"}/20
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={student.absenceCount > 5 ? "text-red-600 font-medium" : ""}>
                      {student.absenceCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(student.status)}>{getStatusLabel(student.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/professor/students/${student.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
