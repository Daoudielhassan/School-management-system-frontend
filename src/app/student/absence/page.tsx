'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Absence {
  id: number;
  subjectName: string;
  instructorName: string;
  sessionDate: string;
  sessiontype: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
}

export default function Absences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/attendance/students/222")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch absences");
        }
        return response.json();
      })
      .then((data) => {
        const unjustifiedAbsences = data.filter((absence: { status: string }) => absence.status === "non");
        setAbsences(unjustifiedAbsences);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Unjustified Absences</h2>
        {loading && <Loader2 className="animate-spin mx-auto" />}
        {error && <Alert variant="destructive">{error}</Alert>}
        {!loading && absences.length === 0 && <p>No unjustified absences.</p>}
        {!loading && absences.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell>{absence.subjectName}</TableCell>
                  <TableCell>{absence.instructorName}</TableCell>
                  <TableCell>{absence.sessionDate}</TableCell>
                  <TableCell>{absence.sessiontype}</TableCell>
                  <TableCell>{absence.roomNumber}</TableCell>
                  <TableCell>{absence.startTime} - {absence.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
