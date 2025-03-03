"use client"

import { useQuery } from "react-query"
import Schedule from "./schedule"
import Attendance from "./attendance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Simuler une fonction pour récupérer les données de l'étudiant
const fetchStudentData = async () => {
  // Dans un cas réel, cela serait un appel API
  return {
    firstName: "Sophie",
    className: "Ingénierie 3A",
  }
}

export default function StudentDashboard() {
  const { data: studentData, isLoading } = useQuery("studentData", fetchStudentData)

  if (isLoading) return <div>Chargement...</div>

  return (
    <main className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bienvenue, {studentData?.firstName} 👋</CardTitle>
          <CardDescription>Classe : {studentData?.className}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="schedule">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
          <TabsTrigger value="attendance">Présence</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Schedule />
        </TabsContent>
        <TabsContent value="attendance">
          <Attendance />
        </TabsContent>
      </Tabs>
    </main>
  )
}

