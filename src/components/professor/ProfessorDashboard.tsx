'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Session {
  id: number;
  subject: {
    name: string;
  };
  sessionDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  sessionType: string;
  classEntity: {
    name: string;
  };
}

export default function ProfessorDashboard() {
  const { userId } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState<{ firstname: string; lastname: string } | null>(null);

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructors/user/${userId}`);
        setProfessor(response.data);
      } catch (error) {
        console.error("Error fetching professor data:", error);
      }
    };

    if (userId) {
      fetchProfessorData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/instructor/${userId}`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  const todaySessions = sessions.filter(session => 
    new Date(session.sessionDate).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue, {professor?.firstname} {professor?.lastname}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Professeur</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{todaySessions.length} sessions prévues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochain cours</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length > 0 ? (
                <div>
                  <p>{todaySessions[0].subject.name}</p>
                  <p>{format(new Date(todaySessions[0].startTime), 'HH:mm')} - {format(new Date(todaySessions[0].endTime), 'HH:mm')}</p>
                  <p>Salle: {todaySessions[0].roomNumber}</p>
                </div>
              ) : (
                <p>Aucun cours prévu</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendrier des cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={fr}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Chargement...</p>
                  ) : todaySessions.length > 0 ? (
                    <div className="space-y-4">
                      {todaySessions.map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg">
                          <h3 className="font-bold">{session.subject.name}</h3>
                          <p>Classe: {session.classEntity.name}</p>
                          <p>Horaire: {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}</p>
                          <p>Salle: {session.roomNumber}</p>
                          <p>Type: {session.sessionType}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Aucune session prévue pour cette date</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 