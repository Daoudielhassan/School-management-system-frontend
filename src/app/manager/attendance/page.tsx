"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import CustomSidebar from "@/components/admin/CustomSidebar";

interface Attendance {
  id: number;
  status: "PRESENT" | "ABSENT";
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
  session: {
    id: number;
    date: string;
    classEntity: {
      id: number;
      name: string;
      department: {
        id: number;
        name: string;
      };
    };
  };
}

export default function ManagerAttendancePage() {
  const { userId } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await axios.get(`/api/managers/${userId}/department/attendance`);
        setAttendances(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch attendance data");
        setLoading(false);
      }
    };

    if (userId) {
      fetchAttendances();
    }
  }, [userId]);

  const handleStatusChange = async (attendanceId: number, newStatus: "PRESENT" | "ABSENT") => {
    try {
      const response = await axios.put(
        `/api/managers/${userId}/attendance/${attendanceId}/status?status=${newStatus}`
      );
      
      setAttendances(prevAttendances =>
        prevAttendances.map(attendance =>
          attendance.id === attendanceId
            ? { ...attendance, status: newStatus }
            : attendance
        )
      );
    } catch (err) {
      setError("Failed to update attendance status");
    }
  };

  const uniqueClasses = Array.from(
    new Set(attendances.map(a => a.session.classEntity.name))
  );

  const filteredAttendances = selectedClass === "all"
    ? attendances
    : attendances.filter(a => a.session.classEntity.name === selectedClass);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-[#00246B] text-[#FFFFFF] overflow-hidden">
      <div style={{ display: "flex" }}>
        <CustomSidebar />
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] text-black">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Department Attendance Management</h1>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Classes</option>
            {uniqueClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6">
          {filteredAttendances.map((attendance) => (
            <div
              key={attendance.id}
              className="bg-white p-4 rounded-lg shadow border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {attendance.student.firstName} {attendance.student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Class: {attendance.session.classEntity.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(attendance.session.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(attendance.id, "PRESENT")}
                    className={`px-4 py-2 rounded ${
                      attendance.status === "PRESENT"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(attendance.id, "ABSENT")}
                    className={`px-4 py-2 rounded ${
                      attendance.status === "ABSENT"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 