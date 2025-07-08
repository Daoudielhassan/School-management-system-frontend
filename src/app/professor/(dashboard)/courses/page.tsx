"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, FileText, Calendar, Users, Settings, Eye, BookOpen } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface Course {
  id: number
  name: string
  code: string
  description: string
  class_level: string
  max_students: number
  enrollments?: Array<{ count: number }>
}

export default function CoursesPage() {
  const { userId, token } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (userId && token) {
      loadCourses()
    }
  }, [userId, token])

  const loadCourses = async () => {
    if (!userId || !token) return

    try {
      const response = await axios.get(`http://localhost:8080/api/instructors/${userId}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des cours:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId || !token) return

    const formData = new FormData(event.currentTarget)

    try {
      await axios.post(`http://localhost:8080/api/instructors/${userId}/courses`, {
        name: formData.get("name") as string,
        code: formData.get("code") as string,
        description: formData.get("description") as string,
        class_level: formData.get("class_level") as string,
        max_students: Number.parseInt(formData.get("max_students") as string) || 50,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsDialogOpen(false)
      loadCourses()
    } catch (error) {
      console.error("Erreur lors de la création du cours:", error)
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
          <h1 className="text-3xl font-bold text-gray-900">Mes cours</h1>
          <p className="text-gray-600">Gérez vos cours et leur contenu</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau cours
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau cours</DialogTitle>
              <DialogDescription>Ajoutez un nouveau cours à votre planning</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du cours</Label>
                <Input id="name" name="name" placeholder="Ex: Mathématiques Avancées" required />
              </div>
              <div>
                <Label htmlFor="code">Code du cours</Label>
                <Input id="code" name="code" placeholder="Ex: MATH301" required />
              </div>
              <div>
                <Label htmlFor="class_level">Niveau</Label>
                <Select name="class_level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1 Info">L1 Info</SelectItem>
                    <SelectItem value="L2 Info">L2 Info</SelectItem>
                    <SelectItem value="L3 Info">L3 Info</SelectItem>
                    <SelectItem value="M1 Info">M1 Info</SelectItem>
                    <SelectItem value="M2 Info">M2 Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_students">Nombre max d'étudiants</Label>
                <Input id="max_students" name="max_students" type="number" defaultValue="50" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Description du cours..." />
              </div>
              <Button type="submit" className="w-full">
                Créer le cours
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    {course.code} • {course.class_level}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{course.enrollments?.[0]?.count || 0} étudiants</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

              <div className="flex flex-wrap gap-2">
                <Link href={`/professor/courses/${course.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Button>
                </Link>
                <Link href={`/professor/courses/${course.id}/students`}>
                  <Button size="sm" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Étudiants
                  </Button>
                </Link>
                <Link href={`/professor/courses/${course.id}/documents`}>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </Button>
                </Link>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planning
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours</h3>
            <p className="text-gray-600 text-center mb-4">
              Vous n'avez pas encore créé de cours. Commencez par en créer un.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer mon premier cours
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
