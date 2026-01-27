import { apiGet, apiPost, apiPatch, apiDelete } from '@/config/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

/**
 * Notification Service Client
 * System notifications management
 */
export class NotificationServiceClient {
    /**
     * Create a notification
     */
    static async createNotification(notificationData: any, token: string) {
        const url = `${BASE_URL}/api/notifications`;
        return apiPost(url, notificationData, token);
    }

    /**
     * Get all notifications
     */
    static async getAllNotifications(token: string) {
        const url = `${BASE_URL}/api/notifications`;
        return apiGet(url, token, true);
    }

    /**
     * Get notification by ID
     */
    static async getNotificationById(id: string, token: string) {
        const url = `${BASE_URL}/api/notifications/${id}`;
        return apiGet(url, token, true);
    }

    /**
     * Get notifications for a user
     */
    static async getUserNotifications(userId: string, token: string) {
        const url = `${BASE_URL}/api/notifications/user/${userId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get unread notifications
     */
    static async getUnreadNotifications(userId: string, token: string) {
        const url = `${BASE_URL}/api/notifications/user/${userId}/unread`;
        return apiGet(url, token, true);
    }

    /**
     * Get notifications by type
     */
    static async getNotificationsByType(type: string, token: string) {
        const url = `${BASE_URL}/api/notifications/type/${type}`;
        return apiGet(url, token, true);
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id: string, token: string) {
        const url = `${BASE_URL}/api/notifications/${id}/read`;
        return apiPatch(url, {}, token);
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId: string, token: string) {
        const url = `${BASE_URL}/api/notifications/user/${userId}/read-all`;
        return apiPatch(url, {}, token);
    }

    /**
     * Delete notification
     */
    static async deleteNotification(id: string, token: string) {
        const url = `${BASE_URL}/api/notifications/${id}`;
        return apiDelete(url, token);
    }
}
