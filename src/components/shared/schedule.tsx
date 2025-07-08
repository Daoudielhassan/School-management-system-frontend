"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface Session {
  id: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  subject: {
    name: string;
  };
  instructor: {
    firstName: string;
    lastName: string;
  };
  roomNumber: string;
}

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

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

// Function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If the date is invalid, try parsing it as a different format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Assuming format is YYYY-MM-DD
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return dateString; // Return original if can't parse
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

// Function to get date for a specific day of the week with week offset
const getDateForDay = (dayIndex: number, weekOffset: number = 0) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate the date for Monday of the current week
  const monday = new Date(today);
  const daysSinceMonday = (dayOfWeek + 6) % 7; // number of days since last Monday
  monday.setDate(today.getDate() - daysSinceMonday + (weekOffset * 7));

  // Calculate the date for the desired dayIndex (0 = Monday, 5 = Saturday)
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayIndex);

  return targetDate;
};

// Function to format date to YYYY-MM-DD for comparison
const formatDateForComparison = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to get week range string
const getWeekRange = (weekOffset: number = 0) => {
  const monday = getDateForDay(0, weekOffset);
  const saturday = getDateForDay(5, weekOffset);

  const formatWeekDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return `${formatWeekDate(monday)} - ${formatWeekDate(saturday)}`;
};

interface ScheduleProps {
  departmentId: string;
  classeId: string;
}

export default function Schedule({ departmentId, classeId }: ScheduleProps) {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!departmentId || !classeId || !token) {
        setSessions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8080/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [departmentId, classeId, token]);

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };

  if (isLoading) return <div>Chargement de l'emploi du temps...</div>;
  if (error) return <div>Erreur lors du chargement de l'emploi du temps</div>;

  const getSessionForSlot = (dayIndex: number, time: string) => {
    const targetDate = getDateForDay(dayIndex, weekOffset);
    const formattedTargetDate = formatDateForComparison(targetDate);

    return sessions?.find((session: Session) => {
      const sessionDate = new Date(session.sessionDate);
      const formattedSessionDate = formatDateForComparison(sessionDate);
      return formattedSessionDate === formattedTargetDate && session.startTime.startsWith(time);
    });
  };

  return (
    <Card className="w-full overflow-x-auto">
<CardHeader>
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Calendar className="h-5 w-5" />
      Emploi du temps
    </CardTitle>

    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousWeek}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Semaine précédente</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCurrentWeek}
        className={cn(
          "flex items-center gap-1",
          weekOffset === 0 ? "bg-blue-100 text-blue-800" : ""
        )}
      >
        Cette semaine
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNextWeek}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Semaine suivante</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>

  <div className="text-sm text-gray-600 text-center mt-2 md:mt-0">
    {getWeekRange(weekOffset)}
  </div>
</CardHeader>

      <CardContent>
        {/* Desktop grid view */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          <div className="font-bold"></div>
          {days.map((day, dayIndex) => {
            const targetDate = getDateForDay(dayIndex, weekOffset);
            return (
              <div key={day} className="font-bold text-center">
                <div>{day}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(targetDate.toISOString())}
                </div>
              </div>
            );
          })}
          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="font-semibold text-right pr-2">{time}</div>
              {days.map((day, dayIndex) => {
                const session = getSessionForSlot(dayIndex, time);
                return (
                  <div key={`${day}-${time}`} className="relative h-24 border border-gray-200">
                    {session && (
                      <div
                        className={cn("absolute inset-0 p-1 text-xs border rounded overflow-hidden", getSessionStyle(session.sessionType))}
                      >
                        <div className="font-bold">{session.subject.name}</div>
                        <div>{session.startTime} - {session.endTime}</div>
                        <div className="text-xs text-gray-600">{formatDate(session.sessionDate)}</div>
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

{/* Improved Mobile stacked view */}
<div className="block md:hidden space-y-4">
  {days.map((day, dayIndex) => {
    const targetDate = getDateForDay(dayIndex, weekOffset);

    // Get all sessions for this day
    const sessionsForDay = timeSlots
      .map(time => getSessionForSlot(dayIndex, time))
      .filter(Boolean) as Session[];

    return (
      <div key={day} className="border rounded-lg p-3 shadow-sm">
        <div className="font-bold text-lg mb-2 flex items-center justify-between">
          <span>{day}</span>
          <span className="text-xs text-gray-500">{formatDate(targetDate.toISOString())}</span>
        </div>

        {sessionsForDay.length > 0 ? (
          sessionsForDay.map(session => (
            <div
              key={session.id}
              className={cn("mb-3 p-3 text-xs border rounded-lg", getSessionStyle(session.sessionType))}
            >
              <div className="font-bold text-sm mb-1">{session.subject.name}</div>
              <div className="flex items-center text-xs mb-1">
                <Calendar className="h-3 w-3 mr-1" />
                {session.startTime} - {session.endTime}
              </div>
              <div className="flex items-center text-xs mb-1">
                <span className="h-3 w-3 mr-1 inline-block bg-gray-400 rounded-full"></span>
                Salle {session.roomNumber}
              </div>
              <div className="flex items-center text-xs">
                <span className="h-3 w-3 mr-1 inline-block bg-gray-600 rounded-full"></span>
                {session.instructor.firstName} {session.instructor.lastName}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">Aucune séance programmée</div>
        )}
      </div>
    );
  })}
</div>

      </CardContent>

    </Card>
  );
}
