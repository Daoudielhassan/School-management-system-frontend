import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS, apiGet, apiPost } from '@/config/api';
import type { TeachingAssignment } from '@/types/education';

interface Subject {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface Classe {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}

/** Matches `AcademicYearResponse` (API_REFERENCE.md §2.1) — not `@/types/education`'s `AcademicYear`, which is stale (`code`/`status`, not `name`/`isActive`). */
interface AcademicYear {
  id: string;
  code: string;
  status: string;
}

interface SessionFormData {
  subjectId: string;
  departmentId: string;
  classId: string;
  instructorId: string;
  academicYearId: string;
  sessionDate: string;
  startTime: string;
  roomNumber: string;
  sessionType: string;
}

export default function SessionManagement() {
  const { userId, token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SessionFormData>({
    subjectId: '',
    departmentId: '',
    classId: '',
    instructorId: '',
    academicYearId: '',
    sessionDate: '',
    startTime: '',
    roomNumber: '',
    sessionType: 'Cours' // Default value
  });


  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !token) {
        setError('User ID not available');
        setLoading(false);
        return;
      }

      try {
        const [subjectsRes, departmentsRes, instructorsRes, academicYearsRes] = await Promise.all([
          apiGet(`${API_ENDPOINTS.SUBJECTS.BASE}?userId=${userId}`, token),
          apiGet(`${API_ENDPOINTS.DEPARTMENTS.BASE}?userId=${userId}`, token),
          apiGet(`${API_ENDPOINTS.INSTRUCTORS.BASE}?userId=${userId}`, token),
          apiGet(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token),
        ]);

        setSubjects(subjectsRes as Subject[]);
        setDepartments(departmentsRes as Department[]);
        setInstructors(instructorsRes as Instructor[]);
        const years = academicYearsRes as AcademicYear[];
        setAcademicYears(years);
        const active = years.find((y) => y.status === 'ACTIVE');
        if (active) {
          setFormData((prev) => ({ ...prev, academicYearId: active.id }));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  // Reset dependent field (classId) when departmentId changes
  useEffect(() => {
    if (!formData.departmentId) {
      setClasses([]);
      setFormData(prev => ({ ...prev, classId: '' }));
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (formData.departmentId && userId && token) {
      const fetchClasses = async () => {
        try {
          const data = await apiGet(
            `${API_ENDPOINTS.CLASSES.BY_DEPARTMENT(formData.departmentId)}?userId=${userId}`,
            token
          );
          setClasses(data as Classe[]);
        } catch (err) {
          setError('Failed to fetch classes');
        }
      };
      fetchClasses();
    }
  }, [formData.departmentId, userId, token]);

  // Auto-dismiss error/success messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    // Form validation
    if (
      !formData.subjectId || !formData.departmentId || !formData.classId ||
      !formData.instructorId || !formData.academicYearId || !formData.sessionDate ||
      !formData.startTime || !formData.roomNumber || !formData.sessionType
    ) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!userId || !token) {
      setError('User ID not available');
      setIsSubmitting(false);
      return;
    }

    try {
      // A Session no longer carries class/subject/instructor directly — it
      // references a TeachingAssignment (API_REFERENCE.md §2.15/§2.19).
      // Reuse an existing ACTIVE assignment for this class/subject/instructor
      // combination if one exists, otherwise create it.
      //
      // NOTE: `managerId` is set to the logged-in user's identity `userId`,
      // matching this component's pre-existing (unverified) assumption —
      // the backend expects `Manager.id`, which may differ from `User.id`.
      // This component has no current callers in the app; wire it up with a
      // real managerId before using it.
      const existingAssignments = (await apiGet(
        API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER({ classGroupId: formData.classId }),
        token
      ).catch(() => [])) as TeachingAssignment[];

      const matching = Array.isArray(existingAssignments)
        ? existingAssignments.find(
            (a) =>
              a.status === 'ACTIVE' &&
              a.subjectId === formData.subjectId &&
              a.instructorId === formData.instructorId
          )
        : undefined;

      let teachingAssignmentId = matching?.id;
      if (!teachingAssignmentId) {
        const created = (await apiPost(
          API_ENDPOINTS.MANAGERS.TEACHING_ASSIGNMENTS(userId),
          {
            classGroupId: formData.classId,
            instructorId: formData.instructorId,
            subjectId: formData.subjectId,
            academicYearId: formData.academicYearId,
          },
          token
        )) as TeachingAssignment;
        teachingAssignmentId = created.id;
      }

      // Map frontend form fields to backend SessionRequest fields
      const startsAt = `${formData.sessionDate}T${formData.startTime}:00`;
      // Default duration: 1h30
      const startsDate = new Date(startsAt);
      startsDate.setMinutes(startsDate.getMinutes() + 90);
      const endsAt = startsDate.toISOString().slice(0, 19);

      const sessionPayload = {
        managerId: userId,
        departmentId: formData.departmentId,
        teachingAssignmentId,
        startsAt,
        endsAt,
        room: formData.roomNumber,
      };

      await apiPost(API_ENDPOINTS.SESSIONS.BASE, sessionPayload, token);
      setSuccess('Session created successfully');
      setFormData({
      subjectId: '',
      departmentId: '',
      classId: '',
      instructorId: '',
      academicYearId: academicYears.find((y) => y.status === 'ACTIVE')?.id ?? '',
        sessionDate: '',
        startTime: '',
        roomNumber: '',
        sessionType: ''
      });
    } catch (err) {
      setError('Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Session</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={!formData.departmentId}
            >
              <option value="">Select Class</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instructor</label>
            <select
              name="instructorId"
              value={formData.instructorId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Instructor</option>
              {instructors.map(instructor => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.firstName} {instructor.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
            <select
              name="academicYearId"
              value={formData.academicYearId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session Date</label>
            <input
              type="date"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session Type</label>
            <select
              name="sessionType"
              value={formData.sessionType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Session Type</option>
              <option value="Cours">Cours</option>
              <option value="TD">TD</option>
              <option value="TP">TP</option>
              <option value="Examen">Examen</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
