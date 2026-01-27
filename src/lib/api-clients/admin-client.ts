import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/config/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

/**
 * Admin Service Client
 * System administration, audit logs, and global management
 */
export class AdminServiceClient {
    // ===== USER MANAGEMENT =====

    static async getAllUsers(token: string) {
        const url = `${BASE_URL}/api/admin/users`;
        return apiGet(url, token, true);
    }

    static async createUser(userData: any, token: string) {
        const url = `${BASE_URL}/api/admin/users`;
        return apiPost(url, userData, token);
    }

    static async updateUser(id: string, userData: any, token: string) {
        const url = `${BASE_URL}/api/admin/users/${id}`;
        return apiPut(url, userData, token);
    }

    static async changeUserRole(id: string, role: string, token: string) {
        const url = `${BASE_URL}/api/admin/users/${id}/role?role=${role}`;
        return apiPatch(url, {}, token);
    }

    static async deleteUser(id: string, token: string) {
        const url = `${BASE_URL}/api/admin/users/${id}`;
        return apiDelete(url, token);
    }

    // ===== AUDIT LOGS =====

    static async getAllAuditLogs(token: string) {
        const url = `${BASE_URL}/api/admin/audit-logs`;
        return apiGet(url, token, true);
    }

    static async getAuditLogsByUser(userId: string, token: string) {
        const url = `${BASE_URL}/api/admin/audit-logs/user/${userId}`;
        return apiGet(url, token, true);
    }

    static async getAuditLogsByAction(action: string, token: string) {
        const url = `${BASE_URL}/api/admin/audit-logs/action/${action}`;
        return apiGet(url, token, true);
    }

    static async getAuditLogsByDateRange(startDate: string, endDate: string, token: string) {
        const url = `${BASE_URL}/api/admin/audit-logs/date-range?startDate=${startDate}&endDate=${endDate}`;
        return apiGet(url, token, true);
    }

    // ===== SYSTEM CONFIGURATION =====

    static async getAllConfigs(token: string) {
        const url = `${BASE_URL}/api/admin/config`;
        return apiGet(url, token, true);
    }

    static async getConfigByKey(key: string, token: string) {
        const url = `${BASE_URL}/api/admin/config/${key}`;
        return apiGet(url, token, true);
    }

    static async updateConfig(key: string, configData: any, token: string) {
        const url = `${BASE_URL}/api/admin/config/${key}`;
        return apiPut(url, configData, token);
    }

    // ===== GLOBAL NOTIFICATIONS =====

    static async broadcastNotification(notificationData: any, token: string) {
        const url = `${BASE_URL}/api/admin/notifications/broadcast`;
        return apiPost(url, notificationData, token);
    }

    static async getScheduledNotifications(token: string) {
        const url = `${BASE_URL}/api/admin/notifications/scheduled`;
        return apiGet(url, token, true);
    }

    // ===== PERMISSIONS =====

    static async getAllPermissions(token: string) {
        const url = `${BASE_URL}/api/admin/permissions`;
        return apiGet(url, token, true);
    }

    static async getPermissionsByRole(role: string, token: string) {
        const url = `${BASE_URL}/api/admin/permissions/role/${role}`;
        return apiGet(url, token, true);
    }

    static async createPermission(permissionData: any, token: string) {
        const url = `${BASE_URL}/api/admin/permissions`;
        return apiPost(url, permissionData, token);
    }

    static async deletePermission(id: string, token: string) {
        const url = `${BASE_URL}/api/admin/permissions/${id}`;
        return apiDelete(url, token);
    }

    // ===== DASHBOARD =====

    /**
     * Get global system statistics
     * Returns: Map<String, Object>
     */
    static async getDashboardStats(token: string) {
        const url = `${BASE_URL}/api/admin/dashboard/stats`;
        return apiGet(url, token, true);
    }

    // ===== BACKUP & RESTORE =====

    static async createBackup(token: string) {
        const url = `${BASE_URL}/api/admin/backup/create`;
        return apiPost(url, {}, token);
    }

    static async listBackups(token: string) {
        const url = `${BASE_URL}/api/admin/backup/list`;
        return apiGet(url, token, true);
    }

    static async restoreBackup(backupId: string, token: string) {
        const url = `${BASE_URL}/api/admin/backup/restore/${backupId}`;
        return apiPost(url, {}, token);
    }
}
