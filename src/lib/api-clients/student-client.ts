import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

/**
 * Student Service Client
 * Handles student data and enrollments
 */
export class StudentServiceClient {
    /**
     * Get student by ID
     */
    static async getStudentById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.STUDENTS.BY_ID(id), token, true);
    }

    /**
     * Get student by user ID
     */
    static async getStudentByUserId(userId: number, token: string) {
        return apiGet(API_ENDPOINTS.STUDENTS.BY_USER_ID(userId), token, true);
    }

    /**
     * Get all students
     */
    static async getAllStudents(token: string) {
        return apiGet(API_ENDPOINTS.STUDENTS.BASE, token, true);
    }

    /**
     * Create student
     */
    static async createStudent(studentData: any, token: string) {
        return apiPost(API_ENDPOINTS.STUDENTS.BASE, studentData, token);
    }

    /**
     * Update student
     */
    static async updateStudent(id: number, studentData: any, token: string) {
        return apiPut(API_ENDPOINTS.STUDENTS.BY_ID(id), studentData, token);
    }

    /**
     * Delete student
     */
    static async deleteStudent(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.STUDENTS.BY_ID(id), token);
    }

    /**
     * Bulk upload students
     */
    static async bulkUploadStudents(formData: FormData, token: string) {
        const response = await fetch(API_ENDPOINTS.STUDENTS.BULK_UPLOAD, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type for FormData, browser will set it with boundary
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    }

    // ===== ENROLLMENTS =====

    /**
     * Get enrollment by ID
     */
    static async getEnrollmentById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.ENROLLMENTS.BY_ID(id), token, true);
    }

    /**
     * Get enrollments by student ID
     */
    static async getEnrollmentsByStudent(studentId: number, token: string) {
        return apiGet(API_ENDPOINTS.ENROLLMENTS.BY_STUDENT(studentId), token, true);
    }

    /**
     * Get all enrollments
     */
    static async getAllEnrollments(token: string) {
        return apiGet(API_ENDPOINTS.ENROLLMENTS.BASE, token, true);
    }

    /**
     * Create enrollment
     */
    static async createEnrollment(enrollmentData: any, token: string) {
        return apiPost(API_ENDPOINTS.ENROLLMENTS.BASE, enrollmentData, token);
    }

    /**
     * Update enrollment
     */
    static async updateEnrollment(id: number, enrollmentData: any, token: string) {
        return apiPut(API_ENDPOINTS.ENROLLMENTS.BY_ID(id), enrollmentData, token);
    }

    /**
     * Delete enrollment
     */
    static async deleteEnrollment(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.ENROLLMENTS.BY_ID(id), token);
    }
}
