"use client"

import { useQuery } from "react-query"
import Schedule from "./schedule"
import Attendance from "./attendance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Fetch student data from API
const fetchStudentData = async () => {
  const response = await fetch("http://localhost:8080/api/students/1");
  if (!response.ok) {
    throw new Error("Failed to fetch student data");
  }
  const data = await response.json();
  console.log("Student API Response:", data); // DEBUGGING
  return data;
};

export default function StudentDashboard() {
  const { data: studentData, isLoading } = useQuery("studentData", fetchStudentData);

  if (isLoading) return <div>Chargement...</div>;

  if (!studentData) {
    return <div>Erreur: Données de l'étudiant introuvables.</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bienvenue, {studentData.firstName} {studentData.lastName} 👋</CardTitle>
          <CardDescription>Email: {studentData.email}</CardDescription>
          <CardDescription>Date de naissance: {studentData.dateOfBirth}</CardDescription>
          <CardDescription>Statut: {studentData.status}</CardDescription>
          <CardDescription>Téléphone: {studentData.phoneNumber}</CardDescription>
          <CardDescription>Classe ID: {studentData.classeId}</CardDescription>
          <CardDescription>Département ID: {studentData.departmentId}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="schedule">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
          <TabsTrigger value="attendance">Présence</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Schedule 
            departmentId={studentData.departmentId} 
            classeId={studentData.classeId} 
          />
        </TabsContent>
        <TabsContent value="attendance">
          <Attendance />
        </TabsContent>
      </Tabs>
    </main>
  );
}
