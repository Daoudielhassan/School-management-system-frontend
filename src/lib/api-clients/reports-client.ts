import { apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

/**
 * Reports Service Client (CQRS)
 * Analytics and performance reports
 */
export class ReportsServiceClient {
    // ===== STUDENT PERFORMANCE REPORTS =====

    /**
     * Get performance report for a student
     */
    static async getStudentReport(studentId: string, token: string) {
        const url = `${BASE_URL}/api/reports/students/${studentId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get all student reports
     */
    static async getAllStudentReports(token: string) {
        const url = `${BASE_URL}/api/reports/students`;
        return apiGet(url, token, true);
    }

    /**
     * Refresh student report projections
     */
    static async refreshStudentReports(token: string) {
        const url = `${BASE_URL}/api/reports/students/refresh`;
        return apiPost(url, {}, token);
    }

    // ===== CLASS ANALYTICS REPORTS =====

    /**
     * Get analytics report for a class
     */
    static async getClassReport(classGroupId: string, token: string) {
        const url = `${BASE_URL}/api/reports/classes/${classGroupId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get all class reports
     */
    static async getAllClassReports(token: string) {
        const url = `${BASE_URL}/api/reports/classes`;
        return apiGet(url, token, true);
    }

    /**
     * Refresh class report projections
     */
    static async refreshClassReports(token: string) {
        const url = `${BASE_URL}/api/reports/classes/refresh`;
        return apiPost(url, {}, token);
    }

    // ===== ACADEMIC YEAR REPORTS =====

    /**
     * Get academic year report
     */
    static async getAcademicYearReport(academicYearId: string, token: string) {
        const url = `${BASE_URL}/api/reports/years/${academicYearId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get academic year summary
     */
    static async getAcademicYearSummary(academicYearId: string, token: string) {
        const url = `${BASE_URL}/api/reports/years/${academicYearId}/summary`;
        return apiGet(url, token, true);
    }
}
