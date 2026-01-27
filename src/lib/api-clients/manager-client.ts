import { apiGet, apiPost, apiPut, apiDelete } from '@/config/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

/**
 * Manager Service Client
 * Academic manager operations and validations
 */
export class ManagerServiceClient {
    // ===== MANAGER CRUD =====

    static async createManager(managerData: any, token: string) {
        const url = `${BASE_URL}/api/managers`;
        return apiPost(url, managerData, token);
    }

    static async getAllManagers(token: string) {
        const url = `${BASE_URL}/api/managers`;
        return apiGet(url, token, true);
    }

    static async getManagerById(id: string, token: string) {
        const url = `${BASE_URL}/api/managers/${id}`;
        return apiGet(url, token, true);
    }

    static async getManagerByUserId(userId: string, token: string) {
        const url = `${BASE_URL}/api/managers/user/${userId}`;
        return apiGet(url, token, true);
    }

    static async getManagersByLevel(level: string, token: string) {
        const url = `${BASE_URL}/api/managers/level/${level}`;
        return apiGet(url, token, true);
    }

    static async updateManager(id: string, managerData: any, token: string) {
        const url = `${BASE_URL}/api/managers/${id}`;
        return apiPut(url, managerData, token);
    }

    static async deleteManager(id: string, token: string) {
        const url = `${BASE_URL}/api/managers/${id}`;
        return apiDelete(url, token);
    }

    // ===== ASSIGNMENTS =====

    static async createAssignment(assignmentData: any, token: string) {
        const url = `${BASE_URL}/api/manager-assignments`;
        return apiPost(url, assignmentData, token);
    }

    static async getAllAssignments(token: string) {
        const url = `${BASE_URL}/api/manager-assignments`;
        return apiGet(url, token, true);
    }

    static async getManagerAssignments(managerId: string, token: string) {
        const url = `${BASE_URL}/api/manager-assignments/manager/${managerId}`;
        return apiGet(url, token, true);
    }

    static async getActiveAssignments(token: string) {
        const url = `${BASE_URL}/api/manager-assignments/active`;
        return apiGet(url, token, true);
    }

    static async deleteAssignment(id: string, token: string) {
        const url = `${BASE_URL}/api/manager-assignments/${id}`;
        return apiDelete(url, token);
    }

    // ===== RESPONSIBILITIES =====

    static async createResponsibility(responsibilityData: any, token: string) {
        const url = `${BASE_URL}/api/manager-responsibilities`;
        return apiPost(url, responsibilityData, token);
    }

    static async getManagerResponsibilities(managerId: string, token: string) {
        const url = `${BASE_URL}/api/manager-responsibilities/manager/${managerId}`;
        return apiGet(url, token, true);
    }

    static async updateResponsibilityPermissions(id: string, permissionsData: any, token: string) {
        const url = `${BASE_URL}/api/manager-responsibilities/${id}/permissions`;
        return apiPut(url, permissionsData, token);
    }

    // ===== ACTIONS (Audit) =====

    static async getManagerActions(managerId: string, token: string) {
        const url = `${BASE_URL}/api/manager-actions/manager/${managerId}`;
        return apiGet(url, token, true);
    }

    static async getActionsByType(actionType: string, token: string) {
        const url = `${BASE_URL}/api/manager-actions/type/${actionType}`;
        return apiGet(url, token, true);
    }

    // ===== VALIDATIONS =====

    /**
     * Get pending validations
     * Returns: Map<String, List<?>>
     */
    static async getPendingValidations(token: string) {
        const url = `${BASE_URL}/api/validations/pending`;
        return apiGet(url, token, true);
    }

    /**
     * Validate a grade
     */
    static async validateGrade(gradeValidationData: any, token: string) {
        const url = `${BASE_URL}/api/validations/grade`;
        return apiPost(url, gradeValidationData, token);
    }

    /**
     * Validate an enrollment
     */
    static async validateEnrollment(enrollmentValidationData: any, token: string) {
        const url = `${BASE_URL}/api/validations/enrollment`;
        return apiPost(url, enrollmentValidationData, token);
    }
}
