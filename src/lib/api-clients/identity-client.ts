import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '@/config/api';
import { LoginCredentials, AuthResponse } from '@/types/auth';

/**
 * Identity Service Client
 * Handles authentication and user management
 */
export class IdentityServiceClient {
    /**
     * Login user
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials);
    }

    /**
     * Logout user
     */
    static async logout(token: string): Promise<void> {
        return apiPost(API_ENDPOINTS.AUTH.LOGOUT, {}, token);
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(token: string): Promise<AuthResponse> {
        return apiPost(API_ENDPOINTS.AUTH.REFRESH, {}, token);
    }

    /**
     * Get user by ID
     */
    static async getUserById(id: number, token: string) {
        return apiGet(API_ENDPOINTS.USERS.BY_ID(id), token);
    }

    /**
     * Get all users
     */
    static async getAllUsers(token: string) {
        return apiGet(API_ENDPOINTS.USERS.BASE, token);
    }

    /**
     * Get user statistics
     */
    static async getUserStats(token: string) {
        return apiGet(API_ENDPOINTS.USERS.STATS, token);
    }

    /**
     * Create new user
     */
    static async createUser(userData: any, token: string) {
        return apiPost(API_ENDPOINTS.USERS.BASE, userData, token);
    }

    /**
     * Update user
     */
    static async updateUser(id: number, userData: any, token: string) {
        return apiPut(API_ENDPOINTS.USERS.BY_ID(id), userData, token);
    }

    /**
     * Delete user
     */
    static async deleteUser(id: number, token: string) {
        return apiDelete(API_ENDPOINTS.USERS.BY_ID(id), token);
    }
}
