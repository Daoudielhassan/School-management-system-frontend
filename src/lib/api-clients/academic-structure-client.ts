import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '@/config/api';

export class AcademicStructureClient {
  static async getAllAcademicYears(token: string) {
    const response = await apiGet(API_ENDPOINTS.ACADEMIC_YEARS.BASE, token);
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object' && Array.isArray((response as any).content)) {
      return (response as any).content;
    }
    return [];
  }

  static async createAcademicYear(payload: Record<string, unknown>, token: string) {
    return apiPost(API_ENDPOINTS.ACADEMIC_YEARS.BASE, payload, token);
  }

  static async setActiveAcademicYear(id: string, token: string) {
    return apiPut(`${API_ENDPOINTS.ACADEMIC_YEARS.BY_ID(id)}/activate`, {}, token);
  }
}
