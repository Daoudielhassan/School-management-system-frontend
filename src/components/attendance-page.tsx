"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  classEntity: {
    name: string;
  };
}

interface Attendance {
  id: number;
  studentId: number;
  studentName: string;
  status: string;
  sessionId: number;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`/api/sessions/instructor/${user?.id}`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  const handleSessionChange = async (sessionId: string) => {
    const session = sessions.find(s => s.id === parseInt(sessionId));
    setSelectedSession(session || null);

    if (session) {
      try {
        const response = await axios.get(`/api/attendance/session/${session.id}`);
        setAttendances(response.data);
      } catch (error) {
        console.error("Error fetching attendances:", error);
      }
    }
  };

  const handleStatusChange = async (studentId: number, newStatus: string) => {
    const attendance = attendances.find(a => a.studentId === studentId);
    if (attendance) {
      try {
        const response = await axios.put(`/api/attendance/${attendance.id}`, {
          status: newStatus
        });
        setAttendances(prev => prev.map(a => 
          a.id === attendance.id ? { ...a, status: newStatus } : a
        ));
      } catch (error) {
        console.error("Error updating attendance:", error);
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      await axios.post('/api/attendance', attendances);
      alert('Présences enregistrées avec succès');
    } catch (error) {
      console.error("Error saving attendances:", error);
      alert('Erreur lors de l\'enregistrement des présences');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des présences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={handleSessionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.subject.name} - {format(new Date(session.sessionDate), 'dd/MM/yyyy', { locale: fr })} - {session.classEntity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSession && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedSession.subject.name} - {selectedSession.classEntity.name}
                </h3>
                <p>
                  {format(new Date(selectedSession.sessionDate), 'dd MMMM yyyy', { locale: fr })} - 
                  {format(new Date(selectedSession.startTime), 'HH:mm')} - 
                  {format(new Date(selectedSession.endTime), 'HH:mm')}
                </p>
                <p>Salle: {selectedSession.roomNumber}</p>
              </div>

              <div className="space-y-4">
                {attendances.map((attendance) => (
                  <div key={attendance.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <span>{attendance.studentName}</span>
                    <Select
                      value={attendance.status}
                      onValueChange={(value) => handleStatusChange(attendance.studentId, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Présent</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">En retard</SelectItem>
                        <SelectItem value="excused">Excusé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button onClick={handleSaveAll}>Enregistrer les présences</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

