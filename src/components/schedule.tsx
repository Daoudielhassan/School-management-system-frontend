"use client"

import React from "react"
import { useQuery } from "react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Fetch sessions based on department and class
import { QueryFunctionContext } from "react-query";

const fetchSessions = async (context: QueryFunctionContext<[string, string, string]>) => {
  const [, departmentId, classeId] = context.queryKey;
  const response = await fetch(`http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  return response.json();
};

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

const getSessionStyle = (type: string) => {
  switch (type) {
    case "Cours": return "bg-blue-100 border-blue-300 text-blue-800";
    case "TD": return "bg-green-100 border-green-300 text-green-800";
    case "TP": return "bg-yellow-100 border-yellow-300 text-yellow-800";
    case "Projet": return "bg-purple-100 border-purple-300 text-purple-800";
    default: return "bg-gray-100 border-gray-300 text-gray-800";
  }
};

// Function to get the day of the week in French
const getFrenchDay = (dateString: string) => {
  const daysInFrench = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const date = new Date(dateString);
  return daysInFrench[date.getDay()];
};

interface ScheduleProps {
  departmentId: string;
  classeId: string;
}

export default function Schedule({ departmentId, classeId }: ScheduleProps) {
  const { data: sessions, isLoading } = useQuery(["sessions", departmentId, classeId], fetchSessions, {
    enabled: !!departmentId && !!classeId,
  });

  if (isLoading) return <div>Chargement de l'emploi du temps...</div>;

  const getSessionForSlot = (day: string, time: string) => {
    return sessions?.find((session: any) => getFrenchDay(session.sessionDate) === day && session.startTime.startsWith(time));
  };

  return (
    <Card className="w-full overflow-x-auto">
      <CardHeader>
        <CardTitle>Emploi du temps hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          <div className="font-bold"></div>
          {days.map(day => (
            <div key={day} className="font-bold text-center">{day}</div>
          ))}
          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="font-semibold text-right pr-2">{time}</div>
              {days.map(day => {
                const session = getSessionForSlot(day, time);
                return (
                  <div key={`${day}-${time}`} className="relative h-24 border border-gray-200">
                    {session && (
                      <div
                        className={cn("absolute inset-0 p-1 text-xs border rounded overflow-hidden", getSessionStyle(session.sessionType))}
                      >
                        <div className="font-bold">{session.subject.name}</div>
                        <div>{session.startTime} - {session.endTime}</div>
                        <div>Salle: {session.roomNumber}</div>
                        <div>Prof: {session.instructor.firstName} {session.instructor.lastName}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
