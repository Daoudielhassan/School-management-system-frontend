"use client"

import { useQuery } from "react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Simuler une fonction pour récupérer les données de présence
const fetchAttendance = async () => {
  // Dans un cas réel, cela serait un appel API
  return {
    sessions: [
      { id: 1, subject: "Mathématiques", date: "2023-06-01", status: "Présent" },
      { id: 2, subject: "Physique", date: "2023-06-02", status: "Absent" },
      // ... autres sessions
    ],
    stats: {
      present: 80,
      absent: 20,
    },
  }
}

export default function Attendance() {
  const { data: attendanceData, isLoading } = useQuery("attendance", fetchAttendance)

  if (isLoading) return <div>Chargement des données de présence...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique de présence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Statistiques de présence</h3>
          <Progress value={attendanceData?.stats.present} className="w-full" />
          <p className="text-sm text-gray-600 mt-1">{attendanceData?.stats.present}% de présence</p>
        </div>
        <div className="space-y-2">
          {attendanceData?.sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{session.subject}</h3>
                <p className="text-sm text-gray-600">Date: {session.date}</p>
                <p className={`text-sm ${session.status === "Présent" ? "text-green-600" : "text-red-600"}`}>
                  {session.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

