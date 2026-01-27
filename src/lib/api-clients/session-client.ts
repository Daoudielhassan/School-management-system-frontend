import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

/**
 * Session Service Client
 * Handles course sessions and schedules
 */
export class SessionServiceClient {
    /**
     * Create a session
     */
    static async createSession(sessionData: any, token: string) {
        return apiPost(API_ENDPOINTS.SESSIONS.BASE, sessionData, token);
    }

    /**
     * Get all sessions
     */
    static async getAllSessions(token: string) {
        return apiGet(API_ENDPOINTS.SESSIONS.BASE, token, true);
    }

    /**
     * Get session by ID
     */
    static async getSessionById(id: number | string, token: string) {
        return apiGet(API_ENDPOINTS.SESSIONS.BY_ID(id), token, true);
    }

    /**
     * Get weekly schedule for a class group (list format)
     */
    static async getWeeklySchedule(classGroupId: number | string, date: string | null, token: string) {
        const url = date
            ? `${API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK(classGroupId)}?date=${date}`
            : API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK(classGroupId);
        return apiGet(url, token, true);
    }

    /**
     * Get weekly schedule grouped by day (with caching) ⭐
     * Returns: Map<String, List<Session>>
     */
    static async getWeeklyScheduleGrouped(classGroupId: number | string, date: string | null, token: string) {
        const url = date
            ? `${API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK_GROUPED(classGroupId)}?date=${date}`
            : API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK_GROUPED(classGroupId);
        return apiGet(url, token, true);
    }

    /**
     * Get sessions by instructor
     */
    static async getSessionsByInstructor(instructorId: number | string, token: string) {
        return apiGet(API_ENDPOINTS.SESSIONS.BY_INSTRUCTOR(instructorId), token, true);
    }

    /**
     * Get upcoming sessions for instructor
     */
    static async getUpcomingSessions(instructorId: number | string, token: string) {
        return apiGet(API_ENDPOINTS.SESSIONS.UPCOMING(instructorId), token, true);
    }

    /**
     * Get sessions by instructor and date
     */
    static async getSessionsByInstructorAndDate(instructorId: number | string, date: string, token: string) {
        return apiGet(API_ENDPOINTS.SESSIONS.BY_INSTRUCTOR_AND_DATE(instructorId, date), token, true);
    }

    /**
     * Update session
     */
    static async updateSession(id: number | string, sessionData: any, token: string) {
        return apiPut(API_ENDPOINTS.SESSIONS.BY_ID(id), sessionData, token);
    }

    /**
     * Delete session
     */
    static async deleteSession(id: number | string, token: string) {
        return apiDelete(API_ENDPOINTS.SESSIONS.BY_ID(id), token);
    }
}
