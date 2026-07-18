"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { API_ENDPOINTS, apiGet } from "@/config/api"
import type { TeachingAssignment } from "@/types/education"
import { SessionCalendar, type SessionCalendarEvent } from "./SessionCalendar"

/**
 * Matches `SessionResponse` (API_REFERENCE.md §2.15). `subjectId`/`instructorId`
 * no longer live on the session directly — resolve `teachingAssignmentId`
 * through `TeachingAssignment` (§2.19) instead.
 */
interface Session {
  id: string;
  managerId: string;
  departmentId: string;
  teachingAssignmentId: string | null;
  startsAt: string;
  endsAt: string;
  room: string | null;
  status?: string;
  createdAt: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
}

interface Instructor {
  id: string;
  code: string;
  name: string;
  email: string;
}

interface ScheduleProps {
  departmentId: string;
  classeId: string;
}

export default function Schedule({ departmentId, classeId }: ScheduleProps) {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!departmentId || !classeId || !token) {
        setSessions([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [sessionsData, subjectsData, instructorsData, assignmentsData] = await Promise.all([
          apiGet(API_ENDPOINTS.SESSIONS.BY_DEPARTMENT_AND_CLASS(departmentId, classeId), token),
          apiGet(API_ENDPOINTS.SUBJECTS.BASE, token),
          apiGet(API_ENDPOINTS.INSTRUCTORS.BASE, token),
          apiGet(API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER({ classGroupId: classeId }), token),
        ]);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
        setTeachingAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [departmentId, classeId, token]);

  const events: SessionCalendarEvent[] = useMemo(() => {
    const assignmentById = new Map(teachingAssignments.map((a) => [a.id, a]));
    const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
    const instructorNameById = new Map(instructors.map((i) => [i.id, i.name]));

    return sessions.map((session) => {
      const assignment = session.teachingAssignmentId ? assignmentById.get(session.teachingAssignmentId) : undefined;
      const subjectName = assignment ? subjectNameById.get(assignment.subjectId) ?? 'Matière inconnue' : 'Séance';
      const instructorName = assignment
        ? instructorNameById.get(assignment.instructorId) ?? 'Instructeur inconnu'
        : undefined;
      return {
        id: session.id,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        title: subjectName,
        subtitle: instructorName,
        room: session.room,
        cancelled: session.status === 'CANCELLED',
        colorKey: assignment?.subjectId ?? subjectName,
      };
    });
  }, [sessions, teachingAssignments, subjects, instructors]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Emploi du temps
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="text-center py-14 text-red-500 text-sm">
            Erreur lors du chargement de l&apos;emploi du temps
          </div>
        ) : (
          <SessionCalendar events={events} isLoading={isLoading} emptyMessage="Aucune séance programmée" />
        )}
      </CardContent>
    </Card>
  );
}
