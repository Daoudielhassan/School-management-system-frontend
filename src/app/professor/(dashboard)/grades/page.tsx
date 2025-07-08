"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Download, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface Grade {
  id: string
  student_name: string
  course_name: string
  grade: number
  exam_type: string
  exam_date: string
  coefficient: number
}

interface Course {
  id: string
  name: string
}

export default function GradesPage() {
  const { userId, token } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId && token) {
      loadData()
    }
  }, [userId, token])

  const loadData = async () => {
    if (!userId || !token) return

    try {
      setLoading(true)
      const [gradesResponse, coursesResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/instructors/${userId}/grades`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8080/api/instructors/${userId}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setGrades(gradesResponse.data || [])
      setCourses(coursesResponse.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      setGrades([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGrades =
    selectedCourse === "all" ? grades : grades.filter((grade) => grade.course_name === selectedCourse)

  const averageGrade =
    filteredGrades.length > 0 ? filteredGrades.reduce((sum, grade) => sum + grade.grade, 0) / filteredGrades.length : 0

  const getGradeVariant = (grade: number) => {
    if (grade >= 16) return "default"
    if (grade >= 14) return "secondary"
    if (grade >= 12) return "outline"
    return "destructive"
  }

  const getGradeTrend = (grade: number) => {
    if (grade >= 14) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (grade >= 10) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des notes</h1>
          <p className="text-gray-600">Saisissez et consultez les notes de vos étudiants</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une note</DialogTitle>
                <DialogDescription>Saisissez une nouvelle note pour un étudiant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Cours</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student">Étudiant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">Alice Martin</SelectItem>
                      <SelectItem value="student2">Bob Dupont</SelectItem>
                      <SelectItem value="student3">Claire Bernard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Note (/20)</Label>
                    <Input id="grade" type="number" min="0" max="20" step="0.1" placeholder="15.5" />
                  </div>
                  <div>
                    <Label htmlFor="coefficient">Coefficient</Label>
                    <Input id="coefficient" type="number" min="1" max="5" defaultValue="1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exam_type">Type d'évaluation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Examen</SelectItem>
                      <SelectItem value="tp">TP</SelectItem>
                      <SelectItem value="td">TD</SelectItem>
                      <SelectItem value="project">Projet</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exam_date">Date</Label>
                  <Input id="exam_date" type="date" />
                </div>
                <Button className="w-full">Enregistrer la note</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.name}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{filteredGrades.length}</div>
                <p className="text-xs text-muted-foreground">Notes saisies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{averageGrade.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Moyenne générale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{filteredGrades.filter((g) => g.grade >= 16).length}</div>
                <p className="text-xs text-muted-foreground">Très bien (≥16)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{filteredGrades.filter((g) => g.grade < 10).length}</div>
                <p className="text-xs text-muted-foreground">Échecs (&lt;10)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes récentes</CardTitle>
          <CardDescription>
            {filteredGrades.length} note{filteredGrades.length > 1 ? "s" : ""}
            {selectedCourse !== "all" && ` pour ${selectedCourse}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Coefficient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.student_name}</TableCell>
                  <TableCell>{grade.course_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{grade.exam_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getGradeVariant(grade.grade)}>{grade.grade}/20</Badge>
                  </TableCell>
                  <TableCell>{grade.coefficient}</TableCell>
                  <TableCell>{new Date(grade.exam_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getGradeTrend(grade.grade)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
