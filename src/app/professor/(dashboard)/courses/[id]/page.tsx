"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, FileText, Calendar, BarChart3, Settings, Plus } from "lucide-react"

interface Course {
  id: string;
  name: string;
  code: string;
  class_level: string;
  description: string;
  students_count: number;
  sessions_count: number;
  documents_count: number;
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données du cours
    setTimeout(() => {
      setCourse({
        id: courseId,
        name: "Mathématiques Avancées",
        code: "MATH301",
        class_level: "L3 Info",
        description: "Cours avancé de mathématiques pour étudiants en informatique",
        students_count: 45,
        sessions_count: 12,
        documents_count: 8,
      })
      setLoading(false)
    }, 1000)
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return <div>Cours non trouvé</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cours
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">
            {course.code} • {course.class_level}
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants inscrits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.students_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.sessions_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.documents_count}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="grades">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href={`/courses/${courseId}/students`}>
                  <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                    <Users className="h-6 w-6 mb-2" />
                    Voir étudiants
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/sessions/new`}>
                  <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                    <Calendar className="h-6 w-6 mb-2" />
                    Nouvelle session
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/documents`}>
                  <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Documents
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/grades`}>
                  <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Notes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Étudiants inscrits</CardTitle>
              <CardDescription>Liste des étudiants inscrits à ce cours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenu des étudiants à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sessions de cours</CardTitle>
                  <CardDescription>Planning des sessions</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Planning des sessions à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents du cours</CardTitle>
                  <CardDescription>Supports pédagogiques et ressources</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestion des documents à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notes et évaluations</CardTitle>
                  <CardDescription>Gestion des notes des étudiants</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestion des notes à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
