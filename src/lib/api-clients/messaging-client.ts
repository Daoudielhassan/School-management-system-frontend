import { apiGet, apiPost, apiPatch, apiDelete } from '@/config/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

/**
 * Messaging Service Client
 * Internal messaging system
 */
export class MessagingServiceClient {
    /**
     * Create a message
     */
    static async createMessage(messageData: any, token: string) {
        const url = `${BASE_URL}/api/messages`;
        return apiPost(url, messageData, token);
    }

    /**
     * Get all messages
     */
    static async getAllMessages(token: string) {
        const url = `${BASE_URL}/api/messages`;
        return apiGet(url, token, true);
    }

    /**
     * Get message by ID
     */
    static async getMessageById(id: string, token: string) {
        const url = `${BASE_URL}/api/messages/${id}`;
        return apiGet(url, token, true);
    }

    /**
     * Get sent messages
     */
    static async getSentMessages(senderId: string, token: string) {
        const url = `${BASE_URL}/api/messages/sent/${senderId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get received messages
     */
    static async getReceivedMessages(receiverId: string, token: string) {
        const url = `${BASE_URL}/api/messages/received/${receiverId}`;
        return apiGet(url, token, true);
    }

    /**
     * Get unread messages
     */
    static async getUnreadMessages(receiverId: string, token: string) {
        const url = `${BASE_URL}/api/messages/unread/${receiverId}`;
        return apiGet(url, token, true);
    }

    /**
     * Mark message as read
     */
    static async markAsRead(id: string, token: string) {
        const url = `${BASE_URL}/api/messages/${id}/read`;
        return apiPatch(url, {}, token);
    }

    /**
     * Delete message
     */
    static async deleteMessage(id: string, token: string) {
        const url = `${BASE_URL}/api/messages/${id}`;
        return apiDelete(url, token);
    }
}
