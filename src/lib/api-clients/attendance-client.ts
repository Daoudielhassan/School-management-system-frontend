import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/config/api';

/**
 * Enhanced Attendance Service Client
 * Includes justification workflow, appeal system, and statistics
 */
export class EnhancedAttendanceClient {
    // ===== BASIC CRUD =====

    static async getAttendanceById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.ATTENDANCE.BY_ID(id), token, true);
    }

    static async getAllAttendance(token: string) {
        return apiGet(API_ENDPOINTS.ATTENDANCE.BASE, token, true);
    }

    static async getAttendanceBySession(sessionId: number, token: string) {
        return apiGet(API_ENDPOINTS.ATTENDANCE.BY_SESSION(sessionId), token, true);
    }

    static async getAttendanceByStudent(studentId: number, token: string) {
        return apiGet(API_ENDPOINTS.ATTENDANCE.BY_STUDENT(studentId), token, true);
    }

    static async getAttendanceByClass(classGroupId: number, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/class/${classGroupId}`;
        return apiGet(url, token, true);
    }

    static async getAttendanceByDate(date: string, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/date/${date}`;
        return apiGet(url, token, true);
    }

    static async getAttendanceByClassAndDate(classGroupId: number, date: string, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/class/${classGroupId}/date/${date}`;
        return apiGet(url, token, true);
    }

    static async createAttendance(attendanceData: any, token: string) {
        return apiPost(API_ENDPOINTS.ATTENDANCE.BASE, attendanceData, token);
    }

    static async updateAttendance(id: number, attendanceData: any, token: string) {
        return apiPut(API_ENDPOINTS.ATTENDANCE.BY_ID(id), attendanceData, token);
    }

    static async bulkUpdateAttendance(attendanceList: any[], token: string) {
        return apiPost(API_ENDPOINTS.ATTENDANCE.BULK_UPDATE, attendanceList, token);
    }

    static async initializeAttendance(sessionId: number, token: string) {
        return apiPost(API_ENDPOINTS.ATTENDANCE.INITIALIZE(sessionId), {}, token);
    }

    static async deleteAttendance(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.ATTENDANCE.BY_ID(id), token);
    }

    // ===== STATISTICS =====

    /**
     * Get attendance statistics for a student
     * Returns: { totalSessions, presentCount, absentCount, lateCount, attendanceRate, pendingValidations }
     */
    static async getStudentStatistics(studentId: number, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/student/${studentId}/statistics`;
        return apiGet(url, token, true);
    }

    /**
     * Get attendance rate for a student in a specific class
     * Returns: Double (percentage)
     */
    static async getAttendanceRate(studentId: number, classGroupId: number, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/student/${studentId}/class/${classGroupId}/rate`;
        return apiGet(url, token, true);
    }

    // ===== JUSTIFICATION WORKFLOW =====

    /**
     * Submit a justification for an absence (Student)
     */
    static async submitJustification(attendanceId: number, justification: string, token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/${attendanceId}/justify`;
        return apiPost(url, { justification }, token);
    }

    /**
     * Get pending absences awaiting validation
     * Optional filters: classGroupId, subjectId
     */
    static async getPendingAbsences(filters: { classGroupId?: number; subjectId?: number } = {}, token: string) {
        let url = `${API_ENDPOINTS.ATTENDANCE.BASE}/pending`;
        const params = new URLSearchParams();
        if (filters.classGroupId) params.append('classGroupId', filters.classGroupId.toString());
        if (filters.subjectId) params.append('subjectId', filters.subjectId.toString());
        if (params.toString()) url += `?${params.toString()}`;
        return apiGet(url, token, true);
    }

    /**
     * Validate or reject an absence (Manager)
     */
    static async validateAbsence(
        attendanceId: number,
        data: {
            validatedBy: string;
            decision: 'VALIDATED' | 'REJECTED';
            managerComment?: string;
        },
        token: string
    ) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/${attendanceId}/validate`;
        return apiPut(url, data, token);
    }

    // ===== APPEAL SYSTEM =====

    /**
     * Submit an appeal for a rejected absence (Student)
     */
    static async submitAppeal(
        attendanceId: number,
        data: {
            appealReason: string;
            submittedBy: string;
        },
        token: string
    ) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/${attendanceId}/appeal`;
        return apiPost(url, data, token);
    }

    /**
     * Get pending appeals
     */
    static async getPendingAppeals(token: string) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/appeals/pending`;
        return apiGet(url, token, true);
    }

    /**
     * Review an appeal (Manager/Admin)
     */
    static async reviewAppeal(
        attendanceId: number,
        data: {
            reviewedBy: string;
            decision: 'APPROVED' | 'REJECTED';
            reviewComment?: string;
        },
        token: string
    ) {
        const url = `${API_ENDPOINTS.ATTENDANCE.BASE}/${attendanceId}/appeal/review`;
        return apiPut(url, data, token);
    }
}
