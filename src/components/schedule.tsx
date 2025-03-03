"use client"

import React from "react"

import { useQuery } from "react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Simuler une fonction pour récupérer les sessions
const fetchSessions = async () => {
  // Dans un cas réel, cela serait un appel API
  return [
    {
      id: 1,
      subject: "Mathématiques",
      time: "08:00 - 10:00",
      day: "Lundi",
      room: "A101",
      teacher: "Dr. Martin",
      type: "CM",
    },
    {
      id: 2,
      subject: "Physique",
      time: "10:30 - 12:30",
      day: "Lundi",
      room: "B202",
      teacher: "Prof. Dubois",
      type: "TD",
    },
    {
      id: 3,
      subject: "Informatique",
      time: "14:00 - 16:00",
      day: "Mardi",
      room: "C303",
      teacher: "Mme. Garcia",
      type: "TP",
    },
    {
      id: 4,
      subject: "Anglais",
      time: "10:00 - 12:00",
      day: "Mercredi",
      room: "D404",
      teacher: "Mr. Smith",
      type: "TD",
    },
    {
      id: 5,
      subject: "Mécanique",
      time: "14:00 - 16:00",
      day: "Mercredi",
      room: "E505",
      teacher: "Dr. Leroy",
      type: "CM",
    },
    {
      id: 6,
      subject: "Électronique",
      time: "08:00 - 10:00",
      day: "Jeudi",
      room: "F606",
      teacher: "Prof. Blanc",
      type: "TP",
    },
    {
      id: 7,
      subject: "Chimie",
      time: "10:30 - 12:30",
      day: "Jeudi",
      room: "G707",
      teacher: "Dr. Rousseau",
      type: "CM",
    },
    {
      id: 8,
      subject: "Projet",
      time: "14:00 - 18:00",
      day: "Vendredi",
      room: "H808",
      teacher: "Équipe pédagogique",
      type: "Projet",
    },
  ]
}

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]

const getSessionStyle = (type: string) => {
  switch (type) {
    case "CM":
      return "bg-blue-100 border-blue-300 text-blue-800"
    case "TD":
      return "bg-green-100 border-green-300 text-green-800"
    case "TP":
      return "bg-yellow-100 border-yellow-300 text-yellow-800"
    case "Projet":
      return "bg-purple-100 border-purple-300 text-purple-800"
    default:
      return "bg-gray-100 border-gray-300 text-gray-800"
  }
}

const Legend = () => (
  <div className="flex flex-wrap gap-4 mt-4">
    <div className="flex items-center">
      <div className="w-4 h-4 bg-blue-100 border border-blue-300 mr-2"></div>
      <span>CM (Cours Magistral)</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2"></div>
      <span>TD (Travaux Dirigés)</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 mr-2"></div>
      <span>TP (Travaux Pratiques)</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 bg-purple-100 border border-purple-300 mr-2"></div>
      <span>Projet</span>
    </div>
  </div>
)

export default function Schedule() {
  const { data: sessions, isLoading } = useQuery("sessions", fetchSessions)

  if (isLoading) return <div>Chargement de l'emploi du temps...</div>

  const getSessionForSlot = (day: string, time: string) => {
    return sessions?.find((session) => session.day === day && session.time.startsWith(time))
  }

  return (
    <Card className="w-full overflow-x-auto">
      <CardHeader>
        <CardTitle>Emploi du temps hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          <div className="font-bold"></div>
          {days.map((day) => (
            <div key={day} className="font-bold text-center">
              {day}
            </div>
          ))}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="font-semibold text-right pr-2">{time}</div>
              {days.map((day) => {
                const session = getSessionForSlot(day, time)
                return (
                  <div key={`${day}-${time}`} className="relative h-24 border border-gray-200">
                    {session && (
                      <div
                        className={cn(
                          "absolute inset-0 p-1 text-xs border rounded overflow-hidden",
                          getSessionStyle(session.type),
                        )}
                      >
                        <div className="font-bold">{session.subject}</div>
                        <div>{session.time}</div>
                        <div>{session.room}</div>
                        <div>{session.teacher}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <Legend />
      </CardContent>
    </Card>
  )
}

