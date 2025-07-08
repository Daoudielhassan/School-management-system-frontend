import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Subject {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Classe {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
}

interface SessionFormData {
  subjectId: number;
  departmentId: number;
  classId: number;
  instructorId: number;
  sessionDate: string;
  startTime: string;
  roomNumber: string;
  sessionType: string;
}

export default function SessionManagement() {
  const { userId } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SessionFormData>({
    subjectId: 0,
    departmentId: 0,
    classId: 0,
    instructorId: 0,
    sessionDate: '',
    startTime: '',
    roomNumber: '',
    sessionType: 'Cours' // Default value
  });
  

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID not available');
        setLoading(false);
        return;
      }

      try {
        const [subjectsRes, departmentsRes, instructorsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects?userId=${userId}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/departments?userId=${userId}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructors?userId=${userId}`)
        ]);

        setSubjects(subjectsRes.data);
        setDepartments(departmentsRes.data);
        setInstructors(instructorsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Reset dependent field (classId) when departmentId changes
  useEffect(() => {
    if (!formData.departmentId) {
      setClasses([]);
      setFormData(prev => ({ ...prev, classId: 0 }));
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (formData.departmentId && userId) {
      const fetchClasses = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/department/${formData.departmentId}?userId=${userId}`);
          setClasses(response.data);
        } catch (err) {
          setError('Failed to fetch classes');
        }
      };
      fetchClasses();
    }
  }, [formData.departmentId, userId]);

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

    // Convert string to number for numeric fields
    const numericFields = ['subjectId', 'departmentId', 'classId', 'instructorId'];
    const parsedValue = numericFields.includes(name) ? parseInt(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
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
      !formData.instructorId || !formData.sessionDate || !formData.startTime ||
      !formData.roomNumber || !formData.sessionType
    ) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      setError('User ID not available');
      setIsSubmitting(false);
      return;
    }

    try {
      const sessionDataWithUserId = {
        ...formData,
        userId: userId
      };
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, sessionDataWithUserId);
      setSuccess('Session created successfully');
      setFormData({
        subjectId: 0,
        departmentId: 0,
        classId: 0,
        instructorId: 0,
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
